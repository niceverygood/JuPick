'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Lock, 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  Star,
  Bell,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

// 블러 처리된 AI 추천 카드
export function BlurredRecommendationCard({ 
  expectedReturn = '+15.8%',
  confidence = 85,
}: { 
  expectedReturn?: string
  confidence?: number
}) {
  return (
    <Card className="relative overflow-hidden border-border/50 bg-card/80 min-h-[280px]">
      {/* 블러 오버레이 */}
      <div className="absolute inset-0 backdrop-blur-md bg-black/70 z-10 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="p-3 rounded-full bg-primary/20 mb-3">
          <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
        </div>
        <p className="text-xl sm:text-2xl font-bold text-emerald-400 mb-1 whitespace-nowrap">{expectedReturn} 예상</p>
        <p className="text-white font-semibold mb-2 whitespace-nowrap">숨겨진 급등주</p>
        <p className="text-xs sm:text-sm text-muted-foreground text-center mb-4">
          Pro 유저들은 이미 확인하고<br/>매매 중이에요
        </p>
        <Link href="/subscriptions">
          <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 whitespace-nowrap">
            지금 확인하기 →
          </Button>
        </Link>
      </div>
      
      {/* 블러 배경 콘텐츠 */}
      <div className="p-4 opacity-20">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-1 text-orange-400 text-sm">
            <Flame className="w-4 h-4" />
            <span>숨겨진 급등주</span>
          </div>
          <Badge variant="outline" className="text-emerald-400 border-emerald-400">
            급등주
          </Badge>
        </div>
        <h3 className="text-lg font-bold">██████████</h3>
        <p className="text-sm text-muted-foreground mb-3">000000</p>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs text-muted-foreground">현재가</p>
            <p className="text-lg">███,███원</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">목표가</p>
            <p className="text-lg text-emerald-400">███,███원</p>
          </div>
        </div>
        <div className="p-2 bg-muted/30 rounded mb-3">
          <span className="text-sm">○ 손절가 ███,███원</span>
        </div>
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map(i => (
            <Star 
              key={i} 
              className={`w-4 h-4 ${i <= Math.round(confidence/20) ? 'text-amber-400 fill-amber-400' : 'text-muted'}`}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}

// 블러 처리된 시그널 카드
export function BlurredSignalCard({ 
  signalType = 'BUY',
  stockName = '???',
  timeAgo = '10분 전'
}: { 
  signalType?: string
  stockName?: string
  timeAgo?: string
}) {
  const isBuy = signalType === 'BUY' || signalType === '매수'
  
  return (
    <Card className="relative overflow-hidden border-border/50 bg-card/80 min-h-[180px]">
      <div className="absolute inset-0 backdrop-blur-md bg-black/70 z-10 flex flex-col items-center justify-center p-3 sm:p-4">
        <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground mb-2" />
        <Badge className={`${isBuy ? 'bg-emerald-500' : 'bg-red-500'} whitespace-nowrap`}>
          {isBuy ? '매수' : '매도'} 시그널
        </Badge>
        <p className="text-white font-semibold mt-2 text-sm sm:text-base">{stockName}</p>
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 text-center">
          Pro 유저들은 {timeAgo}에 확인
        </p>
        <Link href="/subscriptions">
          <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-500 whitespace-nowrap text-xs sm:text-sm">
            실시간 확인 →
          </Button>
        </Link>
      </div>
      
      <div className="p-4 opacity-20">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-muted">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">██████</h3>
              <p className="text-sm">000000</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>현재가</span>
            <span>███,███원</span>
          </div>
          <div className="flex justify-between">
            <span>목표가</span>
            <span>███,███원</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

// 놓친 수익 배너 (FOMO)
export function MissedProfitBanner({ 
  missedAmount = 2535000,
  proAverage = 2847000,
  freeAverage = 312000
}: {
  missedAmount?: number
  proAverage?: number
  freeAverage?: number
}) {
  return (
    <Card className="p-3 sm:p-4 bg-gradient-to-r from-red-900/40 to-orange-900/40 border-red-500/30">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          <span className="text-2xl sm:text-3xl shrink-0">💸</span>
          <div className="min-w-0">
            <p className="text-sm sm:text-base text-white font-semibold">
              <span className="hidden sm:inline">이번 달 놓친 예상 수익: </span>
              <span className="sm:hidden">놓친 수익: </span>
              <span className="text-red-400 whitespace-nowrap">-{missedAmount.toLocaleString()}원</span>
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              <span className="hidden lg:inline">Pro 유저 평균 +{proAverage.toLocaleString()}원 vs Free 유저 평균 +{freeAverage.toLocaleString()}원</span>
              <span className="lg:hidden">Pro +{(proAverage/10000).toFixed(0)}만원 vs Free +{(freeAverage/10000).toFixed(0)}만원</span>
            </p>
          </div>
        </div>
        <Link href="/subscriptions" className="shrink-0">
          <Button size="sm" className="bg-red-500 hover:bg-red-600 whitespace-nowrap">
            놓치지 않기 →
          </Button>
        </Link>
      </div>
    </Card>
  )
}

// 추가 추천 알림 배너
export function MoreRecommendationsBanner({ 
  count = 2 
}: { 
  count?: number 
}) {
  return (
    <Card className="p-3 sm:p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2 rounded-full bg-purple-500/20 shrink-0">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm sm:text-base text-white font-semibold">
              <span className="text-purple-400">{count}개</span>의 추가 AI 추천이 대기 중
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Pro 유저들은 지금 이 종목들로 매매 중이에요
            </p>
          </div>
        </div>
        <Link href="/subscriptions" className="shrink-0">
          <Button size="sm" variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/20 whitespace-nowrap">
            전체 보기 →
          </Button>
        </Link>
      </div>
    </Card>
  )
}

// 시그널 알림 배너 (카운트다운 포함)
export function SignalAlertBanner({ 
  count = 4,
  countdown = '00:45:32'
}: { 
  count?: number
  countdown?: string
}) {
  return (
    <Card className="p-3 sm:p-4 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-blue-500/30">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative shrink-0">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-ping" />
          </div>
          <div className="min-w-0">
            <p className="text-sm sm:text-base text-white font-semibold">
              🔔 <span className="text-blue-400">{count}개</span> 시그널 발생!
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
              Pro 유저들은 실시간으로 확인하고 매매 중
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-muted-foreground whitespace-nowrap">무료 공개</p>
          <p className="text-lg sm:text-2xl font-mono text-amber-400 whitespace-nowrap">{countdown}</p>
        </div>
      </div>
    </Card>
  )
}

// Pro 유저 실시간 수익 현황 배너
export function ProProfitBanner({ 
  avgProfit = 3.2 
}: { 
  avgProfit?: number 
}) {
  return (
    <Card className="p-3 sm:p-4 border-border/50 bg-card/80">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-muted-foreground">오늘 Pro 유저들은</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-400 whitespace-nowrap">평균 +{avgProfit}% 수익</p>
        </div>
        <Link href="/subscriptions" className="shrink-0">
          <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-500 whitespace-nowrap">
            <span className="hidden sm:inline">나도 실시간으로 받기 →</span>
            <span className="sm:hidden">받기 →</span>
          </Button>
        </Link>
      </div>
    </Card>
  )
}

// 과거 성과 카드 (신뢰 구축)
export function PastPerformanceCard({ 
  performances = [
    { name: '에코프로', recommendPrice: 420000, actualReturn: 16.2 },
    { name: 'POSCO홀딩스', recommendPrice: 380000, actualReturn: 12.5 },
    { name: '한화에어로스페이스', recommendPrice: 110000, actualReturn: 14.8 },
  ]
}: {
  performances?: Array<{ name: string; recommendPrice: number; actualReturn: number }>
}) {
  const avgReturn = performances.reduce((sum, p) => sum + p.actualReturn, 0) / performances.length
  
  return (
    <Card className="p-3 sm:p-4 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border-emerald-500/30">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-lg sm:text-xl">🏆</span>
        <h3 className="text-sm sm:text-lg font-bold text-white">지난 주 급등주 실제 성과</h3>
        <Badge className="bg-emerald-500 text-xs">검증됨</Badge>
      </div>
      
      <div className="space-y-2 mb-4">
        {performances.map((stock, idx) => (
          <div key={idx} className="flex justify-between items-center gap-2 p-2 bg-black/30 rounded">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-muted-foreground w-5 shrink-0">{idx + 1}.</span>
              <span className="text-white font-semibold text-sm sm:text-base truncate">{stock.name}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <span className="text-muted-foreground text-xs hidden md:inline whitespace-nowrap">
                {stock.recommendPrice.toLocaleString()}원
              </span>
              <span className="text-muted-foreground hidden md:inline">→</span>
              <span className="text-emerald-400 font-bold whitespace-nowrap">+{stock.actualReturn}%</span>
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-xs sm:text-sm text-muted-foreground">
        💡 지난 주 평균{' '}
        <span className="text-emerald-400 font-bold">+{avgReturn.toFixed(1)}%</span> 수익!
      </p>
    </Card>
  )
}

// 급등주 블러 미리보기 카드
export function HotStockPreviewCard({ 
  count = 3,
  stocks = [
    { expectedReturn: '+15.8%' },
    { expectedReturn: '+22.4%' },
    { expectedReturn: '+18.1%' },
  ]
}: {
  count?: number
  stocks?: Array<{ expectedReturn: string }>
}) {
  return (
    <Card className="p-4 sm:p-6 border-border/50 bg-card/80">
      <div className="text-center mb-4 sm:mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-orange-500/20 mb-3 sm:mb-4">
          <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">이번 주 급등 예상 종목</h3>
        <p className="text-sm sm:text-base text-muted-foreground">
          발견된 급등주: <span className="text-orange-400 font-bold">{count}개</span>
        </p>
      </div>
      
      {/* 블러 미리보기 */}
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        {stocks.map((stock, idx) => (
          <div key={idx} className="p-2 sm:p-3 bg-muted/30 rounded flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <span className="text-muted-foreground shrink-0">{idx + 1}.</span>
              <span className="text-muted-foreground blur-sm select-none truncate">██████████</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-emerald-400 font-bold text-sm sm:text-base whitespace-nowrap">{stock.expectedReturn}</span>
              <Lock className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
          어제 공개된 '에코프로' → 오늘{' '}
          <span className="text-emerald-400 font-bold">+16.2%</span> 상승!
        </p>
        <Link href="/subscriptions">
          <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
            <Flame className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">이번 주 급등주 확인하기 →</span>
            <span className="sm:hidden">급등주 확인 →</span>
          </Button>
        </Link>
        <p className="text-xs text-muted-foreground mt-2 sm:mt-3">Pro 플랜에서 주 5개 확인 가능</p>
      </div>
    </Card>
  )
}

// 리포트 블러 섹션
export function BlurredReportSection({ 
  sectors = ['바이오', 'AI/소프트웨어', '금융']
}: {
  sectors?: string[]
}) {
  return (
    <div className="relative mt-4">
      <div className="absolute inset-0 backdrop-blur-md bg-black/60 z-10 flex flex-col items-center justify-center p-6 rounded-lg">
        <Lock className="w-6 h-6 text-muted-foreground mb-2" />
        <p className="text-white font-semibold mb-1">
          상세 분석 {sectors.length}개 섹터 더 보기
        </p>
        <p className="text-sm text-muted-foreground mb-3">
          [{sectors.join('] [')}]
        </p>
        <Link href="/subscriptions">
          <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
            전체 리포트 보기 →
          </Button>
        </Link>
      </div>
      
      <div className="opacity-20 space-y-3 p-4">
        {sectors.slice(0, 2).map((sector, idx) => (
          <div key={idx}>
            <p className="text-muted-foreground">[{sector}]</p>
            <ul className="text-muted-foreground space-y-1 ml-4 text-sm">
              <li>- ████████████████████</li>
              <li>- ████████████████████</li>
              <li>- 투자의견: ████</li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

// Premium AI 예측 잠금 섹션
export function LockedPremiumSection() {
  return (
    <Card className="p-4 bg-muted/30 border-border/50 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-purple-400" />
          <span className="text-muted-foreground text-sm">Premium 전용: AI 예측 분석</span>
        </div>
        <Link href="/subscriptions">
          <Button variant="link" className="text-purple-400 p-0 h-auto">
            업그레이드 →
          </Button>
        </Link>
      </div>
    </Card>
  )
}

// 무료 공개 배지
export function FreeBadge() {
  return (
    <Badge className="bg-emerald-500 text-white">
      🎁 무료 공개
    </Badge>
  )
}

