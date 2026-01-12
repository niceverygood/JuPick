import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { PLANS, PlanId, getPlanFeatures } from "@/lib/plans"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 관리자 역할 체크
    if (["MASTER", "DISTRIBUTOR", "AGENCY"].includes(session.user.role)) {
      const adminPlan = PLANS.admin
      return NextResponse.json({
        isSubscribed: true,
        planId: "admin" as PlanId,
        planName: adminPlan.name,
        features: adminPlan.features,
        endDate: null,
        daysRemaining: 999,
      })
    }

    const now = new Date()

    // 활성 구독 확인
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        serviceType: "STOCK",
        status: "ACTIVE",
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { endDate: "desc" },
    })

    if (!activeSubscription) {
      const freePlan = PLANS.free
      return NextResponse.json({
        isSubscribed: false,
        planId: "free" as PlanId,
        planName: freePlan.name,
        features: freePlan.features,
        endDate: null,
        daysRemaining: 0,
      })
    }

    // 남은 일수 계산
    const daysRemaining = Math.ceil(
      (activeSubscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    const planId = (activeSubscription.planId || "basic") as PlanId
    const plan = PLANS[planId] || PLANS.basic

    return NextResponse.json({
      isSubscribed: true,
      planId,
      planName: plan.name,
      features: plan.features,
      startDate: activeSubscription.startDate,
      endDate: activeSubscription.endDate,
      daysRemaining,
    })
  } catch (error) {
    console.error("Subscription status error:", error)
    return NextResponse.json(
      { error: "구독 상태 확인 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
