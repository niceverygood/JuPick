// src/app/api/payment/route.ts
// 결제 완료 처리 및 검증 API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { PORTONE_CONFIG, SUBSCRIPTION_PLANS } from '@/lib/portone'

// 포트원 V2 API URL
const PORTONE_API_URL = 'https://api.portone.io'

interface PaymentVerifyRequest {
  paymentId: string
  planId: string
}

// 결제 검증 (포트원 API 호출)
async function verifyPayment(paymentId: string) {
  const response = await fetch(`${PORTONE_API_URL}/payments/${encodeURIComponent(paymentId)}`, {
    method: 'GET',
    headers: {
      'Authorization': `PortOne ${PORTONE_CONFIG.apiSecret}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Payment verification failed')
  }

  return response.json()
}

// POST: 결제 완료 처리
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { paymentId, planId } = await req.json() as PaymentVerifyRequest

    if (!paymentId || !planId) {
      return NextResponse.json(
        { error: 'paymentId and planId are required' },
        { status: 400 }
      )
    }

    // 플랜 유효성 확인
    const plan = SUBSCRIPTION_PLANS[planId.toUpperCase() as keyof typeof SUBSCRIPTION_PLANS]
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // 포트원에서 결제 정보 검증
    const paymentData = await verifyPayment(paymentId)
    
    // 결제 상태 확인
    if (paymentData.status !== 'PAID') {
      return NextResponse.json(
        { error: 'Payment not completed', status: paymentData.status },
        { status: 400 }
      )
    }

    // 결제 금액 검증
    if (paymentData.amount.total !== plan.price) {
      return NextResponse.json(
        { error: 'Payment amount mismatch' },
        { status: 400 }
      )
    }

    // 구독 시작일/종료일 계산
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1) // 1개월 구독

    // 기존 활성 구독 확인 및 처리
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
    })

    // 트랜잭션으로 구독 생성 및 유저 플랜 업데이트
    await prisma.$transaction(async (tx) => {
      // 기존 구독이 있으면 만료 처리
      if (existingSubscription) {
        await tx.subscription.update({
          where: { id: existingSubscription.id },
          data: { status: 'EXPIRED' },
        })
      }

      // 새 구독 생성
      await tx.subscription.create({
        data: {
          userId: session.user.id,
          serviceType: 'STOCK',
          status: 'ACTIVE',
          planId: planId.toLowerCase(),
          startDate,
          endDate,
          createdById: session.user.id,
        },
      })

      // 유저 플랜 업데이트
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          plan: planId.toUpperCase() as 'BASIC' | 'PRO' | 'PREMIUM',
          planExpiresAt: endDate,
        },
      })

      // 결제 로그 기록
      await tx.log.create({
        data: {
          type: 'SUBSCRIPTION_CREATED',
          creatorId: session.user.id,
          targetId: session.user.id,
          metadata: {
            paymentId,
            planId,
            amount: plan.price,
            transactionId: paymentData.txId,
            paidAt: paymentData.paidAt,
          },
        },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
      subscription: {
        planId,
        planName: plan.name,
        startDate,
        endDate,
      },
    })
  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment processing failed' },
      { status: 500 }
    )
  }
}

// GET: 결제 상태 조회
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return NextResponse.json(
        { error: 'paymentId is required' },
        { status: 400 }
      )
    }

    const paymentData = await verifyPayment(paymentId)

    return NextResponse.json({
      paymentId: paymentData.paymentId,
      status: paymentData.status,
      amount: paymentData.amount?.total,
      paidAt: paymentData.paidAt,
    })
  } catch (error) {
    console.error('Payment status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    )
  }
}


