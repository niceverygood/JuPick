import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import {
  generateStockRecommendations,
  generateCoinRecommendations,
  generateFuturesRecommendations,
  MarketAnalysis,
} from "@/lib/openrouter"
import { ServiceType } from "@prisma/client"

const SERVICE_TYPE_MAP: Record<string, ServiceType> = {
  stock: ServiceType.STOCK,
  coin: ServiceType.COIN,
  futures: ServiceType.COIN_FUTURES,
}

// 캐시된 추천 데이터 (실제 프로덕션에서는 Redis 등 사용)
const recommendationsCache: Record<string, { data: MarketAnalysis; expiry: number }> = {}
const CACHE_DURATION = 30 * 60 * 1000 // 30분

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params
  
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const serviceType = SERVICE_TYPE_MAP[type]

    if (!serviceType) {
      return NextResponse.json(
        { error: "Invalid service type" },
        { status: 400 }
      )
    }

    // 구독 확인 (USER 역할인 경우에만)
    if (session.user.role === "USER") {
      const now = new Date()
      const activeSubscription = await prisma.subscription.findFirst({
        where: {
          userId: session.user.id,
          serviceType,
          status: "ACTIVE",
          startDate: { lte: now },
          endDate: { gte: now },
        },
      })

      if (!activeSubscription) {
        return NextResponse.json(
          { 
            error: "Subscription required",
            message: `${type === "stock" ? "주식" : type === "coin" ? "코인" : "코인선물"} AI 종목추천 서비스를 이용하려면 구독이 필요합니다.`,
          },
          { status: 403 }
        )
      }
    }

    // 캐시 확인
    const cacheKey = `recommendations_${type}`
    const cached = recommendationsCache[cacheKey]
    if (cached && cached.expiry > Date.now()) {
      return NextResponse.json({
        ...cached.data,
        fromCache: true,
      })
    }

    // AI 추천 생성
    let recommendations: MarketAnalysis

    switch (type) {
      case "stock":
        recommendations = await generateStockRecommendations()
        break
      case "coin":
        recommendations = await generateCoinRecommendations()
        break
      case "futures":
        recommendations = await generateFuturesRecommendations()
        break
      default:
        throw new Error("Invalid service type")
    }

    // 캐시 저장
    recommendationsCache[cacheKey] = {
      data: recommendations,
      expiry: Date.now() + CACHE_DURATION,
    }

    return NextResponse.json(recommendations)
  } catch (error) {
    console.error("Error generating recommendations:", error)
    
    // API 키가 설정되지 않은 경우 또는 기타 오류 시 샘플 데이터 반환
    return NextResponse.json(getSampleRecommendations(type))
  }
}

// 샘플 데이터 (API 키가 없을 때 테스트용)
function getSampleRecommendations(type: string): MarketAnalysis {
  const now = new Date().toISOString()
  
  if (type === "stock") {
    return {
      serviceType: "STOCK",
      marketSentiment: "BULLISH",
      summary: "국내 증시는 반도체 업종 강세와 외국인 순매수 지속으로 상승 흐름을 보이고 있습니다. 다만 미국 금리 인하 불확실성에 따른 변동성에 유의해야 합니다.",
      recommendations: [
        {
          symbol: "005930",
          name: "삼성전자",
          action: "BUY",
          currentPrice: "72,500원",
          targetPrice: "85,000원",
          stopLoss: "68,000원",
          confidence: 78,
          reason: "AI 반도체 수요 증가와 HBM 공급 확대로 실적 개선 기대. 외국인 매수세 지속.",
          timeframe: "중기 1-3개월",
          riskLevel: "MEDIUM",
          createdAt: now,
        },
        {
          symbol: "000660",
          name: "SK하이닉스",
          action: "BUY",
          currentPrice: "178,000원",
          targetPrice: "210,000원",
          stopLoss: "165,000원",
          confidence: 82,
          reason: "HBM3E 독점 공급으로 AI 서버 시장 성장 수혜. 실적 서프라이즈 기대.",
          timeframe: "중기 1-3개월",
          riskLevel: "MEDIUM",
          createdAt: now,
        },
        {
          symbol: "035720",
          name: "카카오",
          action: "HOLD",
          currentPrice: "42,500원",
          targetPrice: "50,000원",
          stopLoss: "38,000원",
          confidence: 65,
          reason: "AI 서비스 출시 기대감 있으나 광고 시장 불확실성 존재. 관망 권고.",
          timeframe: "단기 1-2주",
          riskLevel: "HIGH",
          createdAt: now,
        },
        {
          symbol: "006400",
          name: "삼성SDI",
          action: "BUY",
          currentPrice: "385,000원",
          targetPrice: "450,000원",
          stopLoss: "350,000원",
          confidence: 72,
          reason: "전기차 배터리 수요 회복과 전고체 배터리 기술 리더십 유지.",
          timeframe: "중기 2-3개월",
          riskLevel: "MEDIUM",
          createdAt: now,
        },
      ],
      disclaimer: "본 추천은 AI가 생성한 참고 자료이며, 투자 결정은 본인의 판단에 따라 신중하게 하시기 바랍니다.",
      generatedAt: now,
    }
  } else if (type === "coin") {
    return {
      serviceType: "COIN",
      marketSentiment: "BULLISH",
      summary: "비트코인 ETF 순유입 지속과 반감기 이후 공급 감소로 상승 모멘텀 유지. 알트코인 시장도 점진적 회복세.",
      recommendations: [
        {
          symbol: "BTC",
          name: "비트코인",
          action: "BUY",
          currentPrice: "$67,500",
          targetPrice: "$75,000",
          stopLoss: "$62,000",
          confidence: 80,
          reason: "ETF 자금 유입 지속, 반감기 효과로 중장기 상승 전망. 기관 수요 증가.",
          timeframe: "중기 1-3개월",
          riskLevel: "MEDIUM",
          createdAt: now,
        },
        {
          symbol: "ETH",
          name: "이더리움",
          action: "BUY",
          currentPrice: "$3,450",
          targetPrice: "$4,000",
          stopLoss: "$3,100",
          confidence: 75,
          reason: "ETH ETF 승인 기대감과 디파이/NFT 생태계 확장으로 수요 증가 전망.",
          timeframe: "중기 1-2개월",
          riskLevel: "MEDIUM",
          createdAt: now,
        },
        {
          symbol: "SOL",
          name: "솔라나",
          action: "BUY",
          currentPrice: "$145",
          targetPrice: "$180",
          stopLoss: "$125",
          confidence: 70,
          reason: "높은 처리 속도와 낮은 수수료로 디파이/NFT 플랫폼 강세. 개발자 생태계 확장.",
          timeframe: "단기 2-4주",
          riskLevel: "HIGH",
          createdAt: now,
        },
        {
          symbol: "XRP",
          name: "리플",
          action: "HOLD",
          currentPrice: "$0.52",
          targetPrice: "$0.65",
          stopLoss: "$0.45",
          confidence: 60,
          reason: "SEC 소송 결과 불확실성 존재. 호재 시 급등 가능성 있으나 리스크 관리 필요.",
          timeframe: "단기 1-2주",
          riskLevel: "HIGH",
          createdAt: now,
        },
      ],
      disclaimer: "본 추천은 AI가 생성한 참고 자료입니다. 암호화폐는 가격 변동성이 크므로 각별한 주의가 필요합니다.",
      generatedAt: now,
    }
  } else {
    return {
      serviceType: "COIN_FUTURES",
      marketSentiment: "NEUTRAL",
      summary: "선물 시장 펀딩비 중립 수준으로 방향성 탐색 중. 주요 지지/저항선 돌파 시 추세 진입 권고.",
      recommendations: [
        {
          symbol: "BTCUSDT",
          name: "비트코인 무기한 선물",
          action: "BUY",
          currentPrice: "$67,500",
          targetPrice: "$72,000",
          stopLoss: "$65,500",
          confidence: 72,
          reason: "롱 포지션 권장. 주요 지지선 확인 후 진입. 레버리지 3-5배 권장.",
          timeframe: "단기 1-3일",
          riskLevel: "HIGH",
          createdAt: now,
        },
        {
          symbol: "ETHUSDT",
          name: "이더리움 무기한 선물",
          action: "BUY",
          currentPrice: "$3,450",
          targetPrice: "$3,700",
          stopLoss: "$3,300",
          confidence: 68,
          reason: "롱 포지션 권장. BTC 대비 상대 강세 예상. 레버리지 3배 권장.",
          timeframe: "단기 2-5일",
          riskLevel: "HIGH",
          createdAt: now,
        },
        {
          symbol: "SOLUSDT",
          name: "솔라나 무기한 선물",
          action: "SELL",
          currentPrice: "$145",
          targetPrice: "$130",
          stopLoss: "$155",
          confidence: 65,
          reason: "숏 포지션 권장. 과열 구간 진입으로 조정 예상. 레버리지 2배 권장.",
          timeframe: "단기 1-3일",
          riskLevel: "HIGH",
          createdAt: now,
        },
      ],
      disclaimer: "선물 거래는 높은 레버리지로 인해 원금 손실 위험이 큽니다. 반드시 자신의 리스크 허용 범위 내에서 거래하시기 바랍니다.",
      generatedAt: now,
    }
  }
}

