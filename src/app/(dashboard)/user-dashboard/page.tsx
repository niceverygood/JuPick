'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  useRecommendations, 
  useRequestRecommendation,
  useSignals,
  useHotStocks,
  useMarketReports,
  usePortfolioAnalysis,
  useConsultations
} from '@/hooks/usePlanFeatures'
import { RecommendationCard, SignalCard } from '@/components/user/RecommendationCard'
import { UpgradePrompt } from '@/components/user/UpgradePrompt'
import {
  BlurredRecommendationCard,
  BlurredSignalCard,
  MissedProfitBanner,
  MoreRecommendationsBanner,
  SignalAlertBanner,
  ProProfitBanner,
  PastPerformanceCard,
  HotStockPreviewCard,
  BlurredReportSection,
  LockedPremiumSection
} from '@/components/user/BlurredCards'
import { PLAN_DISPLAY_CONFIG, DisplayPlanType } from '@/lib/planDisplayConfig'
import {
  MOCK_RECOMMENDATIONS,
  MOCK_SIGNALS,
  MOCK_HOT_STOCKS,
  MOCK_PAST_PERFORMANCE,
  MOCK_REPORTS,
  MOCK_PORTFOLIO_ANALYSIS,
  MOCK_CONSULTATIONS,
  getMissedProfitData,
  BLURRED_RETURNS
} from '@/lib/mockData'
import { 
  Sparkles, 
  TrendingUp, 
  Bell, 
  Flame, 
  Loader2,
  FileText,
  Briefcase,
  MessageSquare,
  RefreshCw,
  Crown,
  Zap,
  Lock,
  Star,
  Clock,
  Trophy
} from 'lucide-react'
import { PLAN_NAMES, PlanType } from '@/lib/planLimits'
import Link from 'next/link'

export default function UserDashboard() {
  const { data: session } = useSession()
  const sessionPlan = (session?.user as any)?.plan as PlanType || 'FREE'
  
  // 클라이언트 렌더링 완료 여부 (하이드레이션 에러 방지)
  const [isClient, setIsClient] = useState(false)
  
  // 개발용 플랜 테스트 (localStorage에서 복원)
  const [testPlan, setTestPlan] = useState<DisplayPlanType>(sessionPlan as DisplayPlanType)
  
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('testPlan')
      if (saved && ['FREE', 'BASIC', 'PRO', 'PREMIUM'].includes(saved)) {
        setTestPlan(saved as DisplayPlanType)
      }
    }
  }, [])
  
  const handlePlanChange = (plan: DisplayPlanType) => {
    setTestPlan(plan)
    if (typeof window !== 'undefined') {
      localStorage.setItem('testPlan', plan)
    }
  }
  
  // 실제 사용할 플랜 (개발 모드에서는 테스트 플랜 사용)
  const userPlan = testPlan
  
  // 클라이언트 렌더링 전까지는 로딩 표시
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 개발용 플랜 전환 버튼 */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="p-3 border-amber-500/50 bg-amber-500/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-amber-400 font-medium">🔧 테스트 플랜:</span>
            {(['FREE', 'BASIC', 'PRO', 'PREMIUM'] as DisplayPlanType[]).map(plan => (
              <Button
                key={plan}
                size="sm"
                variant={testPlan === plan ? 'default' : 'outline'}
                onClick={() => handlePlanChange(plan)}
                className={testPlan === plan ? 'bg-primary' : ''}
              >
                {plan}
              </Button>
            ))}
          </div>
        </Card>
      )}
      
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-400" />
            안녕하세요, {session?.user?.name || '유저'}님! 👋
          </h1>
          <p className="text-muted-foreground">
            AI가 오늘도 열심히 분석 중입니다
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-primary to-violet-600 text-white border-0 px-3 py-1">
            {PLAN_NAMES[userPlan] || userPlan} 플랜
          </Badge>
          <Link href="/subscriptions">
            <Button variant="outline" size="sm">
              <Zap className="w-4 h-4 mr-2" />
              업그레이드
            </Button>
          </Link>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <Tabs defaultValue="recommendations" className="w-full">
        {/* 탭 헤더 */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-4 -mx-1 px-1">
          <TabsList className="w-full flex flex-wrap justify-start gap-1 h-auto p-2">
            <TabsTrigger value="recommendations" className="gap-2 min-w-[100px] flex-1 sm:flex-none">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">AI 추천</span>
              <span className="sm:hidden">추천</span>
            </TabsTrigger>
            <TabsTrigger value="signals" className="gap-2 min-w-[100px] flex-1 sm:flex-none">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">시그널</span>
              <span className="sm:hidden">시그널</span>
            </TabsTrigger>
            <TabsTrigger value="hotStocks" className="gap-2 min-w-[100px] flex-1 sm:flex-none">
              <Flame className="w-4 h-4" />
              <span className="hidden sm:inline">급등주</span>
              <span className="sm:hidden">급등주</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2 min-w-[100px] flex-1 sm:flex-none">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">리포트</span>
              <span className="sm:hidden">리포트</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="gap-2 min-w-[100px] flex-1 sm:flex-none">
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">포트폴리오</span>
              <span className="sm:hidden">분석</span>
            </TabsTrigger>
            <TabsTrigger value="consultation" className="gap-2 min-w-[100px] flex-1 sm:flex-none">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">상담</span>
              <span className="sm:hidden">상담</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 탭 콘텐츠 영역 */}
        <div className="relative mt-2">
          <TabsContent value="recommendations" className="m-0">
            <RecommendationsSection userPlan={userPlan} />
          </TabsContent>

          <TabsContent value="signals" className="m-0">
            <SignalsSection userPlan={userPlan} />
          </TabsContent>

          <TabsContent value="hotStocks" className="m-0">
            <HotStocksSection userPlan={userPlan} />
          </TabsContent>

          <TabsContent value="reports" className="m-0">
            <ReportsSection userPlan={userPlan} />
          </TabsContent>

          <TabsContent value="portfolio" className="m-0">
            <PortfolioSection userPlan={userPlan} />
          </TabsContent>

          <TabsContent value="consultation" className="m-0">
            <ConsultationSection userPlan={userPlan} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

// AI 추천 섹션
function RecommendationsSection({ userPlan }: { userPlan: DisplayPlanType }) {
  const { data, isLoading, error, refetch } = useRecommendations()
  const requestRec = useRequestRecommendation()
  const config = PLAN_DISPLAY_CONFIG[userPlan].aiRecommendation
  
  // 개발 모드에서는 항상 Mock 데이터 사용
  const useTestData = process.env.NODE_ENV === 'development'
  
  if (isLoading && !useTestData) {
    return <LoadingState message="AI 추천을 불러오는 중..." />
  }

  // 개발 모드: Mock 데이터 / 프로덕션: API 데이터
  const recommendations = useTestData ? MOCK_RECOMMENDATIONS : (data?.recommendations || [])
  const visible = recommendations.slice(0, config.visibleCount === Infinity ? recommendations.length : config.visibleCount)
  const blurred = recommendations.slice(visible.length, visible.length + config.blurredCount)
  const usedToday = useTestData ? 0 : (data?.usedToday || 0)
  const limitDisplay = config.dailyLimit === Infinity ? '무제한' : config.dailyLimit
  const missedProfit = getMissedProfitData(userPlan)

  return (
    <div className="space-y-4">
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <CardTitle>AI 주식 추천</CardTitle>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                오늘 {usedToday} / {limitDisplay} 사용
              </span>
              <Button 
                onClick={() => requestRec.mutate()}
                disabled={requestRec.isPending || (config.dailyLimit !== Infinity && usedToday >= config.dailyLimit)}
                className="bg-gradient-to-r from-emerald-500 to-teal-500"
              >
                {requestRec.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                새 추천 받기
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Free/Basic 유저: 놓친 수익 배너 */}
          {(userPlan === 'FREE' || userPlan === 'BASIC') && (
            <MissedProfitBanner 
              missedAmount={missedProfit.missedAmount}
              proAverage={missedProfit.proAverage}
              freeAverage={userPlan === 'FREE' ? missedProfit.freeAverage : (missedProfit as any).basicAverage}
            />
          )}
          
          {/* 추천 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 공개된 카드 */}
            {visible.map((rec, idx) => (
              <RecommendationCard 
                key={rec.id}
                recommendation={rec}
                showStopLoss={config.showStopLoss}
                showFreeBadge={userPlan === 'FREE' && idx === 0}
              />
            ))}
            
            {/* 블러 처리된 카드 */}
            {blurred.map((rec, idx) => (
              <BlurredRecommendationCard 
                key={`blur-${idx}`}
                expectedReturn={BLURRED_RETURNS[idx % BLURRED_RETURNS.length]}
                confidence={80 + (idx * 3) % 15}
              />
            ))}
            
            {recommendations.length === 0 && blurred.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <p>아직 추천이 없습니다. "새 추천 받기" 버튼을 클릭하세요.</p>
              </div>
            )}
          </div>
          
          {/* 추가 추천 알림 */}
          {blurred.length > 0 && <MoreRecommendationsBanner count={blurred.length} />}
          
          {/* 일일 한도 초과 경고 */}
          {config.dailyLimit !== Infinity && usedToday >= config.dailyLimit && (
            <Card className="p-3 bg-amber-500/10 border-amber-500/30">
              <p className="text-amber-400 text-sm">
                ⚠️ 오늘의 추천 횟수를 모두 사용했습니다.{' '}
                <Link href="/subscriptions" className="underline font-semibold">
                  플랜 업그레이드
                </Link>
                로 더 많은 추천을 받아보세요!
              </p>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// 실시간 시그널 섹션
function SignalsSection({ userPlan }: { userPlan: DisplayPlanType }) {
  const { data, isLoading, error } = useSignals()
  const config = PLAN_DISPLAY_CONFIG[userPlan].signal
  const useTestData = process.env.NODE_ENV === 'development'
  
  // 카운트다운 타이머 - 하이드레이션 에러 방지를 위해 초기값 0
  const [countdown, setCountdown] = useState(0)
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
    if (config.delayMinutes === 0) return
    setCountdown(config.delayMinutes * 60) // 클라이언트에서만 초기화
    const timer = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [config.delayMinutes])
  
  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
  }

  if (isLoading && !useTestData) {
    return <LoadingState message="실시간 시그널을 불러오는 중..." />
  }

  // 테스트 모드: 더미 데이터 / 실제 모드: API 데이터
  const signals = useTestData ? MOCK_SIGNALS : (data?.signals || [])
  const visible = signals.slice(0, config.visibleCount === Infinity ? signals.length : config.visibleCount)
  const blurred = signals.slice(visible.length, visible.length + config.blurredCount)
  
  const buyCount = signals.filter((s: any) => s.signalType === 'BUY').length
  const sellCount = signals.filter((s: any) => s.signalType === 'SELL').length

  return (
    <div className="space-y-4">
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-400" />
              <CardTitle>실시간 시그널</CardTitle>
              <Badge className="bg-red-500 animate-pulse">{signals.length}</Badge>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-emerald-400 border-emerald-400">
                매수 {buyCount}
              </Badge>
              <Badge variant="outline" className="text-red-400 border-red-400">
                매도 {sellCount}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Free/Basic 유저: 시그널 알림 배너 */}
          {blurred.length > 0 && config.delayMinutes > 0 && (
            <SignalAlertBanner count={blurred.length} countdown={formatTime(countdown)} />
          )}
          
          {/* 시그널 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 공개된 시그널 */}
            {visible.map((signal: any, idx: number) => (
              <div key={signal.id} className="relative">
                {config.delayMinutes > 0 && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge variant="outline" className="text-amber-400 border-amber-400 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {config.delayMinutes}분 지연
                    </Badge>
                  </div>
                )}
                <SignalCard 
                  signal={{
                    ...signal,
                    currentPrice: config.showPrice ? signal.currentPrice : null,
                    targetPrice: config.showPrice ? signal.targetPrice : null,
                    stopLoss: config.showPrice ? signal.stopLoss : null,
                  }}
                />
              </div>
            ))}
            
            {/* 블러 시그널 */}
            {blurred.map((signal: any, idx: number) => (
              <BlurredSignalCard 
                key={`blur-${idx}`}
                signalType={signal.signalType}
                stockName={signal.stockName}
                timeAgo={`${5 + (idx * 7) % 30}분 전`}
              />
            ))}
            
            {signals.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <p>아직 시그널이 없습니다.</p>
              </div>
            )}
          </div>
          
          {/* Pro 유저 실시간 수익 현황 */}
          {userPlan === 'FREE' && signals.length > 0 && <ProProfitBanner />}
        </CardContent>
      </Card>
    </div>
  )
}

// 숨겨진 급등주 섹션
function HotStocksSection({ userPlan }: { userPlan: DisplayPlanType }) {
  const { data, isLoading, error, refetch } = useHotStocks()
  const config = PLAN_DISPLAY_CONFIG[userPlan].hotStock
  const useTestData = process.env.NODE_ENV === 'development'

  if (isLoading && !useTestData) {
    return <LoadingState message="숨겨진 급등주를 불러오는 중..." />
  }

  // 테스트 모드: 더미 데이터 / 실제 모드: API 데이터
  const hotStocks = useTestData ? MOCK_HOT_STOCKS : (data?.hotStocks || [])
  const limitDisplay = config.weeklyLimit === Infinity ? '무제한' : config.weeklyLimit === 0 ? '잠금' : config.weeklyLimit

  // Free/Basic: 과거 성과 + 블러 미리보기
  if (config.showPastOnly) {
    return (
      <div className="space-y-4">
        <Card className="border-border/50 bg-card/80">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <CardTitle>숨겨진 급등주</CardTitle>
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500">HOT</Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                이번 주 0 / {limitDisplay} 확인
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* 과거 성과 (신뢰 구축) */}
            <PastPerformanceCard performances={MOCK_PAST_PERFORMANCE} />
            
            {/* 이번 주 급등주 (블러 미리보기) */}
            <HotStockPreviewCard 
              count={hotStocks.length || 5}
              stocks={hotStocks.slice(0, 3).map((s: any) => ({ 
                expectedReturn: s.expectedReturn || `+${Math.round(((s.targetPrice - s.currentPrice) / s.currentPrice) * 100)}%` 
              }))}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Pro/Premium: 전체 공개
  const visible = hotStocks.slice(0, config.visibleCount === Infinity ? hotStocks.length : config.visibleCount)

  return (
    <div className="space-y-4">
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-400" />
              <CardTitle>숨겨진 급등주</CardTitle>
              <Badge className="bg-gradient-to-r from-red-500 to-orange-500">HOT</Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                이번 주 {data?.usedThisWeek || 0} / {limitDisplay} 확인
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetch()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                새로고침
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visible.map((stock: any) => (
              <RecommendationCard 
                key={stock.id} 
                recommendation={stock}
                showStopLoss={true}
              />
            ))}
            {hotStocks.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <p>현재 급등 예상 종목이 없습니다.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 시장 리포트 섹션
function ReportsSection({ userPlan }: { userPlan: DisplayPlanType }) {
  const { data, isLoading, error } = useMarketReports()
  const config = PLAN_DISPLAY_CONFIG[userPlan].report

  if (isLoading) {
    return <LoadingState message="시장 리포트를 불러오는 중..." />
  }

  if (error && (error as any).upgradeRequired) {
    return (
      <UpgradePrompt 
        feature="시장 분석 리포트" 
        requiredPlan={(error as any).requiredPlan}
        message={(error as any).message}
      />
    )
  }

  const levelLabels = {
    summary: '요약',
    basic: '기본',
    detailed: '상세',
    premium: '프리미엄',
  }
  
  // 섹터 데이터
  const allSectors = [
    { name: '반도체', content: ['AI 서버용 HBM 수요 지속 증가', '삼성전자, SK하이닉스 실적 개선 기대', '투자의견: 비중확대'] },
    { name: '2차전지', content: ['전기차 판매 둔화에도 불구, ESS 수요 급증', 'LG에너지솔루션, 삼성SDI 수익성 개선 전망', '투자의견: 중립'] },
    { name: '바이오', content: ['신약 파이프라인 확대', '삼성바이오로직스 CDMO 성장', '투자의견: 비중확대'] },
    { name: 'AI/소프트웨어', content: ['AI 투자 가속화', '네이버, 카카오 AI 서비스 확대', '투자의견: 비중확대'] },
    { name: '금융', content: ['금리 인하 기대감', '은행주 배당 매력', '투자의견: 중립'] },
  ]
  
  const visibleSectors = allSectors.slice(0, config.showSectors === Infinity ? allSectors.length : config.showSectors)
  const blurredSectors = config.blurRest ? allSectors.slice(visibleSectors.length) : []

  return (
    <div className="space-y-4">
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <CardTitle>시장 분석 리포트</CardTitle>
            </div>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              {levelLabels[config.level]} 레벨
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">2026년 1월 2주차 주간 시장 전망</CardTitle>
                  <CardDescription>2026. 1. 11.</CardDescription>
                </div>
                <Badge variant="outline">주간</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 섹션 헤더 */}
              <div className="flex items-center gap-2 text-blue-400">
                <FileText className="w-4 h-4" />
                <span className="font-semibold">📊 주간 시장 상세 분석</span>
              </div>

              {/* 거시경제 (항상 표시) */}
              <div>
                <h4 className="font-semibold text-white mb-2">■ 거시경제 환경</h4>
                <ul className="text-muted-foreground space-y-1 ml-4 text-sm">
                  <li>- 미국 금리 동결 기조 유지 예상</li>
                  <li>- 달러/원 환율 1,300원대 안정세</li>
                  <li>- 국내 수출 전년 대비 10% 증가 예상</li>
                </ul>
              </div>

              {/* 섹터별 분석 */}
              <div>
                <h4 className="font-semibold text-white mb-2">■ 섹터별 분석</h4>
                
                {/* 공개 섹터 */}
                {visibleSectors.map((sector, idx) => (
                  <div key={idx} className="mb-3">
                    <p className="text-muted-foreground">[{sector.name}]</p>
                    <ul className="text-muted-foreground space-y-1 ml-4 text-sm">
                      {sector.content.map((line, i) => (
                        <li key={i}>- {line}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                
                {/* 블러 섹터 */}
                {blurredSectors.length > 0 && (
                  <BlurredReportSection sectors={blurredSectors.map(s => s.name)} />
                )}
              </div>

              {/* Premium AI 예측 섹션 */}
              {config.level === 'premium' ? (
                <Card className="p-4 bg-purple-900/20 border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-purple-500">Premium 전용</Badge>
                    <span className="text-purple-400 font-semibold">AI 예측 분석</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    다음 주 코스피 예상 범위: 2,650 ~ 2,780 (AI 확신도 87%)<br/>
                    주요 이벤트: FOMC 회의 (1/15), 삼성전자 실적발표 (1/17)
                  </p>
                </Card>
              ) : (
                <LockedPremiumSection />
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}

// 포트폴리오 분석 섹션
function PortfolioSection({ userPlan }: { userPlan: DisplayPlanType }) {
  const { data, isLoading, error } = usePortfolioAnalysis()
  const config = PLAN_DISPLAY_CONFIG[userPlan].portfolio
  const useTestData = process.env.NODE_ENV === 'development'

  if (config.locked) {
    return (
      <UpgradePrompt 
        feature="포트폴리오 AI 분석" 
        requiredPlan="PREMIUM"
        message="포트폴리오 AI 분석은 Premium 플랜에서만 이용 가능합니다."
        benefits={[
          '🔍 AI가 보유 종목을 실시간 분석하여 맞춤 조언 제공',
          '📊 섹터별 배분 최적화 및 리밸런싱 제안',
          '💰 예상 배당 수익 및 세금 최적화 팁',
          '⚠️ 위험 요인 분석 및 헷지 전략 제안',
          '📈 코스피 대비 성과 비교 리포트'
        ]}
      />
    )
  }

  if (isLoading && !useTestData) {
    return <LoadingState message="포트폴리오 분석을 불러오는 중..." />
  }

  // 테스트 모드: 더미 데이터 / 실제 모드: API 데이터
  const analysis = useTestData ? MOCK_PORTFOLIO_ANALYSIS : data?.analysis
  
  if (!analysis) {
    return (
      <Card className="border-border/50 bg-card/80">
        <CardContent className="py-8 text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            아직 포트폴리오 분석이 없습니다.
          </p>
          <Link href="/portfolio-analysis">
            <Button className="bg-gradient-to-r from-violet-500 to-purple-600">
              포트폴리오 분석하기
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* 프리미엄 배지 헤더 */}
      <Card className="border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-violet-900/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Briefcase className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  포트폴리오 AI 분석
                  <Badge className="bg-gradient-to-r from-purple-500 to-violet-500">PREMIUM</Badge>
                </CardTitle>
                <CardDescription>
                  최근 분석: {new Date(analysis.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
            </div>
            <Link href="/portfolio-analysis">
              <Button variant="outline" size="sm" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                <RefreshCw className="w-4 h-4 mr-2" />
                재분석
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* 핵심 지표 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/80 border-border/50">
          <p className="text-xs text-muted-foreground">총 자산</p>
          <p className="text-2xl font-bold">{analysis.totalValue.toLocaleString()}원</p>
          <p className="text-xs text-emerald-400">+{analysis.profitRate}% 수익률</p>
        </Card>
        <Card className="p-4 bg-card/80 border-border/50">
          <p className="text-xs text-muted-foreground">총 수익</p>
          <p className={`text-2xl font-bold ${analysis.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {analysis.totalProfit >= 0 ? '+' : ''}{analysis.totalProfit.toLocaleString()}원
          </p>
          <p className="text-xs text-muted-foreground">
            코스피 대비 +{analysis.benchmarkComparison?.outperformance || 11.5}%
          </p>
        </Card>
        <Card className="p-4 bg-card/80 border-border/50">
          <p className="text-xs text-muted-foreground">위험도</p>
          <p className={`text-2xl font-bold ${
            analysis.riskScore < 40 ? 'text-emerald-400' :
            analysis.riskScore < 70 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {analysis.riskScore}점
          </p>
          <p className="text-xs text-muted-foreground">
            {analysis.riskAnalysis?.riskLevel || '중간'} 위험
          </p>
        </Card>
        <Card className="p-4 bg-card/80 border-border/50">
          <p className="text-xs text-muted-foreground">예상 연간 배당</p>
          <p className="text-2xl font-bold text-amber-400">
            {(analysis.dividendForecast?.annualDividend || 1250000).toLocaleString()}원
          </p>
          <p className="text-xs text-muted-foreground">
            배당수익률 {analysis.dividendForecast?.dividendYield || 2.4}%
          </p>
        </Card>
      </div>

      {/* AI 리밸런싱 제안 (Premium 핵심 기능) */}
      <Card className="border-amber-500/30 bg-amber-900/10">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <CardTitle className="text-lg">🔥 AI 리밸런싱 제안</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {(analysis.rebalancingSuggestions || []).map((suggestion: any, idx: number) => (
            <div key={idx} className={`p-3 rounded-lg flex items-center justify-between ${
              suggestion.action === 'SELL' ? 'bg-red-500/10 border border-red-500/30' :
              suggestion.action === 'BUY' ? 'bg-emerald-500/10 border border-emerald-500/30' :
              'bg-muted/30'
            }`}>
              <div className="flex items-center gap-3">
                <Badge className={
                  suggestion.action === 'SELL' ? 'bg-red-500' :
                  suggestion.action === 'BUY' ? 'bg-emerald-500' : 'bg-amber-500'
                }>
                  {suggestion.action === 'SELL' ? '매도' : suggestion.action === 'BUY' ? '매수' : '유지'}
                </Badge>
                <div>
                  <p className="font-semibold text-white">{suggestion.stock}</p>
                  <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm">
                  {suggestion.currentWeight}% → {suggestion.targetWeight}%
                </p>
                <Badge variant="outline" className={
                  suggestion.urgency === 'HIGH' ? 'text-red-400 border-red-400' :
                  suggestion.urgency === 'MEDIUM' ? 'text-amber-400 border-amber-400' :
                  'text-emerald-400 border-emerald-400'
                }>
                  {suggestion.urgency === 'HIGH' ? '긴급' : suggestion.urgency === 'MEDIUM' ? '권장' : '참고'}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 보유 종목 분석 */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">📊 보유 종목 상세 분석</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(analysis.holdings || []).map((holding: any, idx: number) => (
              <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{holding.name}</span>
                    <Badge variant="outline" className={
                      holding.recommendation === 'BUY' ? 'text-emerald-400 border-emerald-400' :
                      holding.recommendation === 'SELL' ? 'text-red-400 border-red-400' :
                      'text-amber-400 border-amber-400'
                    }>
                      {holding.recommendation === 'BUY' ? '매수' : holding.recommendation === 'SELL' ? '매도' : '유지'}
                    </Badge>
                  </div>
                  <span className={`font-bold ${holding.profitRate >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {holding.profitRate >= 0 ? '+' : ''}{holding.profitRate}%
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">평단가</span>
                    <p>{holding.avgPrice?.toLocaleString() || '-'}원</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">현재가</span>
                    <p>{holding.currentPrice?.toLocaleString() || '-'}원</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">목표가</span>
                    <p className="text-emerald-400">{holding.targetPrice?.toLocaleString() || '-'}원</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">비중</span>
                    <p>{holding.weight}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 세금 최적화 & 위험 분석 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 세금 최적화 */}
        <Card className="border-emerald-500/30 bg-emerald-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              💰 세금 최적화 팁
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3">
              <p className="text-sm text-muted-foreground">예상 세금</p>
              <p className="text-xl font-bold">{(analysis.taxOptimization?.estimatedTax || 1750000).toLocaleString()}원</p>
              <p className="text-xs text-emerald-400">
                절감 가능: {(analysis.taxOptimization?.savingOpportunity || 350000).toLocaleString()}원
              </p>
            </div>
            <ul className="space-y-2">
              {(analysis.taxOptimization?.tips || []).map((tip: string, idx: number) => (
                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 위험 분석 */}
        <Card className="border-red-500/30 bg-red-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              ⚠️ 위험 요인 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div>
                <span className="text-muted-foreground">변동성</span>
                <p className="font-semibold">{analysis.riskAnalysis?.volatility || 18.5}%</p>
              </div>
              <div>
                <span className="text-muted-foreground">최대 낙폭</span>
                <p className="font-semibold text-red-400">{analysis.riskAnalysis?.maxDrawdown || -12.3}%</p>
              </div>
            </div>
            <div className="space-y-2">
              {(analysis.riskAnalysis?.riskFactors || []).map((risk: any, idx: number) => (
                <div key={idx} className="text-xs p-2 bg-black/20 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">{risk.factor}</span>
                    <Badge variant="outline" className={
                      risk.impact === 'HIGH' ? 'text-red-400 border-red-400' :
                      risk.impact === 'MEDIUM' ? 'text-amber-400 border-amber-400' :
                      'text-emerald-400 border-emerald-400'
                    }>
                      {risk.impact}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{risk.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI 투자 제안 */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">✨ AI 맞춤 투자 제안</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.suggestions.map((suggestion: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-sm p-2 bg-muted/30 rounded">
                <span className="text-muted-foreground">{suggestion}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

// 전문가 상담 섹션
function ConsultationSection({ userPlan }: { userPlan: DisplayPlanType }) {
  const { data, isLoading, error } = useConsultations()
  const config = PLAN_DISPLAY_CONFIG[userPlan].consultation
  const useTestData = process.env.NODE_ENV === 'development'

  if (config.locked) {
    return (
      <UpgradePrompt 
        feature="1:1 VIP 전문가 상담" 
        requiredPlan="PREMIUM"
        message="VIP 전문가 상담은 Premium 플랜에서만 이용 가능합니다."
        benefits={[
          '🎯 월 2회 전문가 1:1 맞춤 상담 (45분)',
          '📹 화상 통화 / 전화 / 채팅 선택 가능',
          '👨‍💼 업종별 전문 애널리스트 직접 매칭',
          '📋 상담 후 맞춤 투자 리포트 제공',
          '⚡ 우선 예약 및 긴급 상담 지원',
          '💯 만족 보장 제도 (불만족 시 재상담)'
        ]}
      />
    )
  }

  if (isLoading && !useTestData) {
    return <LoadingState message="상담 정보를 불러오는 중..." />
  }
  
  // 테스트 모드: 더미 데이터 / 실제 모드: API 데이터
  const consultations = useTestData ? MOCK_CONSULTATIONS : (data?.consultations || [])

  return (
    <div className="space-y-4">
      {/* VIP 상담 헤더 */}
      <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-900/20 to-teal-900/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  1:1 VIP 전문가 상담
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500">PREMIUM</Badge>
                </CardTitle>
                <CardDescription>
                  이번 달 {data?.usedThisMonth || 0} / 2 사용
                </CardDescription>
              </div>
            </div>
            <Link href="/consultation">
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
                <Clock className="w-4 h-4 mr-2" />
                상담 예약하기
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* VIP 혜택 배너 */}
      <Card className="border-amber-500/30 bg-amber-900/10">
        <CardContent className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl mb-1">📹</div>
              <p className="text-xs text-muted-foreground">화상 상담</p>
              <p className="text-sm font-semibold text-amber-400">지원</p>
            </div>
            <div>
              <div className="text-2xl mb-1">⏱️</div>
              <p className="text-xs text-muted-foreground">상담 시간</p>
              <p className="text-sm font-semibold text-amber-400">45분</p>
            </div>
            <div>
              <div className="text-2xl mb-1">📋</div>
              <p className="text-xs text-muted-foreground">사후 리포트</p>
              <p className="text-sm font-semibold text-amber-400">제공</p>
            </div>
            <div>
              <div className="text-2xl mb-1">⚡</div>
              <p className="text-xs text-muted-foreground">우선 예약</p>
              <p className="text-sm font-semibold text-amber-400">VIP</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 상담 내역 */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">📝 상담 내역</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {consultations.map((consultation: any) => (
            <Card key={consultation.id} className={`${
              consultation.status === 'COMPLETED' ? 'bg-emerald-500/5 border-emerald-500/30' :
              consultation.status === 'SCHEDULED' ? 'bg-blue-500/5 border-blue-500/30' :
              'bg-muted/30'
            }`}>
              <CardContent className="pt-4">
                {/* 전문가 정보 */}
                {consultation.expert && (
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                      {consultation.expert.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{consultation.expert.name}</span>
                        <Badge variant="outline" className="text-xs">{consultation.expert.title}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{consultation.expert.specialty}</span>
                        <span>•</span>
                        <span>경력 {consultation.expert.experience}</span>
                        <span>•</span>
                        <span className="text-amber-400">⭐ {consultation.expert.rating}</span>
                      </div>
                    </div>
                    {consultation.status === 'SCHEDULED' && consultation.meetingType === 'VIDEO' && (
                      <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                        <span className="mr-1">📹</span> 화상 입장
                      </Button>
                    )}
                  </div>
                )}

                {/* 상담 상태 및 날짜 */}
                <div className="flex justify-between items-start mb-2">
                  <Badge className={
                    consultation.status === 'COMPLETED' ? 'bg-emerald-500' :
                    consultation.status === 'SCHEDULED' ? 'bg-blue-500' :
                    consultation.status === 'CANCELLED' ? 'bg-red-500' : 'bg-amber-500'
                  }>
                    {consultation.status === 'PENDING' && '⏳ 대기중'}
                    {consultation.status === 'SCHEDULED' && '📅 예약됨'}
                    {consultation.status === 'COMPLETED' && '✅ 완료'}
                    {consultation.status === 'CANCELLED' && '❌ 취소됨'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {consultation.status === 'SCHEDULED' 
                      ? `예약: ${new Date(consultation.scheduledAt).toLocaleString()}`
                      : new Date(consultation.createdAt).toLocaleDateString()
                    }
                  </span>
                </div>

                {/* 질문 */}
                <p className="text-sm mb-3 p-2 bg-black/20 rounded">
                  <span className="text-muted-foreground">Q. </span>
                  {consultation.question}
                </p>

                {/* 답변 */}
                {consultation.answer && (
                  <div className="p-3 bg-emerald-500/10 rounded-lg mb-3">
                    <p className="text-sm text-emerald-400">
                      <span className="font-semibold">A. </span>
                      {consultation.answer}
                    </p>
                  </div>
                )}

                {/* 만족도 & 사후 리포트 */}
                {consultation.status === 'COMPLETED' && (
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    {consultation.satisfaction && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">만족도:</span>
                        {[1,2,3,4,5].map(star => (
                          <Star key={star} className={`w-4 h-4 ${
                            star <= consultation.satisfaction ? 'text-amber-400 fill-amber-400' : 'text-muted'
                          }`} />
                        ))}
                      </div>
                    )}
                    {consultation.followUpReport && (
                      <Button size="sm" variant="outline" className="text-emerald-400 border-emerald-400 hover:bg-emerald-500/10">
                        📋 리포트 다운로드
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {consultations.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">아직 상담 내역이 없습니다.</p>
              <Link href="/consultation">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
                  첫 상담 신청하기
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 전문가 소개 */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">👨‍💼 담당 전문가</CardTitle>
          <CardDescription>Premium 회원 전용 VIP 애널리스트 팀</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: '김주식', title: '수석 애널리스트', specialty: '반도체/IT', rating: 4.9, consultations: 1247 },
              { name: '박배터리', title: '섹터 전문가', specialty: '2차전지/신재생', rating: 4.8, consultations: 892 },
              { name: '이바이오', title: '헬스케어 전문가', specialty: '바이오/제약', rating: 4.7, consultations: 654 },
            ].map((expert, idx) => (
              <div key={idx} className="p-4 bg-muted/30 rounded-lg text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xl font-bold">
                  {expert.name.charAt(0)}
                </div>
                <p className="font-semibold">{expert.name}</p>
                <p className="text-xs text-muted-foreground mb-2">{expert.title}</p>
                <Badge variant="outline" className="mb-2">{expert.specialty}</Badge>
                <div className="flex items-center justify-center gap-2 text-xs">
                  <span className="text-amber-400">⭐ {expert.rating}</span>
                  <span className="text-muted-foreground">({expert.consultations}건)</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 로딩 상태 컴포넌트
function LoadingState({ message }: { message: string }) {
  return (
    <Card className="border-border/50 bg-card/80">
      <CardContent className="py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )
}
