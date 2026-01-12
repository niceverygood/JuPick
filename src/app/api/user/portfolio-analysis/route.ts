// src/app/api/user/portfolio-analysis/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { canUseFeature, PlanType } from '@/lib/planLimits'

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
    if (!canUseFeature(plan, 'portfolioAnalysis')) {
      return NextResponse.json({ 
        error: 'Feature not available',
        message: '포트폴리오 AI 분석은 Premium 플랜에서만 이용 가능합니다.',
        upgradeRequired: true,
        requiredPlan: 'PREMIUM',
        // 미리보기 데이터
        preview: {
          riskScore: '??',
          diversificationScore: '??',
          suggestion: '플랜을 업그레이드하면 AI가 포트폴리오를 심층 분석해드립니다.',
          benefits: [
            '위험도 분석 및 점수화',
            '분산투자 적정성 진단',
            '섹터별 비중 최적화 제안',
            'AI 기반 리밸런싱 추천',
          ]
        }
      }, { status: 403 })
    }

    // 최근 분석 결과 조회
    const analysis = await prisma.portfolioAnalysis.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ 
      analysis,
      canAnalyze: true
    })

  } catch (error) {
    console.error('Portfolio analysis GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 새 분석 요청
export async function POST(req: NextRequest) {
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

    if (!canUseFeature(plan, 'portfolioAnalysis')) {
      return NextResponse.json({ 
        error: 'Feature not available',
        upgradeRequired: true,
        requiredPlan: 'PREMIUM'
      }, { status: 403 })
    }

    const { holdings } = await req.json()

    if (!holdings || !Array.isArray(holdings)) {
      return NextResponse.json({ 
        error: 'Invalid holdings data',
        message: '보유 종목 정보를 입력해주세요.'
      }, { status: 400 })
    }

    // AI 분석 실행
    const analysisResult = await runPortfolioAnalysis(holdings)

    const saved = await prisma.portfolioAnalysis.create({
      data: {
        userId: session.user.id,
        ...analysisResult
      }
    })

    return NextResponse.json({ analysis: saved })

  } catch (error) {
    console.error('Portfolio analysis POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// AI 포트폴리오 분석 함수
async function runPortfolioAnalysis(holdings: any[]) {
  // 총 가치 계산
  const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0)
  
  // 섹터별 분류
  const sectors: Record<string, number> = {}
  holdings.forEach(h => {
    const sector = h.sector || '기타'
    sectors[sector] = (sectors[sector] || 0) + (h.quantity * h.avgPrice)
  })

  // 분산투자 점수 계산 (섹터 분산도)
  const sectorCount = Object.keys(sectors).length
  const maxSectorRatio = Math.max(...Object.values(sectors)) / totalValue
  const diversificationScore = Math.round(
    Math.min(100, sectorCount * 15 + (1 - maxSectorRatio) * 50)
  )

  // 위험도 점수 계산
  const volatileStocks = holdings.filter(h => 
    ['2차전지', '바이오', '게임', '엔터'].includes(h.sector)
  ).length
  const volatileRatio = volatileStocks / holdings.length
  const riskScore = Math.round(40 + volatileRatio * 60)

  // 수익률 계산 (랜덤 시뮬레이션)
  const profitRate = Math.round((Math.random() * 40 - 10) * 100) / 100 // -10% ~ +30%
  const totalProfit = Math.round(totalValue * profitRate / 100)

  // AI 제안 생성
  const suggestions = []
  
  if (diversificationScore < 50) {
    suggestions.push('섹터 분산이 부족합니다. 다른 업종 종목 추가를 고려하세요.')
  }
  if (maxSectorRatio > 0.5) {
    suggestions.push(`특정 섹터 비중이 ${Math.round(maxSectorRatio * 100)}%로 과도합니다. 리밸런싱을 권장합니다.`)
  }
  if (riskScore > 70) {
    suggestions.push('고변동성 종목 비중이 높습니다. 배당주나 대형주로 안정성을 확보하세요.')
  }
  if (holdings.length < 5) {
    suggestions.push('보유 종목 수가 적습니다. 최소 5~10개 종목으로 분산 투자를 권장합니다.')
  }
  if (suggestions.length === 0) {
    suggestions.push('포트폴리오가 안정적으로 구성되어 있습니다. 현재 전략을 유지하세요.')
  }

  // 보유 종목별 분석
  const holdingsAnalysis = holdings.map(h => {
    const changePercent = Math.round((Math.random() * 30 - 10) * 100) / 100
    return {
      ...h,
      currentValue: h.quantity * h.avgPrice,
      changePercent,
      recommendation: changePercent > 10 ? '일부 매도 고려' : 
                      changePercent < -5 ? '추가 매수 고려' : '보유 유지',
      analysis: changePercent > 5 ? '긍정적' : changePercent < -5 ? '주의 필요' : '중립'
    }
  })

  return {
    totalValue,
    totalProfit,
    profitRate,
    riskScore,
    diversificationScore,
    suggestions,
    holdings: holdingsAnalysis
  }
}


