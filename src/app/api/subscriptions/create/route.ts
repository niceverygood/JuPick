import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { PlanId, PLANS } from "@/lib/plans"

// 플랜별 구독 기간 (일)
const PLAN_DURATIONS: Record<string, number> = {
  basic: 30,
  pro: 30,
  premium: 30,
}

// 연간 구독 기간 (일)
const ANNUAL_DURATION = 365

// 유효한 플랜 ID 검증
function isValidPlanId(planId: string): planId is PlanId {
  return ["basic", "pro", "premium"].includes(planId)
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { planId, billingCycle, amount } = await req.json()

    if (!planId || !billingCycle || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!isValidPlanId(planId)) {
      return NextResponse.json(
        { error: "Invalid plan ID" },
        { status: 400 }
      )
    }

    // 구독 기간 계산
    const duration = billingCycle === "annual" 
      ? ANNUAL_DURATION 
      : PLAN_DURATIONS[planId] || 30

    const now = new Date()
    const endDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000)

    // 기존 활성 구독이 있는지 확인
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        serviceType: "STOCK",
        status: "ACTIVE",
        endDate: { gte: now },
      },
    })

    if (existingSubscription) {
      // 기존 구독이 있으면 연장 또는 업그레이드
      const newEndDate = new Date(existingSubscription.endDate.getTime() + duration * 24 * 60 * 60 * 1000)
      
      // 플랜 업그레이드 체크 (더 높은 플랜으로 변경 가능)
      const planTiers = ["basic", "pro", "premium"]
      const currentPlanIndex = planTiers.indexOf(existingSubscription.planId)
      const newPlanIndex = planTiers.indexOf(planId)
      const shouldUpgrade = newPlanIndex > currentPlanIndex
      
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: { 
          endDate: newEndDate,
          planId: shouldUpgrade ? planId : existingSubscription.planId,
        },
      })

      // 로그 기록
      await prisma.log.create({
        data: {
          type: "SUBSCRIPTION_EXTENDED",
          creatorId: session.user.id,
          targetId: session.user.id,
          serviceType: "STOCK",
          days: duration,
          amount,
          metadata: {
            planId,
            billingCycle,
            previousPlanId: existingSubscription.planId,
            upgraded: shouldUpgrade,
            previousEndDate: existingSubscription.endDate.toISOString(),
            newEndDate: newEndDate.toISOString(),
          },
        },
      })

      return NextResponse.json({
        success: true,
        message: shouldUpgrade ? "구독이 업그레이드되었습니다." : "구독이 연장되었습니다.",
        subscription: {
          id: existingSubscription.id,
          planId: shouldUpgrade ? planId : existingSubscription.planId,
          endDate: newEndDate,
        },
      })
    } else {
      // 새 구독 생성
      const subscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          serviceType: "STOCK",
          status: "ACTIVE",
          planId,
          startDate: now,
          endDate,
          isFreeTest: false,
          createdById: session.user.id,
        },
      })

      // 로그 기록
      await prisma.log.create({
        data: {
          type: "SUBSCRIPTION_CREATED",
          creatorId: session.user.id,
          targetId: session.user.id,
          serviceType: "STOCK",
          days: duration,
          amount,
          metadata: {
            planId,
            planName: PLANS[planId].name,
            billingCycle,
            startDate: now.toISOString(),
            endDate: endDate.toISOString(),
          },
        },
      })

      return NextResponse.json({
        success: true,
        message: "구독이 시작되었습니다.",
        subscription: {
          id: subscription.id,
          planId: subscription.planId,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
        },
      })
    }
  } catch (error) {
    console.error("Subscription creation error:", error)
    return NextResponse.json(
      { error: "구독 처리 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

