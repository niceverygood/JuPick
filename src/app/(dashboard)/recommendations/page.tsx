"use client"

import { useState, useEffect } from "react"
import { usePlan } from "@/hooks/usePlan"
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  RefreshCw, 
  Lock,
  AlertTriangle,
  Target,
  Shield,
  Clock,
  Sparkles,
  Crown,
  ArrowRight,
  Loader2,
  Coins,
  BarChart3,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface StockRecommendation {
  symbol: string
  name: string
  action: "BUY" | "SELL" | "HOLD"
  currentPrice: string
  targetPrice: string
  stopLoss: string
  confidence: number
  reason: string
  timeframe: string
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  createdAt: string
}

interface MarketAnalysis {
  serviceType: "STOCK" | "COIN" | "COIN_FUTURES"
  marketSentiment: "BULLISH" | "BEARISH" | "NEUTRAL"
  recommendations: StockRecommendation[]
  summary: string
  disclaimer: string
  generatedAt: string
  fromCache?: boolean
}

const ACTION_STYLES = {
  BUY: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
  SELL: "bg-red-500/20 text-red-400 border-red-500/50",
  HOLD: "bg-amber-500/20 text-amber-400 border-amber-500/50",
}

const ACTION_LABELS = {
  BUY: "매수",
  SELL: "매도",
  HOLD: "관망",
}

const SENTIMENT_STYLES = {
  BULLISH: { color: "text-emerald-400", icon: TrendingUp, label: "상승" },
  BEARISH: { color: "text-red-400", icon: TrendingDown, label: "하락" },
  NEUTRAL: { color: "text-amber-400", icon: Minus, label: "중립" },
}

const RISK_STYLES = {
  LOW: "bg-emerald-500/20 text-emerald-400",
  MEDIUM: "bg-amber-500/20 text-amber-400",
  HIGH: "bg-red-500/20 text-red-400",
}

const RISK_LABELS = {
  LOW: "낮음",
  MEDIUM: "보통",
  HIGH: "높음",
}

export default function RecommendationsPage() {
  const { isLoading: planLoading, features, planId, planName, isSubscribed } = usePlan()
  const [activeTab, setActiveTab] = useState("stock")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<MarketAnalysis | null>(null)

  const dailyLimit = features.dailyRecommendationLimit
  const canSeePrecisePrice = features.preciseTargetPrice
  const canSeeStopLoss = features.stopLossPrice

  const fetchRecommendations = async (type: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/recommendations/${type}`)
      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "데이터를 불러오는데 실패했습니다.")
        return
      }

      setData(result)
    } catch (err) {
      setError("네트워크 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!planLoading && isSubscribed) {
      fetchRecommendations(activeTab)
    }
  }, [activeTab, planLoading, isSubscribed])

  if (planLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // 구독하지 않은 경우
  if (!isSubscribed) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI 종목추천
          </h1>
          <p className="text-muted-foreground">
            AI가 분석한 매수/매도 추천 종목을 확인하세요.
          </p>
        </div>

        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20">
              <Crown className="h-10 w-10 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">구독이 필요한 서비스입니다</h2>
            <p className="text-muted-foreground mb-2">
              현재 플랜: <Badge variant="outline">{planName}</Badge>
            </p>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              AI 종목추천은 Basic 플랜 이상에서 이용 가능합니다.
              지금 구독하고 AI의 투자 추천을 받아보세요!
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-violet-600">
              <Link href="/subscriptions">
                구독 시작하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 추천 종목 제한 적용
  const limitedRecommendations = data?.recommendations
    ? dailyLimit === -1
      ? data.recommendations
      : data.recommendations.slice(0, dailyLimit)
    : []

  const hasMoreRecommendations = data?.recommendations && dailyLimit !== -1 && data.recommendations.length > dailyLimit

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI 종목추천
            <Badge className={cn(
              planId === "premium" && "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0",
              planId === "pro" && "bg-primary text-white border-0",
            )}>
              {planName}
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            AI가 분석한 매수/매도 추천 종목을 확인하세요.
            {dailyLimit !== -1 && (
              <span className="ml-2 text-primary">
                (일 {dailyLimit}종목 제한)
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchRecommendations(activeTab)}
          disabled={loading}
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
          새로고침
        </Button>
      </div>

      {/* 업그레이드 안내 (Basic 플랜) */}
      {dailyLimit !== -1 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">더 많은 추천을 원하시나요?</p>
                <p className="text-sm text-muted-foreground">
                  Pro 플랜으로 업그레이드하면 무제한 AI 추천을 받을 수 있습니다.
                </p>
              </div>
            </div>
            <Button asChild size="sm">
              <Link href="/subscriptions">업그레이드</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="stock" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            주식
          </TabsTrigger>
          <TabsTrigger value="coin" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            코인
          </TabsTrigger>
          <TabsTrigger value="futures" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            선물
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 로딩/에러 상태 */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      {/* 시장 분석 */}
      {data && !loading && (
        <>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                시장 전망
                {data.marketSentiment && (
                  <Badge className={cn(
                    "ml-2",
                    SENTIMENT_STYLES[data.marketSentiment].color,
                    data.marketSentiment === "BULLISH" && "bg-emerald-500/20",
                    data.marketSentiment === "BEARISH" && "bg-red-500/20",
                    data.marketSentiment === "NEUTRAL" && "bg-amber-500/20",
                  )}>
                    {SENTIMENT_STYLES[data.marketSentiment].label}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {data.generatedAt && `생성: ${new Date(data.generatedAt).toLocaleString()}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{data.summary}</p>
            </CardContent>
          </Card>

          {/* 추천 종목 목록 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {limitedRecommendations.map((rec, index) => (
              <RecommendationCard
                key={`${rec.symbol}-${index}`}
                recommendation={rec}
                showPrecisePrice={canSeePrecisePrice}
                showStopLoss={canSeeStopLoss}
              />
            ))}
          </div>

          {/* 더 많은 추천이 있는 경우 */}
          {hasMoreRecommendations && (
            <Card className="border-dashed border-primary/30">
              <CardContent className="p-6 text-center">
                <Lock className="h-8 w-8 text-primary mx-auto mb-3" />
                <p className="font-medium mb-2">
                  +{data.recommendations.length - dailyLimit}개 추천 종목이 더 있습니다
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Pro 플랜으로 업그레이드하면 모든 추천을 확인할 수 있습니다.
                </p>
                <Button asChild>
                  <Link href="/subscriptions">플랜 업그레이드</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* 면책조항 */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">{data.disclaimer}</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

interface RecommendationCardProps {
  recommendation: StockRecommendation
  showPrecisePrice: boolean
  showStopLoss: boolean
}

function RecommendationCard({ recommendation, showPrecisePrice, showStopLoss }: RecommendationCardProps) {
  const { name, symbol, action, currentPrice, targetPrice, stopLoss, confidence, reason, timeframe, riskLevel } = recommendation

  return (
    <Card className="border-border/50 hover:border-primary/30 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            <CardDescription>{symbol}</CardDescription>
          </div>
          <Badge className={cn("font-semibold", ACTION_STYLES[action])}>
            {ACTION_LABELS[action]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">현재가</p>
            <p className="font-medium">{currentPrice}</p>
          </div>
          <div>
            <p className="text-muted-foreground">목표가</p>
            {showPrecisePrice ? (
              <p className="font-medium text-emerald-400">{targetPrice}</p>
            ) : (
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="blur-sm">88,888원</span>
                <Lock className="h-3 w-3" />
              </div>
            )}
          </div>
          {showStopLoss && (
            <div>
              <p className="text-muted-foreground">손절가</p>
              <p className="font-medium text-red-400">{stopLoss}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground">신뢰도</p>
            <p className="font-medium">{confidence}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            <Clock className="mr-1 h-3 w-3" />
            {timeframe}
          </Badge>
          <Badge variant="outline" className={cn("text-xs", RISK_STYLES[riskLevel])}>
            <Shield className="mr-1 h-3 w-3" />
            {RISK_LABELS[riskLevel]}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">{reason}</p>
      </CardContent>
    </Card>
  )
}
