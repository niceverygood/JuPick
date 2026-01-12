"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Gem,
  Rocket,
  Lock,
  Crown,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  AlertTriangle,
  Sparkles,
  Star,
  Zap,
  RefreshCw,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PremiumModal } from "@/components/premium/PremiumLock"
import { usePlanFeatures } from "@/hooks/useSubscription"
import Link from "next/link"

interface HiddenGemStock {
  symbol: string
  name: string
  sector: string
  currentPrice: number
  targetPrice: number
  potentialGain: number
  reason: string
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  confidence: number
  timeframe: string
  catalyst: string
  rating: number
  changePercent: number
  volume: number
}

export default function HiddenGemsPage() {
  const { getLimit, isUnlimited, planId, planName, loading: planLoading } = usePlanFeatures()
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [gems, setGems] = useState<HiddenGemStock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  
  // 주간 숨겨진 급등주 제한 가져오기
  const weeklyLimit = getLimit("weeklyHiddenGemsLimit")
  const hasUnlimitedAccess = isUnlimited("weeklyHiddenGemsLimit")
  const hasAccess = weeklyLimit !== 0 // 0이면 접근 불가

  const fetchGems = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/stocks/hidden-gems")
      const data = await res.json()
      
      if (data.success) {
        setGems(data.data)
        setLastUpdated(data.timestamp)
      } else {
        setError(data.error || "데이터를 불러오는데 실패했습니다.")
      }
    } catch (err) {
      console.error("Failed to fetch hidden gems:", err)
      setError("네트워크 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (planLoading) return
    if (hasAccess) {
      fetchGems()
    } else {
      setIsLoading(false)
    }
  }, [planLoading, hasAccess, fetchGems])

  // 플랜에 따라 표시할 급등주 수 제한
  const displayedGems = hasUnlimitedAccess 
    ? gems 
    : gems.slice(0, weeklyLimit)

  // 접근 권한이 없는 사용자 (Basic 미만)
  if (!hasAccess) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="min-w-0">
          <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2 flex-wrap">
            <Gem className="h-5 w-5 lg:h-6 lg:w-6 text-amber-400 shrink-0" />
            <span>숨겨진 급등주</span>
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">
              PRO+
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground">
            AI가 발굴한 10배 잠재력 종목을 확인하세요.
          </p>
        </div>

        {/* 티저 카드들 */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card 
              key={i}
              className="relative overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5 cursor-pointer hover:border-amber-500/50 transition-all group"
              onClick={() => setShowPremiumModal(true)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <div className="absolute -top-1 -right-1 z-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
                  <Crown className="h-5 w-5 text-white" />
                </div>
              </div>

              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">
                    Premium Only
                  </span>
                </div>
                <CardTitle className="blur-md text-lg">종목명이 숨겨져 있습니다</CardTitle>
                <CardDescription className="blur-sm">000000</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">예상 수익률</span>
                  <span className="text-2xl font-bold text-amber-400">+{50 + i * 10}%</span>
                </div>

                <div className="blur-md space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>현재가</span>
                    <span>00,000원</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>목표가</span>
                    <span>00,000원</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 pt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={cn(
                        "h-4 w-4",
                        star <= 4 ? "text-amber-400 fill-amber-400" : "text-muted"
                      )} 
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-2">AI 추천 등급</span>
                </div>
              </CardContent>

              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background/90 via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-center">
                  <Rocket className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-sm font-medium">클릭하여 잠금 해제</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* 과거 성과 티저 */}
        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
          <CardContent className="py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 shrink-0">
                  <TrendingUp className="h-7 w-7 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-400">실시간 데이터</p>
                  <p className="text-sm text-muted-foreground">네이버 금융 실시간 크롤링</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                onClick={() => setShowPremiumModal(true)}
              >
                데이터 확인하기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="border-amber-500/50 bg-gradient-to-r from-amber-500/20 to-orange-500/20">
          <CardContent className="py-6 lg:py-8 text-center">
            <Crown className="h-12 w-12 lg:h-16 lg:w-16 text-amber-400 mx-auto mb-4" />
            <h2 className="text-xl lg:text-2xl font-bold mb-2">프리미엄으로 업그레이드</h2>
            <p className="text-sm text-muted-foreground mb-4 lg:mb-6 max-w-md mx-auto">
              AI가 분석한 실시간 급등주와 잠재력 종목을 확인하세요.
              네이버 금융 데이터를 실시간으로 분석합니다.
            </p>
            <Button 
              size="default"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 lg:px-6"
              onClick={() => setShowPremiumModal(true)}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              지금 구독하기
            </Button>
          </CardContent>
        </Card>

        <PremiumModal 
          open={showPremiumModal} 
          onClose={() => setShowPremiumModal(false)}
          feature="숨겨진 급등주"
        />
      </div>
    )
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">실시간 데이터 수집 중...</p>
          <p className="text-xs text-muted-foreground mt-1">네이버 금융에서 데이터를 가져오고 있습니다</p>
        </div>
      </div>
    )
  }

  // 구독자 전용 페이지
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2 flex-wrap">
            <Gem className="h-5 w-5 lg:h-6 lg:w-6 text-amber-400 shrink-0" />
            <span>숨겨진 급등주</span>
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">
              실시간
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground">
            네이버 금융 실시간 크롤링 데이터 기반 AI 분석 종목
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              마지막 업데이트: {new Date(lastUpdated).toLocaleString("ko-KR")}
            </p>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchGems}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          새로고침
        </Button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* 숨겨진 급등주 목록 */}
      {gems.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {gems.map((gem, index) => (
            <Card 
              key={gem.symbol}
              className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5 overflow-hidden"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    {gem.sector}
                  </Badge>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={cn(
                          "h-3 w-3",
                          star <= gem.rating ? "text-amber-400 fill-amber-400" : "text-muted"
                        )} 
                      />
                    ))}
                  </div>
                </div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="truncate">{gem.name}</span>
                  {gem.changePercent > 0 ? (
                    <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400 shrink-0" />
                  )}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <span>{gem.symbol}</span>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[10px]",
                      gem.changePercent >= 0 ? "text-emerald-400 border-emerald-500/50" : "text-red-400 border-red-500/50"
                    )}
                  >
                    {gem.changePercent >= 0 ? "+" : ""}{gem.changePercent.toFixed(2)}%
                  </Badge>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">현재가</p>
                    <p className="font-medium text-sm whitespace-nowrap">{gem.currentPrice.toLocaleString()}원</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">AI 목표가</p>
                    <p className="font-medium text-sm text-emerald-400 whitespace-nowrap">{gem.targetPrice.toLocaleString()}원</p>
                  </div>
                  <div className="text-center px-2 py-1 rounded-lg bg-amber-500/20">
                    <p className="text-lg font-bold text-amber-400 whitespace-nowrap">+{gem.potentialGain}%</p>
                    <p className="text-[10px] text-amber-400/70 whitespace-nowrap">예상 수익</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">{gem.reason}</p>

                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <Badge variant="outline" className="gap-1 text-[10px]">
                    <Zap className="h-3 w-3" />
                    {gem.catalyst}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-[10px] pt-2 border-t border-border/50 flex-wrap gap-1">
                  <div className="flex items-center gap-1 text-muted-foreground whitespace-nowrap">
                    <Clock className="h-3 w-3" />
                    {gem.timeframe}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground whitespace-nowrap">
                    <Target className="h-3 w-3" />
                    신뢰도 {gem.confidence}%
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[10px]",
                      gem.riskLevel === "HIGH" ? "text-red-400 border-red-500/50" : 
                      gem.riskLevel === "MEDIUM" ? "text-amber-400 border-amber-500/50" : 
                      "text-emerald-400 border-emerald-500/50"
                    )}
                  >
                    {gem.riskLevel === "HIGH" ? "고위험" : gem.riskLevel === "MEDIUM" ? "중위험" : "저위험"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Gem className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">현재 조건에 맞는 급등주가 없습니다.</p>
            <p className="text-sm text-muted-foreground mt-1">시장이 열리면 데이터가 업데이트됩니다.</p>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex gap-3 py-4">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            본 데이터는 네이버 금융에서 실시간으로 크롤링한 정보를 기반으로 AI가 분석한 참고 자료입니다.
            투자 결정은 본인의 판단에 따라 신중하게 하시기 바랍니다. 모든 투자 결정과 그에 따른 손익은 투자자 본인에게 있습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
