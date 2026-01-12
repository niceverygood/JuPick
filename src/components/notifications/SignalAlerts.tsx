"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
  Bell,
  BellRing,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  X,
  Crown,
  Clock,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { PremiumModal } from "@/components/premium/PremiumLock"

export interface Signal {
  id: string
  type: "BUY" | "SELL" | "ALERT"
  symbol: string
  name: string
  price: number
  targetPrice?: number
  message: string
  urgency: "LOW" | "MEDIUM" | "HIGH"
  timestamp: Date
  read: boolean
}

// 샘플 시그널 데이터
const SAMPLE_SIGNALS: Signal[] = [
  {
    id: "1",
    type: "BUY",
    symbol: "005930",
    name: "삼성전자",
    price: 72500,
    targetPrice: 85000,
    message: "🚀 강력 매수 신호! AI가 분석한 최적의 진입 타이밍입니다.",
    urgency: "HIGH",
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5분 전
    read: false,
  },
  {
    id: "2",
    type: "SELL",
    symbol: "035720",
    name: "카카오",
    price: 42500,
    targetPrice: 38000,
    message: "⚠️ 매도 권장! 추가 하락 위험이 감지되었습니다.",
    urgency: "HIGH",
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15분 전
    read: false,
  },
  {
    id: "3",
    type: "BUY",
    symbol: "000660",
    name: "SK하이닉스",
    price: 178000,
    targetPrice: 210000,
    message: "📈 매수 기회! HBM 수요 증가로 추가 상승 기대.",
    urgency: "MEDIUM",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30분 전
    read: true,
  },
  {
    id: "4",
    type: "ALERT",
    symbol: "373220",
    name: "LG에너지솔루션",
    price: 412000,
    message: "📊 관심 종목 급등 알림! 전일 대비 +5.2% 상승 중.",
    urgency: "LOW",
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1시간 전
    read: true,
  },
]

export function SignalAlerts() {
  const { data: session } = useSession()
  const [signals, setSignals] = useState<Signal[]>(SAMPLE_SIGNALS)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  
  const isSubscribed = session?.user?.role !== "USER"
  const unreadCount = signals.filter(s => !s.read).length

  // 알림 읽음 처리
  const markAsRead = (id: string) => {
    setSignals(signals.map(s => 
      s.id === id ? { ...s, read: true } : s
    ))
  }

  // 모두 읽음 처리
  const markAllAsRead = () => {
    setSignals(signals.map(s => ({ ...s, read: true })))
  }

  // 알림 삭제
  const removeSignal = (id: string) => {
    setSignals(signals.filter(s => s.id !== id))
  }

  // 시간 포맷
  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (minutes < 1) return "방금 전"
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    return date.toLocaleDateString("ko-KR")
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            {unreadCount > 0 ? (
              <>
                <BellRing className="h-5 w-5 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {unreadCount}
                </span>
              </>
            ) : (
              <Bell className="h-5 w-5" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BellRing className="h-5 w-5 text-primary" />
                AI 시그널 알림
              </span>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs"
                  onClick={markAllAsRead}
                >
                  모두 읽음
                </Button>
              )}
            </SheetTitle>
            <SheetDescription>
              AI가 감지한 매수/매도 시그널을 실시간으로 확인하세요.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-150px)] mt-4 pr-4">
            {signals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mb-4 opacity-50" />
                <p>새로운 알림이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {signals.map((signal, index) => (
                  <SignalCard
                    key={signal.id}
                    signal={signal}
                    isSubscribed={isSubscribed}
                    index={index}
                    onRead={() => markAsRead(signal.id)}
                    onRemove={() => removeSignal(signal.id)}
                    onPremiumClick={() => setShowPremiumModal(true)}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            )}

            {/* 프리미엄 CTA */}
            {!isSubscribed && (
              <div 
                className="mt-6 p-4 rounded-lg border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 cursor-pointer"
                onClick={() => setShowPremiumModal(true)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">실시간 알림 받기</p>
                    <p className="text-xs text-muted-foreground">
                      프리미엄 구독 시 푸시 알림 제공
                    </p>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <PremiumModal 
        open={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)}
        feature="실시간 시그널 알림"
      />
    </>
  )
}

// 시그널 카드 컴포넌트
function SignalCard({
  signal,
  isSubscribed,
  index,
  onRead,
  onRemove,
  onPremiumClick,
  formatTime,
}: {
  signal: Signal
  isSubscribed: boolean
  index: number
  onRead: () => void
  onRemove: () => void
  onPremiumClick: () => void
  formatTime: (date: Date) => string
}) {
  // 비구독자는 첫 번째 알림만 완전히 표시
  const shouldBlur = !isSubscribed && index >= 1

  const typeStyles = {
    BUY: {
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      label: "매수",
    },
    SELL: {
      icon: TrendingDown,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      label: "매도",
    },
    ALERT: {
      icon: AlertTriangle,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      label: "알림",
    },
  }

  const style = typeStyles[signal.type]
  const Icon = style.icon

  if (shouldBlur) {
    return (
      <div 
        className={cn(
          "relative p-4 rounded-lg border cursor-pointer",
          style.border,
          style.bg
        )}
        onClick={onPremiumClick}
      >
        <div className="blur-md">
          <div className="flex items-start gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", style.bg)}>
              <Icon className={cn("h-5 w-5", style.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">종목명</span>
                <Badge variant="outline" className={cn("text-xs", style.color)}>
                  {style.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">알림 내용이 숨겨져 있습니다</p>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
          <div className="text-center">
            <Crown className="h-6 w-6 text-amber-400 mx-auto mb-1" />
            <p className="text-xs font-medium">프리미엄 전용</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "relative p-4 rounded-lg border transition-colors",
        style.border,
        style.bg,
        !signal.read && "ring-2 ring-primary/20"
      )}
      onClick={onRead}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full shrink-0",
          style.bg
        )}>
          <Icon className={cn("h-5 w-5", style.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{signal.name}</span>
            <Badge variant="outline" className={cn("text-xs", style.color)}>
              {style.label}
            </Badge>
            {signal.urgency === "HIGH" && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                긴급
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{signal.message}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{signal.symbol}</span>
            <span>•</span>
            <span>{signal.price.toLocaleString()}원</span>
            {signal.targetPrice && (
              <>
                <span>→</span>
                <span className={style.color}>
                  {signal.targetPrice.toLocaleString()}원
                </span>
              </>
            )}
            <span className="ml-auto flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(signal.timestamp)}
            </span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {!signal.read && (
        <div className="absolute top-2 left-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
      )}
    </div>
  )
}

// 알림 배너 컴포넌트 (긴급 알림용)
export function UrgentAlertBanner({ 
  signal,
  onClose,
}: { 
  signal: Signal
  onClose: () => void 
}) {
  const typeStyles = {
    BUY: {
      bg: "from-emerald-500/20 to-emerald-600/20",
      border: "border-emerald-500/50",
      text: "text-emerald-400",
    },
    SELL: {
      bg: "from-red-500/20 to-red-600/20",
      border: "border-red-500/50",
      text: "text-red-400",
    },
    ALERT: {
      bg: "from-amber-500/20 to-amber-600/20",
      border: "border-amber-500/50",
      text: "text-amber-400",
    },
  }

  const style = typeStyles[signal.type]

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 max-w-sm p-4 rounded-lg border bg-gradient-to-r backdrop-blur-sm animate-slide-up",
      style.bg,
      style.border
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="destructive" className="text-xs animate-pulse">
              긴급 알림
            </Badge>
          </div>
          <p className={cn("font-medium", style.text)}>{signal.name}</p>
          <p className="text-sm text-muted-foreground">{signal.message}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {signal.price.toLocaleString()}원 → {signal.targetPrice?.toLocaleString()}원
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}


