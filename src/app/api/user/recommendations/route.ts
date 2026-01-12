// src/app/api/user/recommendations/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { 
  PLAN_LIMITS, 
  getRemainingRecommendations, 
  getTodayStart,
  PlanType 
} from '@/lib/planLimits'

// 추천 목록 조회
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        plan: true, 
        dailyRecommendations: true,
        lastRecommendationDate: true 
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 오늘 날짜 체크 (일일 카운트 리셋)
    const today = getTodayStart()
    const lastDate = user.lastRecommendationDate
    const usedToday = lastDate && lastDate >= today ? user.dailyRecommendations : 0
    
    const plan = user.plan as PlanType
    const remaining = getRemainingRecommendations(plan, usedToday)
    const limit = PLAN_LIMITS[plan].dailyRecommendations

    // 추천 목록 조회
    const recommendations = await prisma.stockRecommendation.findMany({
      where: {
        userId: session.user.id,
        expiresAt: { gte: new Date() }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // Pro 미만은 손절가 제거
    const planFeatures = PLAN_LIMITS[plan].features
    const filteredRecommendations = recommendations.map(rec => ({
      ...rec,
      stopLoss: planFeatures.preciseTargetPrice ? rec.stopLoss : null
    }))

    return NextResponse.json({
      recommendations: filteredRecommendations,
      remaining: remaining === Infinity ? -1 : remaining, // -1은 무제한
      limit: limit === Infinity ? -1 : limit,
      usedToday,
      showStopLoss: planFeatures.preciseTargetPrice
    })

  } catch (error) {
    console.error('Recommendations GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 새 추천 요청
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const plan = user.plan as PlanType

    // 일일 사용량 체크
    const today = getTodayStart()
    const lastDate = user.lastRecommendationDate
    const usedToday = lastDate && lastDate >= today ? user.dailyRecommendations : 0
    
    const remaining = getRemainingRecommendations(plan, usedToday)

    if (remaining <= 0) {
      return NextResponse.json({ 
        error: 'Daily limit reached',
        message: '오늘의 AI 추천 횟수를 모두 사용했습니다. 플랜을 업그레이드하세요!',
        upgradeRequired: true,
        requiredPlan: getNextPlan(plan)
      }, { status: 403 })
    }

    // AI 추천 생성
    const recommendation = await generateAIRecommendation(plan)

    // 사용량 업데이트
    await prisma.user.update({
      where: { id: user.id },
      data: {
        dailyRecommendations: lastDate && lastDate >= today ? user.dailyRecommendations + 1 : 1,
        lastRecommendationDate: new Date()
      }
    })

    // DB 저장
    const saved = await prisma.stockRecommendation.create({
      data: {
        userId: user.id,
        ...recommendation
      }
    })

    return NextResponse.json({
      recommendation: saved,
      remaining: remaining === Infinity ? -1 : remaining - 1
    })

  } catch (error) {
    console.error('Recommendations POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// AI 추천 생성 함수
async function generateAIRecommendation(plan: PlanType) {
  // 실제 구현 시 AI 모델 API 호출
  const mockStocks = [
    { code: '005930', name: '삼성전자', price: 72300 },
    { code: '000660', name: 'SK하이닉스', price: 142500 },
    { code: '035420', name: 'NAVER', price: 215000 },
    { code: '035720', name: '카카오', price: 52800 },
    { code: '373220', name: 'LG에너지솔루션', price: 385000 },
    { code: '006400', name: '삼성SDI', price: 412000 },
    { code: '051910', name: 'LG화학', price: 382000 },
    { code: '207940', name: '삼성바이오로직스', price: 785000 },
    { code: '068270', name: '셀트리온', price: 175000 },
    { code: '005380', name: '현대차', price: 215000 },
  ]

  const stock = mockStocks[Math.floor(Math.random() * mockStocks.length)]
  const targetMultiplier = 1 + (Math.random() * 0.15 + 0.05) // 5-20% 상승 목표
  const stopLossMultiplier = 1 - (Math.random() * 0.05 + 0.03) // 3-8% 손절

  const planFeatures = PLAN_LIMITS[plan].features
  const categories = ['급등주', '가치주', '성장주', '배당주', 'AI관련주', '반도체']
  const reasons = [
    `기술적 지지선 돌파로 상승 모멘텀 확보. 외국인 순매수 급증 중.`,
    `실적 호전 기대감과 함께 목표가 상향 조정 중. 기관 매집 포착.`,
    `AI 반도체 수요 증가 수혜주. HBM 공급 확대로 실적 개선 전망.`,
    `밸류에이션 매력 부각. PER 저평가 구간 진입으로 매수 기회.`,
    `신규 사업 진출 기대감. 신성장 동력 확보로 주가 재평가 예상.`,
  ]

  return {
    stockCode: stock.code,
    stockName: stock.name,
    currentPrice: stock.price,
    targetPrice: Math.round(stock.price * targetMultiplier),
    stopLoss: planFeatures.preciseTargetPrice 
      ? Math.round(stock.price * stopLossMultiplier) 
      : null,
    reason: reasons[Math.floor(Math.random() * reasons.length)],
    confidence: Math.round(Math.random() * 30 + 60), // 60-90%
    category: categories[Math.floor(Math.random() * categories.length)],
    isHotStock: false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7일 후 만료
  }
}

function getNextPlan(currentPlan: PlanType): PlanType {
  const plans: PlanType[] = ['FREE', 'BASIC', 'PRO', 'PREMIUM']
  const currentIndex = plans.indexOf(currentPlan)
  return currentIndex < plans.length - 1 ? plans[currentIndex + 1] : 'PREMIUM'
}


