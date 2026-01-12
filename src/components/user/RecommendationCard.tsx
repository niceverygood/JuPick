'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  Clock,
  Flame,
  Lock,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface RecommendationCardProps {
  recommendation: {
    id?: string
    stockCode: string
    stockName: string
    currentPrice: number
    targetPrice: number
    stopLoss?: number | null
    reason: string
    confidence: number
    category: string
    isHotStock?: boolean
    createdAt?: string
    expiresAt?: string
  }
  showStopLoss?: boolean
  compact?: boolean
  showFreeBadge?: boolean
}

export function RecommendationCard({ 
  recommendation, 
  showStopLoss = false,
  compact = false,
  showFreeBadge = false
}: RecommendationCardProps) {
  const potentialReturn = ((recommendation.targetPrice - recommendation.currentPrice) / recommendation.currentPrice * 100).toFixed(1)
  const isPositive = Number(potentialReturn) > 0
  
  // 카테고리별 색상
  const categoryColors: Record<string, string> = {
    '급등주': 'bg-red-500/20 text-red-400 border-red-500/30',
    '가치주': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    '성장주': 'bg-green-500/20 text-green-400 border-green-500/30',
    '배당주': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'AI관련주': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    '반도체': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  }
  
  const categoryColor = categoryColors[recommendation.category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  
  // 확신도에 따른 색상
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-emerald-400'
    if (confidence >= 60) return 'text-amber-400'
    return 'text-red-400'
  }
  
  // 별점 계산 (확신도 기반)
  const starCount = Math.round(recommendation.confidence / 20)
  
  if (compact) {
    return (
      <Card className="card-hover border-border/50 bg-card/80">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {recommendation.isHotStock && (
                <Flame className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span className="font-semibold truncate">{recommendation.stockName}</span>
              <span className="text-xs text-muted-foreground shrink-0">{recommendation.stockCode}</span>
            </div>
            <Badge variant="outline" className={cn("text-xs shrink-0 whitespace-nowrap", categoryColor)}>
              {recommendation.category}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {recommendation.currentPrice.toLocaleString()}원
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className={cn(
                "font-semibold whitespace-nowrap",
                isPositive ? "text-emerald-400" : "text-red-400"
              )}>
                {isPositive ? '+' : ''}{potentialReturn}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="card-hover border-border/50 bg-card/80 overflow-hidden relative">
      {/* 무료 공개 + 급등주 표시 (같이 있을 때) */}
      {showFreeBadge && recommendation.isHotStock && (
        <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 px-3 py-1.5 flex items-center justify-between gap-2">
          <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 text-xs px-2 py-0.5 shadow-lg whitespace-nowrap">
            🎁 무료 공개
          </Badge>
          <div className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-red-400" />
            <span className="text-xs font-medium text-red-400">급등주</span>
          </div>
        </div>
      )}
      
      {/* 무료 공개만 (급등주 아닐 때) */}
      {showFreeBadge && !recommendation.isHotStock && (
        <div className="px-3 py-1.5">
          <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 text-xs px-2 py-0.5 shadow-lg whitespace-nowrap">
            🎁 무료 공개
          </Badge>
        </div>
      )}
      
      {/* 급등주만 (무료 공개 아닐 때) */}
      {!showFreeBadge && recommendation.isHotStock && (
        <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 px-4 py-1.5 flex items-center gap-2">
          <Flame className="w-4 h-4 text-red-400" />
          <span className="text-xs font-medium text-red-400">숨겨진 급등주</span>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2 truncate">
              <span className="truncate">{recommendation.stockName}</span>
              {recommendation.isHotStock && (
                <Flame className="w-4 h-4 text-red-400 shrink-0" />
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{recommendation.stockCode}</p>
          </div>
          <Badge variant="outline" className={cn("text-xs shrink-0 whitespace-nowrap", categoryColor)}>
            {recommendation.category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 가격 정보 */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">현재가</p>
            <p className="text-sm sm:text-base font-semibold">
              {recommendation.currentPrice.toLocaleString()}원
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">목표가</p>
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              <p className="text-sm sm:text-base font-semibold text-emerald-400">
                {recommendation.targetPrice.toLocaleString()}원
              </p>
            </div>
          </div>
        </div>
        
        {/* 손절가 */}
        {showStopLoss && recommendation.stopLoss ? (
          <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-400" />
              <span className="text-sm text-muted-foreground">손절가</span>
              <span className="text-sm font-semibold text-red-400">
                {recommendation.stopLoss.toLocaleString()}원
              </span>
            </div>
          </div>
        ) : !showStopLoss && (
          <Link href="/subscriptions">
            <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-muted/70 transition-colors">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                손절가는 Pro 플랜에서 확인 가능
              </span>
            </div>
          </Link>
        )}
        
        {/* 수익률 & 확신도 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span className={cn(
              "text-lg sm:text-xl font-bold whitespace-nowrap",
              isPositive ? "text-emerald-400" : "text-red-400"
            )}>
              {isPositive ? '+' : ''}{potentialReturn}%
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">예상 수익</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">AI 확신도</span>
            <span className={cn(
              "font-semibold whitespace-nowrap",
              getConfidenceColor(recommendation.confidence)
            )}>
              {recommendation.confidence}%
            </span>
          </div>
        </div>
        
        {/* 별점 */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "w-4 h-4",
                star <= starCount 
                  ? "text-amber-400 fill-amber-400" 
                  : "text-muted"
              )}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-2">AI 추천 등급</span>
        </div>
        
        {/* 추천 이유 */}
        <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
        
        {/* 유효기간 */}
        {recommendation.expiresAt && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>
              유효기간: {new Date(recommendation.expiresAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// 시그널 카드
interface SignalCardProps {
  signal: {
    id: string
    stockCode: string
    stockName: string
    signalType: 'BUY' | 'SELL' | 'HOLD' | 'ALERT'
    price: number
    targetPrice?: number | null
    stopLoss?: number | null
    reason: string
    isRead: boolean
    createdAt: string
  }
  onMarkRead?: (id: string) => void
}

export function SignalCard({ signal, onMarkRead }: SignalCardProps) {
  const signalColors = {
    BUY: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    SELL: 'bg-red-500/20 text-red-400 border-red-500/30',
    HOLD: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    ALERT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }
  
  const signalLabels = {
    BUY: '매수',
    SELL: '매도',
    HOLD: '보유',
    ALERT: '주의',
  }
  
  const signalIcons = {
    BUY: TrendingUp,
    SELL: TrendingDown,
    HOLD: Target,
    ALERT: Shield,
  }
  
  const Icon = signalIcons[signal.signalType]
  const timeDiff = getTimeDiff(signal.createdAt)
  
  return (
    <Card 
      className={cn(
        "card-hover border-border/50 bg-card/80",
        !signal.isRead && "ring-1 ring-primary/50"
      )}
      onClick={() => onMarkRead?.(signal.id)}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className={cn(
              "p-2 rounded-lg shrink-0",
              signalColors[signal.signalType].replace('border-', 'bg-').split(' ')[0]
            )}>
              <Icon className={cn(
                "w-4 h-4",
                signal.signalType === 'BUY' ? "text-emerald-400" :
                signal.signalType === 'SELL' ? "text-red-400" :
                signal.signalType === 'HOLD' ? "text-amber-400" : "text-blue-400"
              )} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{signal.stockName}</p>
              <p className="text-xs text-muted-foreground">{signal.stockCode}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge className={cn("border whitespace-nowrap", signalColors[signal.signalType])}>
              {signalLabels[signal.signalType]}
            </Badge>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{timeDiff}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">현재가</span>
          <span className="font-semibold whitespace-nowrap">{signal.price.toLocaleString()}원</span>
        </div>
        
        {signal.targetPrice && (
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">목표가</span>
            <span className="font-semibold text-emerald-400 whitespace-nowrap">
              {signal.targetPrice.toLocaleString()}원
            </span>
          </div>
        )}
        
        {signal.stopLoss && (
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">손절가</span>
            <span className="font-semibold text-red-400 whitespace-nowrap">
              {signal.stopLoss.toLocaleString()}원
            </span>
          </div>
        )}
        
        <p className="text-sm text-muted-foreground mt-3">{signal.reason}</p>
        
        {!signal.isRead && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <span className="text-xs text-primary">• 새로운 시그널</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function getTimeDiff(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}시간 전`
  
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}일 전`
}

