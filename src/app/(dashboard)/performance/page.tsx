"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Sparkles,
  Lock,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { PremiumLock, PremiumModal } from "@/components/premium/PremiumLock"

// 과거 추천 데이터 (실제로는 DB에서 가져옴)
const PAST_RECOMMENDATIONS = [
  {
    id: 1,
    date: "2026-01-10",
    name: "삼성전자",
    symbol: "005930",
    action: "BUY",
    entryPrice: 71500,
    targetPrice: 82000,
    currentPrice: 78500,
    status: "WIN",
    returnRate: 9.79,
  },
  {
    id: 2,
    date: "2026-01-09",
    name: "SK하이닉스",
    symbol: "000660",
    action: "BUY",
    entryPrice: 172000,
    targetPrice: 195000,
    currentPrice: 189500,
    status: "WIN",
    returnRate: 10.17,
  },
  {
    id: 3,
    date: "2026-01-08",
    name: "카카오",
    symbol: "035720",
    action: "SELL",
    entryPrice: 45000,
    targetPrice: 38000,
    currentPrice: 39500,
    status: "WIN",
    returnRate: 12.22,
  },
  {
    id: 4,
    date: "2026-01-07",
    name: "네이버",
    symbol: "035420",
    action: "BUY",
    entryPrice: 185000,
    targetPrice: 210000,
    currentPrice: 178000,
    status: "LOSS",
    returnRate: -3.78,
  },
  {
    id: 5,
    date: "2026-01-06",
    name: "현대차",
    symbol: "005380",
    action: "BUY",
    entryPrice: 215000,
    targetPrice: 250000,
    currentPrice: 242000,
    status: "WIN",
    returnRate: 12.56,
  },
  {
    id: 6,
    date: "2026-01-05",
    name: "LG에너지솔루션",
    symbol: "373220",
    action: "BUY",
    entryPrice: 385000,
    targetPrice: 420000,
    currentPrice: 412000,
    status: "WIN",
    returnRate: 7.01,
  },
  {
    id: 7,
    date: "2026-01-04",
    name: "셀트리온",
    symbol: "068270",
    action: "SELL",
    entryPrice: 175000,
    targetPrice: 155000,
    currentPrice: 168000,
    status: "PENDING",
    returnRate: 4.00,
  },
  {
    id: 8,
    date: "2026-01-03",
    name: "기아",
    symbol: "000270",
    action: "BUY",
    entryPrice: 95000,
    targetPrice: 115000,
    currentPrice: 108500,
    status: "WIN",
    returnRate: 14.21,
  },
]

// 주간 성과 데이터
const WEEKLY_PERFORMANCE = [
  { week: "12/30~1/5", hitRate: 85, avgReturn: 8.5, totalTrades: 12 },
  { week: "1/6~1/11", hitRate: 87, avgReturn: 9.2, totalTrades: 15 },
]

// 월간 성과 데이터
const MONTHLY_PERFORMANCE = [
  { month: "2025년 12월", hitRate: 82, avgReturn: 7.8, totalTrades: 48, topGain: "+45.2%", topStock: "에코프로비엠" },
  { month: "2025년 11월", hitRate: 79, avgReturn: 6.5, totalTrades: 52, topGain: "+38.7%", topStock: "포스코퓨처엠" },
  { month: "2025년 10월", hitRate: 84, avgReturn: 9.1, totalTrades: 45, topGain: "+52.3%", topStock: "한화에어로스페이스" },
]

export default function PerformancePage() {
  const { data: session } = useSession()
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  
  const isSubscribed = session?.user?.role !== "USER"

  // 통계 계산
  const wins = PAST_RECOMMENDATIONS.filter(r => r.status === "WIN").length
  const losses = PAST_RECOMMENDATIONS.filter(r => r.status === "LOSS").length
  const hitRate = Math.round((wins / (wins + losses)) * 100)
  const avgReturn = PAST_RECOMMENDATIONS
    .filter(r => r.status !== "PENDING")
    .reduce((acc, r) => acc + r.returnRate, 0) / (wins + losses)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-400" />
          AI 성과 대시보드
        </h1>
        <p className="text-muted-foreground">
          AI 추천 종목의 실제 적중률과 수익률을 확인하세요.
        </p>
      </div>

      {/* 핵심 지표 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">전체 적중률</p>
                <p className="text-4xl font-bold text-emerald-400">{hitRate}%</p>
                <p className="text-xs text-emerald-400/70 mt-1">
                  {wins}승 {losses}패
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
                <Target className="h-7 w-7 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-transparent overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">평균 수익률</p>
                <PremiumLock isSubscribed={isSubscribed} type="blur" feature="수익률 통계">
                  <p className="text-4xl font-bold text-violet-400">+{avgReturn.toFixed(1)}%</p>
                </PremiumLock>
                <p className="text-xs text-violet-400/70 mt-1">
                  추천 종목 기준
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/20">
                <TrendingUp className="h-7 w-7 text-violet-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">이번 주 최고 수익</p>
                <PremiumLock isSubscribed={isSubscribed} type="blur" feature="최고 수익 종목">
                  <p className="text-4xl font-bold text-amber-400">+14.2%</p>
                </PremiumLock>
                <p className="text-xs text-amber-400/70 mt-1">
                  기아 (000270)
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20">
                <Sparkles className="h-7 w-7 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">총 추천 수</p>
                <p className="text-4xl font-bold text-primary">{PAST_RECOMMENDATIONS.length}</p>
                <p className="text-xs text-primary/70 mt-1">
                  이번 주
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
                <BarChart3 className="h-7 w-7 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 상세 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">최근 추천</TabsTrigger>
          <TabsTrigger value="weekly">주간 성과</TabsTrigger>
          <TabsTrigger value="monthly">월간 리포트</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                최근 AI 추천 내역
              </CardTitle>
              <CardDescription>
                최근 추천 종목의 진입가, 목표가, 현재 수익률을 확인하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {PAST_RECOMMENDATIONS.map((rec, index) => (
                  <RecommendationRow 
                    key={rec.id} 
                    rec={rec} 
                    index={index}
                    isSubscribed={isSubscribed}
                    onPremiumClick={() => setShowPremiumModal(true)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="mt-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>주간 성과 추이</CardTitle>
              <CardDescription>
                주간 단위로 AI 추천 성과를 확인하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PremiumLock 
                isSubscribed={isSubscribed} 
                type="blur" 
                feature="주간 성과 리포트"
                teaserText="지난 주 적중률 87%, 평균 수익률 +9.2%"
              >
                <div className="space-y-4">
                  {WEEKLY_PERFORMANCE.map((week, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50"
                    >
                      <div>
                        <p className="font-medium">{week.week}</p>
                        <p className="text-sm text-muted-foreground">{week.totalTrades}건 추천</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-emerald-400">{week.hitRate}%</p>
                          <p className="text-xs text-muted-foreground">적중률</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-violet-400">+{week.avgReturn}%</p>
                          <p className="text-xs text-muted-foreground">평균 수익</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </PremiumLock>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="mt-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>월간 리포트</CardTitle>
              <CardDescription>
                월간 AI 성과와 최고 수익 종목을 확인하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PremiumLock 
                isSubscribed={isSubscribed} 
                type="blur" 
                feature="월간 성과 리포트"
                teaserText="12월 최고 수익: 에코프로비엠 +45.2%"
              >
                <div className="space-y-4">
                  {MONTHLY_PERFORMANCE.map((month, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-lg bg-muted/30 border border-border/50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-medium text-lg">{month.month}</p>
                        <Badge variant="outline" className="text-xs">
                          {month.totalTrades}건 추천
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center p-3 rounded-lg bg-emerald-500/10">
                          <p className="text-2xl font-bold text-emerald-400">{month.hitRate}%</p>
                          <p className="text-xs text-muted-foreground">적중률</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-violet-500/10">
                          <p className="text-2xl font-bold text-violet-400">+{month.avgReturn}%</p>
                          <p className="text-xs text-muted-foreground">평균 수익</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-amber-500/10 col-span-2">
                          <p className="text-xl font-bold text-amber-400">{month.topGain}</p>
                          <p className="text-xs text-muted-foreground">🏆 {month.topStock}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </PremiumLock>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 프리미엄 CTA */}
      {!isSubscribed && (
        <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <CardContent className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold">프리미엄 구독으로 모든 성과 데이터 확인</p>
                <p className="text-sm text-muted-foreground">
                  과거 추천 종목의 상세 수익률과 진입/청산 타이밍을 확인하세요
                </p>
              </div>
            </div>
            <Button 
              className="bg-gradient-to-r from-amber-500 to-orange-500"
              onClick={() => setShowPremiumModal(true)}
            >
              구독하기
            </Button>
          </CardContent>
        </Card>
      )}

      <PremiumModal 
        open={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)}
        feature="AI 성과 대시보드"
      />
    </div>
  )
}

// 추천 내역 행 컴포넌트
function RecommendationRow({ 
  rec, 
  index,
  isSubscribed,
  onPremiumClick,
}: { 
  rec: typeof PAST_RECOMMENDATIONS[0]
  index: number
  isSubscribed: boolean
  onPremiumClick: () => void
}) {
  // 비구독자는 처음 3개만 보여줌
  const shouldBlur = !isSubscribed && index >= 3

  const statusColors = {
    WIN: "text-emerald-400 bg-emerald-500/10",
    LOSS: "text-red-400 bg-red-500/10",
    PENDING: "text-amber-400 bg-amber-500/10",
  }

  const statusLabels = {
    WIN: "수익",
    LOSS: "손실",
    PENDING: "진행중",
  }

  if (shouldBlur) {
    return (
      <div 
        className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 cursor-pointer hover:border-primary/50 transition-all relative overflow-hidden"
        onClick={onPremiumClick}
      >
        <div className="blur-md flex items-center gap-4">
          <div>
            <p className="font-medium">종목명</p>
            <p className="text-sm text-muted-foreground">000000</p>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="flex items-center gap-2 text-sm">
            <Lock className="h-4 w-4 text-primary" />
            <span>프리미엄 전용</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-border transition-colors">
      <div className="flex items-center gap-4">
        <div className="text-center min-w-[60px]">
          <p className="text-xs text-muted-foreground">{rec.date.slice(5)}</p>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{rec.name}</p>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                rec.action === "BUY" ? "text-emerald-400 border-emerald-500/50" : "text-red-400 border-red-500/50"
              )}
            >
              {rec.action === "BUY" ? "매수" : "매도"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{rec.symbol}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-sm text-muted-foreground">진입가</p>
          <p className="font-medium">{rec.entryPrice.toLocaleString()}원</p>
        </div>
        {isSubscribed ? (
          <>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">현재가</p>
              <p className="font-medium">{rec.currentPrice.toLocaleString()}원</p>
            </div>
            <div className={cn("px-3 py-1 rounded-lg text-center min-w-[80px]", statusColors[rec.status])}>
              <p className="text-lg font-bold">
                {rec.returnRate > 0 ? "+" : ""}{rec.returnRate.toFixed(1)}%
              </p>
              <p className="text-xs">{statusLabels[rec.status]}</p>
            </div>
          </>
        ) : (
          <div 
            className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
            onClick={onPremiumClick}
          >
            <span className="blur-sm">+12.3%</span>
            <Lock className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  )
}

