// src/app/api/user/signals/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { canUseFeature, PLAN_LIMITS, PlanType } from '@/lib/planLimits'

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

    // 기능 사용 가능 여부 체크
    if (!canUseFeature(plan, 'realTimeSignal')) {
      return NextResponse.json({ 
        error: 'Feature not available',
        message: '실시간 시그널은 Pro 플랜 이상에서 이용 가능합니다.',
        upgradeRequired: true,
        requiredPlan: 'PRO',
        // 미리보기 데이터 (블러 처리용)
        preview: [
          { stockName: '???', signalType: 'BUY', isLocked: true },
          { stockName: '???', signalType: 'SELL', isLocked: true },
          { stockName: '???', signalType: 'BUY', isLocked: true },
        ]
      }, { status: 403 })
    }

    // 시그널 목록 조회
    let signals = await prisma.signal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // 시그널이 없으면 새로 생성 (데모용)
    if (signals.length === 0) {
      signals = await generateDemoSignals(session.user.id, plan)
    }

    // 읽지 않은 시그널 수
    const unreadCount = await prisma.signal.count({
      where: { 
        userId: session.user.id,
        isRead: false 
      }
    })

    // 오늘 시그널 통계
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayStats = await prisma.signal.groupBy({
      by: ['signalType'],
      where: {
        userId: session.user.id,
        createdAt: { gte: today }
      },
      _count: true
    })

    const buyCount = todayStats.find(s => s.signalType === 'BUY')?._count || 0
    const sellCount = todayStats.find(s => s.signalType === 'SELL')?._count || 0
    const alertCount = todayStats.find(s => s.signalType === 'ALERT')?._count || 0

    return NextResponse.json({
      signals,
      unreadCount,
      todayStats: {
        buy: buyCount,
        sell: sellCount,
        alert: alertCount,
        total: buyCount + sellCount + alertCount
      }
    })

  } catch (error) {
    console.error('Signals GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 시그널 읽음 처리
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { signalIds } = await req.json()

    if (!signalIds || !Array.isArray(signalIds)) {
      return NextResponse.json({ error: 'Invalid signal IDs' }, { status: 400 })
    }

    await prisma.signal.updateMany({
      where: {
        id: { in: signalIds },
        userId: session.user.id
      },
      data: { isRead: true }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Signals PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 데모 시그널 생성
async function generateDemoSignals(userId: string, plan: PlanType) {
  const planFeatures = PLAN_LIMITS[plan].features
  
  const signalData = [
    {
      stockCode: '005930',
      stockName: '삼성전자',
      signalType: 'BUY' as const,
      price: 72500,
      targetPrice: 85000,
      stopLoss: planFeatures.preciseTargetPrice ? 68000 : null,
      reason: '기술적 지지선 돌파, 외국인 순매수 급증. AI 반도체 수요 증가 기대.',
    },
    {
      stockCode: '000660',
      stockName: 'SK하이닉스',
      signalType: 'BUY' as const,
      price: 180000,
      targetPrice: 210000,
      stopLoss: planFeatures.preciseTargetPrice ? 170000 : null,
      reason: 'HBM3E 공급 확대 기대감. 삼성전자 대비 밸류에이션 매력.',
    },
    {
      stockCode: '035720',
      stockName: '카카오',
      signalType: 'SELL' as const,
      price: 52000,
      targetPrice: 48000,
      stopLoss: planFeatures.preciseTargetPrice ? 54000 : null,
      reason: '단기 과열 구간 진입. 차익 실현 매물 출회 예상.',
    },
    {
      stockCode: '005380',
      stockName: '현대차',
      signalType: 'BUY' as const,
      price: 220000,
      targetPrice: 250000,
      stopLoss: planFeatures.preciseTargetPrice ? 210000 : null,
      reason: '신차 효과 및 전기차 전환 기대감. 실적 서프라이즈 가능성.',
    },
    {
      stockCode: '035420',
      stockName: 'NAVER',
      signalType: 'ALERT' as const,
      price: 215000,
      targetPrice: null,
      stopLoss: null,
      reason: '중요 지지선 테스트 중. 추가 하락 시 매수 기회 포착 필요.',
    },
  ]

  const signals = await Promise.all(
    signalData.map((data, index) => 
      prisma.signal.create({
        data: {
          userId,
          ...data,
          isRead: false,
          createdAt: new Date(Date.now() - index * 10 * 60 * 1000) // 10분 간격
        }
      })
    )
  )

  return signals
}


