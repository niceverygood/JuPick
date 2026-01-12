"use client"

import { useState, useEffect } from "react"
import { usePlan } from "@/hooks/usePlan"
import {
  Bell,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  Target,
  Zap,
  Volume2,
  VolumeX,
  Crown,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Signal {
  id: string
  type: "BUY" | "SELL" | "ALERT"
  symbol: string
  name: string
  price: number
  targetPrice: number
  stopLoss: number
  message: string
  timestamp: Date
  urgency: "HIGH" | "MEDIUM" | "LOW"
}

// 샘플 실시간 시그널 데이터
const SAMPLE_SIGNALS: Signal[] = [
  {
    id: "1",
    type: "BUY",
    symbol: "005930",
    name: "삼성전자",
    price: 72500,
    targetPrice: 85000,
    stopLoss: 68000,
    message: "기술적 지지선 돌파, 외국인 순매수 급증",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    urgency: "HIGH",
  },
  {
    id: "2",
    type: "SELL",
    symbol: "035720",
    name: "카카오",
    price: 42500,
    targetPrice: 38000,
    stopLoss: 45000,
    message: "저항선 도달, 차익실현 권고",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    urgency: "MEDIUM",
  },
  {
    id: "3",
    type: "ALERT",
    symbol: "000660",
    name: "SK하이닉스",
    price: 178000,
    targetPrice: 210000,
    stopLoss: 165000,
    message: "HBM 수요 증가 뉴스, 관심 종목 등록 권고",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    urgency: "LOW",
  },
  {
    id: "4",
    type: "BUY",
    symbol: "373220",
    name: "LG에너지솔루션",
    price: 385000,
    targetPrice: 450000,
    stopLoss: 360000,
    message: "배터리 수주 소식, 상승 모멘텀 형성",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    urgency: "HIGH",
  },
  {
    id: "5",
    type: "SELL",
    symbol: "086520",
    name: "에코프로",
    price: 95000,
    targetPrice: 80000,
    stopLoss: 100000,
    message: "과열 구간 진입, 리스크 관리 필요",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    urgency: "MEDIUM",
  },
]

export default function SignalsPage() {
  const { isLoading, features, planId, planName } = usePlan()
  const [signals, setSignals] = useState<Signal[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isConnected, setIsConnected] = useState(true)

  const canAccess = features.realtimeSignals

  useEffect(() => {
    if (canAccess) {
      // 실제로는 WebSocket 연결
      setSignals(SAMPLE_SIGNALS)
    }
  }, [canAccess])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Pro/Premium 이하 플랜은 접근 불가
  if (!canAccess) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-amber-400" />
            실시간 매수/매도 시그널
          </h1>
          <p className="text-muted-foreground">
            AI가 분석한 최적의 매매 타이밍을 실시간으로 받아보세요.
          </p>
        </div>

        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20">
              <Crown className="h-10 w-10 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Pro 플랜 이상 전용 기능</h2>
            <p className="text-muted-foreground mb-2">
              현재 플랜: <Badge variant="outline">{planName}</Badge>
            </p>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              실시간 매수/매도 시그널은 Pro 플랜 이상에서만 이용 가능합니다.
              지금 업그레이드하고 최적의 매매 타이밍을 놓치지 마세요!
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-violet-600">
              <Link href="/subscriptions">
                플랜 업그레이드
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* 티저 카드들 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <TeaserCard
            type="BUY"
            title="매수 시그널"
            description="AI가 분석한 최적의 매수 타이밍"
          />
          <TeaserCard
            type="SELL"
            title="매도 시그널"
            description="적절한 익절/손절 타이밍 알림"
          />
          <TeaserCard
            type="ALERT"
            title="관심 종목 알림"
            description="주목해야 할 종목 실시간 알림"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-amber-400" />
            실시간 매수/매도 시그널
          </h1>
          <p className="text-muted-foreground">
            AI가 분석한 최적의 매매 타이밍을 실시간으로 받아보세요.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* 연결 상태 */}
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-2 w-2 rounded-full",
              isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"
            )} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? "실시간 연결됨" : "연결 끊김"}
            </span>
          </div>
          {/* 소리 토글 */}
          <div className="flex items-center gap-2">
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            ) : (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            )}
            <Switch
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          </div>
        </div>
      </div>

      {/* 오늘의 시그널 통계 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">오늘 매수 시그널</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {signals.filter(s => s.type === "BUY").length}건
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">오늘 매도 시그널</p>
                <p className="text-2xl font-bold text-red-400">
                  {signals.filter(s => s.type === "SELL").length}건
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">관심 종목 알림</p>
                <p className="text-2xl font-bold text-amber-400">
                  {signals.filter(s => s.type === "ALERT").length}건
                </p>
              </div>
              <Bell className="h-8 w-8 text-amber-400/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 시그널 목록 */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            최근 시그널
          </CardTitle>
          <CardDescription>
            실시간으로 업데이트되는 AI 매매 시그널입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {signals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SignalCard({ signal }: { signal: Signal }) {
  const typeConfig = {
    BUY: {
      icon: TrendingUp,
      label: "매수",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
    },
    SELL: {
      icon: TrendingDown,
      label: "매도",
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
    },
    ALERT: {
      icon: AlertCircle,
      label: "알림",
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
    },
  }

  const urgencyConfig = {
    HIGH: { label: "긴급", color: "bg-red-500" },
    MEDIUM: { label: "중요", color: "bg-amber-500" },
    LOW: { label: "참고", color: "bg-blue-500" },
  }

  const config = typeConfig[signal.type]
  const Icon = config.icon
  const urgency = urgencyConfig[signal.urgency]

  const timeAgo = getTimeAgo(signal.timestamp)

  return (
    <div className={cn(
      "rounded-lg border p-4",
      config.borderColor,
      config.bgColor
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            config.bgColor
          )}>
            <Icon className={cn("h-5 w-5", config.color)} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn(config.color, config.bgColor, "border-0")}>
                {config.label}
              </Badge>
              <Badge className={cn("text-white text-xs", urgency.color)}>
                {urgency.label}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo}
              </span>
            </div>
            <h3 className="font-semibold">
              {signal.name} ({signal.symbol})
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {signal.message}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm text-muted-foreground">현재가</p>
          <p className={cn("text-lg font-bold", config.color)}>
            {signal.price.toLocaleString()}원
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-emerald-400" />
              <span>목표: {signal.targetPrice.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3 text-red-400" />
              <span>손절: {signal.stopLoss.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TeaserCard({ type, title, description }: { type: "BUY" | "SELL" | "ALERT"; title: string; description: string }) {
  const typeConfig = {
    BUY: {
      icon: TrendingUp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    SELL: {
      icon: TrendingDown,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
    },
    ALERT: {
      icon: Bell,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
  }

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <Card className="border-border/30 bg-card/30 opacity-60">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            config.bgColor
          )}>
            <Icon className={cn("h-5 w-5", config.color)} />
          </div>
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)

  if (minutes < 1) return "방금 전"
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}
