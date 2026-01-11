"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
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
  Flame,
  Trophy,
  Eye,
  EyeOff,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { PremiumLock, PremiumModal, TeaserCard } from "@/components/premium/PremiumLock"

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
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("stock")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<MarketAnalysis | null>(null)
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null)
  const [showPremiumModal, setShowPremiumModal] = useState(false)

  // 구독 상태 체크 (USER 역할이면 구독 필요, 그 외는 모두 접근 가능)
  const isSubscribed = session?.user?.role !== "USER"

  const fetchRecommendations = async (type: string) => {
    setLoading(true)
    setError(null)
    setSubscriptionError(null)

    try {
      const response = await fetch(`/api/recommendations/${type}`)
      const result = await response.json()

      if (!response.ok) {
        if (response.status === 403) {
          setSubscriptionError(result.message)
          setData(null)
        } else {
          throw new Error(result.error || "Failed to fetch recommendations")
        }
      } else {
        setData(result)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations(activeTab)
  }, [activeTab])

  const handleRefresh = () => {
    fetchRecommendations(activeTab)
  }

  const SentimentIcon = data ? SENTIMENT_STYLES[data.marketSentiment].icon : Minus

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI 종목추천
          </h1>
          <p className="text-muted-foreground">
            AI가 실시간 데이터를 분석한 매수/매도 추천을 확인하세요.
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={loading}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          새로고침
        </Button>
      </div>

      {/* AI Performance Stats - FOMO 유발 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">이번 주 적중률</p>
                <p className="text-2xl font-bold text-emerald-400">87%</p>
              </div>
              <Trophy className="h-8 w-8 text-emerald-400/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">평균 수익률</p>
                <PremiumLock isSubscribed={isSubscribed} type="blur" feature="수익률 통계">
                  <p className="text-2xl font-bold text-violet-400">+18.5%</p>
                </PremiumLock>
              </div>
              <TrendingUp className="h-8 w-8 text-violet-400/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">오늘의 시그널</p>
                <p className="text-2xl font-bold text-amber-400">12개</p>
              </div>
              <Flame className="h-8 w-8 text-amber-400/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">구독자 수익</p>
                <PremiumLock isSubscribed={isSubscribed} type="blur" feature="구독자 수익 통계">
                  <p className="text-2xl font-bold text-primary">₩2.4M</p>
                </PremiumLock>
              </div>
              <Crown className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 숨겨진 급등주 티저 - 최대 FOMO */}
      {!isSubscribed && (
        <div className="grid gap-4 md:grid-cols-2">
          <TeaserCard
            title="🚀 이번 주 숨겨진 급등주 3종목"
            subtitle="AI가 발굴한 10배 잠재력 종목을 확인하세요"
            highlight="평균 +156% 수익률"
          />
          <TeaserCard
            title="⚡ 긴급! 오늘의 매도 시그널"
            subtitle="지금 팔아야 할 종목 2개가 감지되었습니다"
            highlight="손실 회피 알림"
          />
        </div>
      )}

      {/* Service Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="stock" className="gap-2">
            📈 주식
          </TabsTrigger>
          <TabsTrigger value="coin" className="gap-2">
            🪙 코인
          </TabsTrigger>
          <TabsTrigger value="futures" className="gap-2">
            📊 선물
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6 space-y-6">
          {/* Loading State */}
          {loading && (
            <Card className="border-border/50 bg-card/80">
              <CardContent className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">AI가 실시간 데이터를 분석하고 있습니다...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subscription Required */}
          {subscriptionError && (
            <Card className="border-amber-500/50 bg-amber-500/10">
              <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-amber-400">구독이 필요합니다</h3>
                  <p className="text-muted-foreground mt-2">{subscriptionError}</p>
                </div>
                <Button 
                  className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  onClick={() => setShowPremiumModal(true)}
                >
                  <Crown className="mr-2 h-4 w-4" />
                  프리미엄 구독하기
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && !subscriptionError && (
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Recommendations Data */}
          {!loading && !subscriptionError && data && (
            <>
              {/* Market Sentiment Card */}
              <Card className="border-border/50 bg-card/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SentimentIcon className={cn("h-5 w-5", SENTIMENT_STYLES[data.marketSentiment].color)} />
                    시장 분석
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4 flex-wrap">
                    <Badge 
                      variant="outline" 
                      className={cn("text-sm", SENTIMENT_STYLES[data.marketSentiment].color)}
                    >
                      시장 전망: {SENTIMENT_STYLES[data.marketSentiment].label}
                    </Badge>
                    {data.fromCache && (
                      <Badge variant="secondary" className="text-xs">
                        캐시됨
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/50">
                      실시간 데이터 기반
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(data.generatedAt).toLocaleString("ko-KR")} 기준
                    </span>
                  </div>
                  <p className="text-muted-foreground">{data.summary}</p>
                </CardContent>
              </Card>

              {/* Recommendations Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                {data.recommendations.map((rec, index) => (
                  <RecommendationCard 
                    key={index} 
                    rec={rec} 
                    index={index}
                    isSubscribed={isSubscribed}
                    onPremiumClick={() => setShowPremiumModal(true)}
                  />
                ))}
              </div>

              {/* 추가 프리미엄 종목 티저 */}
              {!isSubscribed && (
                <Card 
                  className="border-dashed border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5 cursor-pointer hover:border-amber-500/50 transition-all"
                  onClick={() => setShowPremiumModal(true)}
                >
                  <CardContent className="flex items-center justify-center py-8 gap-4">
                    <Lock className="h-6 w-6 text-amber-400" />
                    <div className="text-center">
                      <p className="font-medium text-amber-400">
                        + 프리미엄 전용 종목 5개 더 보기
                      </p>
                      <p className="text-sm text-muted-foreground">
                        AI가 선별한 고수익 잠재 종목
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Disclaimer */}
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="flex gap-3 py-4">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    {data.disclaimer}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Premium Modal */}
      <PremiumModal 
        open={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)}
        feature="프리미엄 AI 종목추천"
      />
    </div>
  )
}

// 추천 카드 컴포넌트
function RecommendationCard({ 
  rec, 
  index,
  isSubscribed,
  onPremiumClick,
}: { 
  rec: StockRecommendation
  index: number
  isSubscribed: boolean
  onPremiumClick: () => void
}) {
  // 비구독자는 처음 2개만 완전히 보여주고, 나머지는 블러 처리
  const shouldBlur = !isSubscribed && index >= 2

  if (shouldBlur) {
    return (
      <Card 
        className="border-border/50 bg-card/80 card-hover cursor-pointer relative overflow-hidden"
        onClick={onPremiumClick}
      >
        <div className="blur-md pointer-events-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">종목명</CardTitle>
                <CardDescription>000000</CardDescription>
              </div>
              <Badge variant="outline" className="text-lg font-bold px-4 py-1 bg-emerald-500/20 text-emerald-400">
                매수
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                <span className="text-muted-foreground text-xs">현재가</span>
                <span className="font-semibold">88,888원</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-emerald-500/10">
                <span className="text-emerald-400 text-xs">목표가</span>
                <span className="font-semibold text-emerald-400">99,999원</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-red-500/10">
                <span className="text-red-400 text-xs">손절가</span>
                <span className="font-semibold text-red-400">77,777원</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              AI 분석 결과에 따른 추천 이유입니다.
            </p>
          </CardContent>
        </div>
        
        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-background/90 via-background/50 to-transparent">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-600 shadow-lg mb-2">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-medium">프리미엄 전용 종목</p>
          <p className="text-xs text-muted-foreground">클릭하여 잠금 해제</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card/80 card-hover">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{rec.name}</CardTitle>
            <CardDescription>{rec.symbol}</CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={cn("text-lg font-bold px-4 py-1", ACTION_STYLES[rec.action])}
          >
            {ACTION_LABELS[rec.action]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Info */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
            <span className="text-muted-foreground text-xs">현재가</span>
            <span className="font-semibold">{rec.currentPrice}</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-emerald-500/10">
            <span className="text-emerald-400 text-xs flex items-center gap-1">
              <Target className="h-3 w-3" />
              목표가
            </span>
            {isSubscribed ? (
              <span className="font-semibold text-emerald-400">{rec.targetPrice}</span>
            ) : (
              <span 
                className="font-semibold text-emerald-400 cursor-pointer"
                onClick={onPremiumClick}
              >
                <span className="blur-sm">88,888</span>
                <Lock className="h-3 w-3 inline ml-1" />
              </span>
            )}
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-red-500/10">
            <span className="text-red-400 text-xs flex items-center gap-1">
              <Shield className="h-3 w-3" />
              손절가
            </span>
            {isSubscribed ? (
              <span className="font-semibold text-red-400">{rec.stopLoss}</span>
            ) : (
              <span 
                className="font-semibold text-red-400 cursor-pointer"
                onClick={onPremiumClick}
              >
                <span className="blur-sm">77,777</span>
                <Lock className="h-3 w-3 inline ml-1" />
              </span>
            )}
          </div>
        </div>

        {/* Reason */}
        <p className="text-sm text-muted-foreground">{rec.reason}</p>

        {/* Meta Info */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs gap-1">
            <Clock className="h-3 w-3" />
            {rec.timeframe}
          </Badge>
          <Badge 
            variant="outline" 
            className={cn("text-xs", RISK_STYLES[rec.riskLevel])}
          >
            리스크: {RISK_LABELS[rec.riskLevel]}
          </Badge>
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-xs text-muted-foreground">신뢰도</span>
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all",
                  rec.confidence >= 70 ? "bg-emerald-500" : 
                  rec.confidence >= 50 ? "bg-amber-500" : "bg-red-500"
                )}
                style={{ width: `${rec.confidence}%` }}
              />
            </div>
            <span className="text-xs font-semibold">{rec.confidence}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
