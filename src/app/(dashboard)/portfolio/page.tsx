"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import {
  Briefcase,
  Plus,
  Trash2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Target,
  Sparkles,
  Crown,
  Lock,
  PieChart,
  BarChart3,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { PremiumModal } from "@/components/premium/PremiumLock"

interface Holding {
  id: string
  symbol: string
  name: string
  quantity: number
  avgPrice: number
  currentPrice?: number
  change?: number
  changePercent?: number
  aiRecommendation?: "BUY" | "SELL" | "HOLD"
  aiReason?: string
  riskLevel?: "LOW" | "MEDIUM" | "HIGH"
}

// 샘플 보유 종목 (실제로는 사용자가 입력)
const SAMPLE_HOLDINGS: Holding[] = [
  {
    id: "1",
    symbol: "005930",
    name: "삼성전자",
    quantity: 100,
    avgPrice: 68000,
    currentPrice: 72500,
    change: 4500,
    changePercent: 6.62,
    aiRecommendation: "HOLD",
    aiReason: "현재 가격대에서 추가 매수보다는 보유 유지 권장. 75,000원 돌파 시 추가 상승 기대.",
    riskLevel: "LOW",
  },
  {
    id: "2",
    symbol: "000660",
    name: "SK하이닉스",
    quantity: 50,
    avgPrice: 165000,
    currentPrice: 178000,
    change: 13000,
    changePercent: 7.88,
    aiRecommendation: "BUY",
    aiReason: "HBM 수요 증가로 추가 상승 여력 충분. 분할 매수 권장.",
    riskLevel: "MEDIUM",
  },
  {
    id: "3",
    symbol: "035720",
    name: "카카오",
    quantity: 200,
    avgPrice: 52000,
    currentPrice: 42500,
    change: -9500,
    changePercent: -18.27,
    aiRecommendation: "SELL",
    aiReason: "⚠️ 손실 구간 진입. 반등 시 일부 물량 정리 권장. 38,000원 이탈 시 추가 하락 위험.",
    riskLevel: "HIGH",
  },
]

export default function PortfolioPage() {
  const { data: session } = useSession()
  const [holdings, setHoldings] = useState<Holding[]>(SAMPLE_HOLDINGS)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [newHolding, setNewHolding] = useState({
    symbol: "",
    name: "",
    quantity: "",
    avgPrice: "",
  })
  
  const isSubscribed = session?.user?.role !== "USER"

  // 포트폴리오 통계 계산
  const totalValue = holdings.reduce((acc, h) => acc + (h.currentPrice || h.avgPrice) * h.quantity, 0)
  const totalCost = holdings.reduce((acc, h) => acc + h.avgPrice * h.quantity, 0)
  const totalGain = totalValue - totalCost
  const totalGainPercent = ((totalGain / totalCost) * 100)

  // AI 분석 실행
  const handleAnalyze = async () => {
    if (!isSubscribed) {
      setShowPremiumModal(true)
      return
    }
    
    setAnalyzing(true)
    // 실제로는 API 호출
    await new Promise(resolve => setTimeout(resolve, 2000))
    setAnalyzing(false)
  }

  // 종목 추가
  const handleAddHolding = () => {
    if (!newHolding.symbol || !newHolding.quantity || !newHolding.avgPrice) return
    
    const holding: Holding = {
      id: Date.now().toString(),
      symbol: newHolding.symbol,
      name: newHolding.name || newHolding.symbol,
      quantity: parseInt(newHolding.quantity),
      avgPrice: parseInt(newHolding.avgPrice),
    }
    
    setHoldings([...holdings, holding])
    setNewHolding({ symbol: "", name: "", quantity: "", avgPrice: "" })
    setShowAddModal(false)
  }

  // 종목 삭제
  const handleRemoveHolding = (id: string) => {
    setHoldings(holdings.filter(h => h.id !== id))
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            내 포트폴리오
          </h1>
          <p className="text-muted-foreground">
            보유 종목을 등록하고 AI 분석을 받아보세요.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                종목 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>보유 종목 추가</DialogTitle>
                <DialogDescription>
                  보유 중인 종목 정보를 입력하세요.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="symbol">종목코드</Label>
                  <Input
                    id="symbol"
                    placeholder="예: 005930"
                    value={newHolding.symbol}
                    onChange={(e) => setNewHolding({ ...newHolding, symbol: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">종목명 (선택)</Label>
                  <Input
                    id="name"
                    placeholder="예: 삼성전자"
                    value={newHolding.name}
                    onChange={(e) => setNewHolding({ ...newHolding, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">보유 수량</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="100"
                      value={newHolding.quantity}
                      onChange={(e) => setNewHolding({ ...newHolding, quantity: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avgPrice">평균 단가</Label>
                    <Input
                      id="avgPrice"
                      type="number"
                      placeholder="50000"
                      value={newHolding.avgPrice}
                      onChange={(e) => setNewHolding({ ...newHolding, avgPrice: e.target.value })}
                    />
                  </div>
                </div>
                <Button className="w-full" onClick={handleAddHolding}>
                  추가하기
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={handleAnalyze}
            disabled={analyzing || holdings.length === 0}
            className="gap-2 bg-gradient-to-r from-primary to-violet-600"
          >
            {analyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                AI 분석
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 포트폴리오 요약 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50 bg-gradient-to-br from-primary/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">총 평가금액</p>
                <p className="text-2xl font-bold">{totalValue.toLocaleString()}원</p>
              </div>
              <PieChart className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 bg-gradient-to-br from-emerald-500/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">총 손익</p>
                <p className={cn(
                  "text-2xl font-bold",
                  totalGain >= 0 ? "text-emerald-400" : "text-red-400"
                )}>
                  {totalGain >= 0 ? "+" : ""}{totalGain.toLocaleString()}원
                </p>
              </div>
              {totalGain >= 0 ? (
                <TrendingUp className="h-8 w-8 text-emerald-400/50" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-400/50" />
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 bg-gradient-to-br from-violet-500/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">수익률</p>
                <p className={cn(
                  "text-2xl font-bold",
                  totalGainPercent >= 0 ? "text-violet-400" : "text-red-400"
                )}>
                  {totalGainPercent >= 0 ? "+" : ""}{totalGainPercent.toFixed(2)}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-violet-400/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 bg-gradient-to-br from-amber-500/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">보유 종목</p>
                <p className="text-2xl font-bold text-amber-400">{holdings.length}개</p>
              </div>
              <Briefcase className="h-8 w-8 text-amber-400/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI 위험 알림 (구독자 전용) */}
      {isSubscribed && holdings.some(h => h.aiRecommendation === "SELL") && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="flex items-start gap-4 py-4">
            <AlertTriangle className="h-6 w-6 text-red-400 shrink-0" />
            <div>
              <p className="font-semibold text-red-400">⚠️ 위험 종목 감지</p>
              <p className="text-sm text-muted-foreground">
                보유 종목 중 매도 권장 종목이 있습니다. AI 분석 결과를 확인하세요.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 보유 종목 목록 */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>보유 종목</CardTitle>
          <CardDescription>
            {isSubscribed 
              ? "각 종목별 AI 분석 결과를 확인하세요." 
              : "AI 분석을 받으려면 프리미엄 구독이 필요합니다."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {holdings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>등록된 종목이 없습니다.</p>
              <p className="text-sm">종목을 추가하고 AI 분석을 받아보세요.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {holdings.map((holding) => (
                <HoldingCard 
                  key={holding.id}
                  holding={holding}
                  isSubscribed={isSubscribed}
                  onRemove={() => handleRemoveHolding(holding.id)}
                  onPremiumClick={() => setShowPremiumModal(true)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 비구독자 CTA */}
      {!isSubscribed && holdings.length > 0 && (
        <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold">포트폴리오 AI 분석</p>
                  <p className="text-sm text-muted-foreground">
                    보유 종목별 매수/매도/보유 추천과 리스크 분석을 받아보세요
                  </p>
                </div>
              </div>
              <Button 
                className="bg-gradient-to-r from-amber-500 to-orange-500"
                onClick={() => setShowPremiumModal(true)}
              >
                <Crown className="mr-2 h-4 w-4" />
                구독하기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <PremiumModal 
        open={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)}
        feature="포트폴리오 AI 분석"
      />
    </div>
  )
}

// 보유 종목 카드 컴포넌트
function HoldingCard({ 
  holding, 
  isSubscribed,
  onRemove,
  onPremiumClick,
}: { 
  holding: Holding
  isSubscribed: boolean
  onRemove: () => void
  onPremiumClick: () => void
}) {
  const gain = holding.currentPrice 
    ? (holding.currentPrice - holding.avgPrice) * holding.quantity 
    : 0
  const gainPercent = holding.changePercent || 0

  const recommendationStyles = {
    BUY: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
    SELL: "bg-red-500/20 text-red-400 border-red-500/50",
    HOLD: "bg-amber-500/20 text-amber-400 border-amber-500/50",
  }

  const recommendationLabels = {
    BUY: "추가 매수",
    SELL: "매도 권장",
    HOLD: "보유 유지",
  }

  return (
    <div className="p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div>
              <p className="font-medium">{holding.name}</p>
              <p className="text-sm text-muted-foreground">{holding.symbol}</p>
            </div>
            {isSubscribed && holding.aiRecommendation && (
              <Badge 
                variant="outline" 
                className={cn("text-xs", recommendationStyles[holding.aiRecommendation])}
              >
                {recommendationLabels[holding.aiRecommendation]}
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-4 gap-4 text-sm mb-3">
            <div>
              <p className="text-muted-foreground text-xs">보유 수량</p>
              <p className="font-medium">{holding.quantity.toLocaleString()}주</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">평균 단가</p>
              <p className="font-medium">{holding.avgPrice.toLocaleString()}원</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">현재가</p>
              <p className="font-medium">
                {holding.currentPrice?.toLocaleString() || "-"}원
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">수익률</p>
              <p className={cn(
                "font-medium",
                gainPercent >= 0 ? "text-emerald-400" : "text-red-400"
              )}>
                {gainPercent >= 0 ? "+" : ""}{gainPercent.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* AI 분석 결과 */}
          {isSubscribed ? (
            holding.aiReason && (
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-primary mb-1">AI 분석</p>
                    <p className="text-sm text-muted-foreground">{holding.aiReason}</p>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div 
              className="p-3 rounded-lg bg-muted/30 border border-dashed border-primary/30 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={onPremiumClick}
            >
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>AI 분석 결과 보기 (프리미엄)</span>
              </div>
            </div>
          )}
        </div>

        <Button 
          variant="ghost" 
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

