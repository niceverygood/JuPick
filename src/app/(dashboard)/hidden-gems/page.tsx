"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
  Gem,
  Rocket,
  Lock,
  Crown,
  TrendingUp,
  Flame,
  Eye,
  Clock,
  Target,
  AlertTriangle,
  Sparkles,
  Star,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PremiumModal } from "@/components/premium/PremiumLock"

// 숨겨진 급등주 데이터 (실제로는 AI가 생성)
const HIDDEN_GEMS = [
  {
    id: 1,
    name: "에이직랜드",
    symbol: "445090",
    sector: "반도체",
    currentPrice: 42500,
    targetPrice: 68000,
    potentialGain: 60,
    reason: "AI 반도체 설계 자동화 솔루션 보유. 글로벌 반도체 기업들과 계약 체결 예정. 내년 실적 턴어라운드 기대.",
    riskLevel: "HIGH",
    confidence: 75,
    timeframe: "중기 2-3개월",
    catalyst: "1월 중 대형 고객사 계약 발표 예정",
    rating: 5,
  },
  {
    id: 2,
    name: "코난테크놀로지",
    symbol: "402030",
    sector: "AI/소프트웨어",
    currentPrice: 18500,
    targetPrice: 32000,
    potentialGain: 73,
    reason: "자체 개발 LLM 모델 상용화 임박. 공공기관 AI 프로젝트 수주 증가. 흑자전환 가시화.",
    riskLevel: "HIGH",
    confidence: 70,
    timeframe: "단기 1-2개월",
    catalyst: "2월 AI 엑스포 신제품 발표",
    rating: 4,
  },
  {
    id: 3,
    name: "씨앤투스성진",
    symbol: "352480",
    sector: "2차전지",
    currentPrice: 8500,
    targetPrice: 15000,
    potentialGain: 76,
    reason: "전고체 배터리 소재 국산화 성공. 대형 배터리사 샘플 납품 완료. 양산 계약 체결 기대.",
    riskLevel: "MEDIUM",
    confidence: 72,
    timeframe: "중기 3-6개월",
    catalyst: "양산 계약 발표 시 급등 예상",
    rating: 5,
  },
]

// 긴급 매도 시그널
const URGENT_SELL_SIGNALS = [
  {
    id: 1,
    name: "OO테크",
    symbol: "XXX000",
    currentPrice: 25000,
    targetSell: 23000,
    reason: "대주주 지분 매각 공시. 기관 매도세 증가. 단기 조정 예상.",
    urgency: "HIGH",
  },
  {
    id: 2,
    name: "XX바이오",
    symbol: "YYY000",
    currentPrice: 45000,
    targetSell: 40000,
    reason: "임상 3상 지연 공시. 목표가 하향 조정 필요.",
    urgency: "MEDIUM",
  },
]

export default function HiddenGemsPage() {
  const { data: session } = useSession()
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  
  const isSubscribed = session?.user?.role !== "USER"

  // 비구독자 전용 티저 페이지
  if (!isSubscribed) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gem className="h-6 w-6 text-amber-400" />
            숨겨진 급등주
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
              PREMIUM
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            AI가 발굴한 10배 잠재력 종목을 확인하세요.
          </p>
        </div>

        {/* 티저 카드들 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* 숨겨진 급등주 티저 */}
          {[1, 2, 3].map((i) => (
            <Card 
              key={i}
              className="relative overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5 cursor-pointer hover:border-amber-500/50 transition-all group"
              onClick={() => setShowPremiumModal(true)}
            >
              {/* 반짝이는 효과 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              {/* Premium 뱃지 */}
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

              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background/90 via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-center">
                  <Rocket className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-sm font-medium">클릭하여 잠금 해제</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* 긴급 매도 시그널 티저 */}
        <Card className="border-red-500/30 bg-gradient-to-br from-red-500/5 to-pink-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              긴급 매도 시그널
              <Badge variant="destructive" className="animate-pulse">URGENT</Badge>
            </CardTitle>
            <CardDescription>
              지금 팔아야 할 종목이 {URGENT_SELL_SIGNALS.length}개 감지되었습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="flex items-center justify-center py-8 cursor-pointer"
              onClick={() => setShowPremiumModal(true)}
            >
              <div className="text-center">
                <Lock className="h-12 w-12 text-red-400 mx-auto mb-3" />
                <p className="font-medium">손실을 피하려면 지금 확인하세요</p>
                <p className="text-sm text-muted-foreground mt-1">
                  프리미엄 구독자만 열람 가능
                </p>
                <Button 
                  className="mt-4 bg-gradient-to-r from-red-500 to-pink-500"
                  onClick={() => setShowPremiumModal(true)}
                >
                  지금 확인하기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 과거 성과 티저 */}
        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
                  <TrendingUp className="h-7 w-7 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-400">+156%</p>
                  <p className="text-sm text-muted-foreground">지난달 숨겨진 급등주 평균 수익률</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                onClick={() => setShowPremiumModal(true)}
              >
                성과 확인하기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="border-amber-500/50 bg-gradient-to-r from-amber-500/20 to-orange-500/20">
          <CardContent className="py-8 text-center">
            <Crown className="h-16 w-16 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">프리미엄으로 업그레이드</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              AI가 발굴한 숨겨진 급등주와 긴급 매도 시그널을 실시간으로 받아보세요.
              평균 +156% 수익률을 경험하세요.
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              onClick={() => setShowPremiumModal(true)}
            >
              <Sparkles className="mr-2 h-5 w-5" />
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

  // 구독자 전용 페이지
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gem className="h-6 w-6 text-amber-400" />
            숨겨진 급등주
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
              PREMIUM
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            AI가 발굴한 고수익 잠재력 종목입니다. 신중하게 투자하세요.
          </p>
        </div>
      </div>

      {/* 긴급 매도 시그널 */}
      {URGENT_SELL_SIGNALS.length > 0 && (
        <Card className="border-red-500/50 bg-gradient-to-br from-red-500/10 to-pink-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              긴급 매도 시그널
              <Badge variant="destructive" className="animate-pulse">URGENT</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {URGENT_SELL_SIGNALS.map((signal) => (
              <div 
                key={signal.id}
                className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/30"
              >
                <div>
                  <p className="font-medium">{signal.name} ({signal.symbol})</p>
                  <p className="text-sm text-muted-foreground">{signal.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">권장 매도가</p>
                  <p className="text-lg font-bold text-red-400">
                    {signal.targetSell.toLocaleString()}원
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 숨겨진 급등주 목록 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {HIDDEN_GEMS.map((gem) => (
          <Card 
            key={gem.id}
            className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5 overflow-hidden"
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs">
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
              <CardTitle className="text-lg">{gem.name}</CardTitle>
              <CardDescription>{gem.symbol}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">현재가</p>
                  <p className="font-medium">{gem.currentPrice.toLocaleString()}원</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">목표가</p>
                  <p className="font-medium text-emerald-400">{gem.targetPrice.toLocaleString()}원</p>
                </div>
                <div className="text-center px-3 py-2 rounded-lg bg-amber-500/20">
                  <p className="text-2xl font-bold text-amber-400">+{gem.potentialGain}%</p>
                  <p className="text-xs text-amber-400/70">예상 수익</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{gem.reason}</p>

              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="gap-1">
                  <Zap className="h-3 w-3" />
                  {gem.catalyst}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {gem.timeframe}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Target className="h-3 w-3" />
                  신뢰도 {gem.confidence}%
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    gem.riskLevel === "HIGH" ? "text-red-400 border-red-500/50" : 
                    gem.riskLevel === "MEDIUM" ? "text-amber-400 border-amber-500/50" : 
                    "text-emerald-400 border-emerald-500/50"
                  )}
                >
                  리스크: {gem.riskLevel === "HIGH" ? "높음" : gem.riskLevel === "MEDIUM" ? "보통" : "낮음"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Disclaimer */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex gap-3 py-4">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            숨겨진 급등주는 AI가 분석한 고위험 고수익 종목입니다. 소형주 특성상 변동성이 크므로 
            반드시 분산 투자하시고, 투자 가능 금액의 일부만 투자하시기 바랍니다.
            모든 투자 결정과 그에 따른 손익은 투자자 본인에게 있습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

