// src/app/api/user/consultations/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { 
  canUseFeature, 
  getRemainingConsultations, 
  getMonthStart,
  PLAN_LIMITS,
  PlanType 
} from '@/lib/planLimits'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const plan = user.plan as PlanType

    if (!canUseFeature(plan, 'expertConsultation')) {
      return NextResponse.json({ 
        error: 'Feature not available',
        message: '전문가 상담은 Premium 플랜에서만 이용 가능합니다.',
        upgradeRequired: true,
        requiredPlan: 'PREMIUM',
        benefits: [
          '1:1 전문가 화상 상담',
          '포트폴리오 심층 리뷰',
          '맞춤형 투자 전략 수립',
          '실시간 Q&A 지원',
        ]
      }, { status: 403 })
    }

    // 월간 사용량 체크
    const monthStart = getMonthStart()
    
    const usedThisMonth = await prisma.consultation.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: monthStart }
      }
    })

    const remaining = getRemainingConsultations(plan, usedThisMonth)
    const limit = PLAN_LIMITS[plan].monthlyConsultations

    const consultations = await prisma.consultation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    return NextResponse.json({
      consultations,
      remaining,
      limit,
      usedThisMonth,
      canBook: remaining > 0
    })

  } catch (error) {
    console.error('Consultations GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 상담 신청
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, name: true, email: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const plan = user.plan as PlanType

    if (!canUseFeature(plan, 'expertConsultation')) {
      return NextResponse.json({ 
        error: 'Feature not available',
        upgradeRequired: true,
        requiredPlan: 'PREMIUM'
      }, { status: 403 })
    }

    // 월간 사용량 체크
    const monthStart = getMonthStart()
    
    const usedThisMonth = await prisma.consultation.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: monthStart }
      }
    })

    const remaining = getRemainingConsultations(plan, usedThisMonth)

    if (remaining <= 0) {
      return NextResponse.json({ 
        error: 'Monthly limit reached',
        message: '이번 달 상담 횟수를 모두 사용했습니다. 다음 달에 다시 이용해주세요.'
      }, { status: 403 })
    }

    const { question, preferredDate, contactMethod } = await req.json()

    if (!question || question.trim().length < 10) {
      return NextResponse.json({ 
        error: 'Invalid question',
        message: '상담 내용을 10자 이상 입력해주세요.'
      }, { status: 400 })
    }

    const consultation = await prisma.consultation.create({
      data: {
        userId: session.user.id,
        question: question.trim(),
        scheduledAt: preferredDate ? new Date(preferredDate) : null,
        status: 'PENDING'
      }
    })

    // 관리자에게 알림 발송 로직 (실제 구현 시)
    // await sendAdminNotification({ consultation, user })

    return NextResponse.json({
      consultation,
      remaining: remaining - 1,
      message: '상담 신청이 완료되었습니다. 담당자가 확인 후 연락드리겠습니다.'
    })

  } catch (error) {
    console.error('Consultations POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 상담 취소
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const consultationId = searchParams.get('id')

    if (!consultationId) {
      return NextResponse.json({ error: 'Consultation ID required' }, { status: 400 })
    }

    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId }
    })

    if (!consultation || consultation.userId !== session.user.id) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 })
    }

    if (consultation.status !== 'PENDING') {
      return NextResponse.json({ 
        error: 'Cannot cancel',
        message: '진행 중이거나 완료된 상담은 취소할 수 없습니다.'
      }, { status: 400 })
    }

    await prisma.consultation.update({
      where: { id: consultationId },
      data: { status: 'CANCELLED' }
    })

    return NextResponse.json({ 
      success: true,
      message: '상담이 취소되었습니다.'
    })

  } catch (error) {
    console.error('Consultations DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


