// src/app/api/user/hot-stocks/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { 
  PLAN_LIMITS, 
  canUseFeature, 
  getRemainingHotStocks,
  getWeekStart,
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
      select: {
        plan: true,
        weeklyHotStocks: true,
        lastHotStockDate: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const plan = user.plan as PlanType

    // 기능 사용 가능 여부 체크
    if (!canUseFeature(plan, 'hotStocks')) {
      return NextResponse.json({ 
        error: 'Feature not available',
        message: '숨겨진 급등주는 Pro 플랜 이상에서 이용 가능합니다.',
        upgradeRequired: true,
        requiredPlan: 'PRO',
        // 미리보기 데이터 (블러 처리용)
        preview: generatePreviewHotStocks()
      }, { status: 403 })
    }

    // 주간 사용량 체크
    const weekStart = getWeekStart()
    const lastDate = user.lastHotStockDate
    const usedThisWeek = lastDate && lastDate >= weekStart ? user.weeklyHotStocks : 0
    
    const remaining = getRemainingHotStocks(plan, usedThisWeek)
    const limit = PLAN_LIMITS[plan].weeklyHotStocks

    // 급등주 목록 조회 (실제로는 AI가 생성한 급등주 목록)
    const hotStocks = await prisma.stockRecommendation.findMany({
      where: {
        isHotStock: true,
        expiresAt: { gte: new Date() }
      },
      orderBy: { confidence: 'desc' },
      take: remaining === Infinity ? 20 : Math.min(remaining, 20)
    })

    // 급등주가 없으면 새로 생성
    let result = hotStocks
    if (hotStocks.length === 0) {
      result = await generateHotStocks(session.user.id, plan)
    }

    // 사용량 업데이트
    if (result.length > 0) {
      const viewedCount = Math.min(result.length, remaining === Infinity ? result.length : remaining)
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          weeklyHotStocks: lastDate && lastDate >= weekStart 
            ? user.weeklyHotStocks + viewedCount 
            : viewedCount,
          lastHotStockDate: new Date()
        }
      })
    }

    return NextResponse.json({
      hotStocks: result,
      remaining: remaining === Infinity ? -1 : Math.max(0, remaining - result.length),
      limit: limit === Infinity ? -1 : limit,
      usedThisWeek
    })

  } catch (error) {
    console.error('Hot stocks GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 급등주 생성 함수
async function generateHotStocks(userId: string, plan: PlanType) {
  const planFeatures = PLAN_LIMITS[plan].features
  
  const hotStockCandidates = [
    { code: '000270', name: '기아', price: 95800, reason: '전기차 수출 호조로 역대 최고 실적 예상. 밸류에이션 매력 부각.' },
    { code: '003670', name: '포스코퓨처엠', price: 298000, reason: '2차전지 양극재 시장 점유율 확대. 대규모 투자 발표 예정.' },
    { code: '247540', name: '에코프로비엠', price: 195000, reason: '테슬라향 공급 확대 기대. 캐파 증설로 실적 점프 전망.' },
    { code: '086520', name: '에코프로', price: 485000, reason: '2차전지 소재 대장주. 계열사 실적 호조로 동반 상승 기대.' },
    { code: '012450', name: '한화에어로스페이스', price: 125000, reason: '방산 수출 확대 및 우주 산업 진출로 성장 모멘텀 확보.' },
    { code: '009150', name: '삼성전기', price: 148000, reason: 'MLCC 업황 회복 기대. AI 서버향 수요 증가로 수혜 전망.' },
    { code: '028260', name: '삼성물산', price: 142000, reason: '건설 및 리조트 부문 실적 개선. 저평가 해소 기대.' },
    { code: '018260', name: '삼성에스디에스', price: 165000, reason: 'AI 클라우드 사업 성장. IT서비스 업황 호조 지속.' },
  ]

  const selectedStocks = hotStockCandidates
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)

  const hotStocks = await Promise.all(
    selectedStocks.map(async (stock) => {
      const targetMultiplier = 1 + (Math.random() * 0.30 + 0.15) // 15-45% 급등 예상
      const stopLossMultiplier = 1 - (Math.random() * 0.08 + 0.05) // 5-13% 손절

      return prisma.stockRecommendation.create({
        data: {
          userId,
          stockCode: stock.code,
          stockName: stock.name,
          currentPrice: stock.price,
          targetPrice: Math.round(stock.price * targetMultiplier),
          stopLoss: planFeatures.preciseTargetPrice 
            ? Math.round(stock.price * stopLossMultiplier) 
            : null,
          reason: stock.reason,
          confidence: Math.round(Math.random() * 15 + 80), // 80-95% 높은 확신도
          category: '급등주',
          isHotStock: true,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })
    })
  )

  return hotStocks
}

// 미리보기 급등주 (블러 처리용)
function generatePreviewHotStocks() {
  return [
    { stockName: '???', potentialReturn: '+38%', isLocked: true },
    { stockName: '???', potentialReturn: '+25%', isLocked: true },
    { stockName: '???', potentialReturn: '+42%', isLocked: true },
  ]
}


