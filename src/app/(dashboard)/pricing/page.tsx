// src/app/(dashboard)/pricing/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, Crown, Rocket, Star, Zap, Shield } from 'lucide-react'
import { PaymentButton } from '@/components/payment/PaymentButton'
import { SUBSCRIPTION_PLANS, type PlanId } from '@/lib/portone'

const PLAN_ICONS = {
  BASIC: Star,
  PRO: Zap,
  PREMIUM: Crown,
}

const PLAN_COLORS = {
  BASIC: 'from-blue-500 to-cyan-500',
  PRO: 'from-purple-500 to-pink-500',
  PREMIUM: 'from-amber-500 to-orange-500',
}

const ALL_FEATURES = [
  { key: 'aiRecommendation', label: 'AI 주식 추천', basic: '일 3회', pro: '무제한', premium: '무제한' },
  { key: 'hotStocks', label: '숨겨진 급등주', basic: false, pro: '주 3회', premium: '무제한' },
  { key: 'signals', label: '실시간 매수/매도 시그널', basic: false, pro: true, premium: true },
  { key: 'reports', label: '시장 분석 리포트', basic: '요약', pro: '상세', premium: '프리미엄' },
  { key: 'portfolio', label: '포트폴리오 AI 분석', basic: false, pro: false, premium: true },
  { key: 'consultation', label: '전문가 1:1 상담', basic: false, pro: false, premium: '월 2회' },
  { key: 'emailAlert', label: '이메일 알림', basic: true, pro: true, premium: true },
  { key: 'pushAlert', label: '푸시 알림', basic: false, pro: true, premium: true },
  { key: 'smsAlert', label: 'SMS 알림', basic: false, pro: false, premium: true },
  { key: 'support', label: '고객 지원', basic: '일반', pro: '우선', premium: 'VIP' },
]

export default function PricingPage() {
  const { data: session } = useSession()
  const currentPlan = (session?.user as any)?.plan || 'FREE'
  const userId = session?.user?.id || ''
  const userName = session?.user?.name || ''
  const userEmail = session?.user?.email || ''
  const userPhone = session?.user?.phone || ''

  const renderFeatureValue = (value: string | boolean) => {
    if (value === true) {
      return (
        <div className="flex justify-center">
          <Check className="h-4 w-4 text-emerald-500" />
        </div>
      )
    }
    if (value === false) {
      return (
        <div className="flex justify-center">
          <span className="text-muted-foreground">-</span>
        </div>
      )
    }
    return (
      <div className="flex justify-center">
        <span className="text-sm">{value}</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          💎 프리미엄 플랜
        </h1>
        <p className="text-muted-foreground mt-2">
          AI 기반 투자 분석으로 수익률을 극대화하세요
        </p>
        {currentPlan !== 'FREE' && (
          <Badge variant="secondary" className="mt-3">
            현재 플랜: {currentPlan}
          </Badge>
        )}
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(SUBSCRIPTION_PLANS) as PlanId[]).map((planKey) => {
          const plan = SUBSCRIPTION_PLANS[planKey]
          const Icon = PLAN_ICONS[planKey]
          const isCurrentPlan = currentPlan === planKey
          const isPremium = planKey === 'PREMIUM'
          const isPro = planKey === 'PRO'

          return (
            <Card 
              key={planKey}
              className={`relative overflow-hidden border-2 transition-all hover:scale-[1.02] ${
                isPremium 
                  ? 'border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-transparent' 
                  : isPro
                  ? 'border-purple-500/50 bg-gradient-to-b from-purple-500/10 to-transparent'
                  : 'border-border/50'
              }`}
            >
              {isPremium && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                  🔥 BEST
                </div>
              )}
              {isPro && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                  인기
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`mx-auto w-14 h-14 rounded-full bg-gradient-to-br ${PLAN_COLORS[planKey]} flex items-center justify-center mb-3`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {plan.price.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">/월</span>
                </div>

                <ul className="space-y-3 text-left">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {isCurrentPlan ? (
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    disabled
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    현재 구독 중
                  </Button>
                ) : (
                  <PaymentButton
                    planId={planKey}
                    userId={userId}
                    userName={userName}
                    userEmail={userEmail}
                    userPhone={userPhone}
                    className={`w-full bg-gradient-to-r ${PLAN_COLORS[planKey]} hover:opacity-90`}
                  />
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Feature Comparison Table */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            플랜별 기능 비교
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground w-[40%]">기능</th>
                  <th className="py-3 px-4 text-center font-medium w-[20%]">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 text-blue-400" />
                      Basic
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center font-medium w-[20%]">
                    <div className="flex items-center justify-center gap-1">
                      <Zap className="h-4 w-4 text-purple-400" />
                      Pro
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center font-medium w-[20%]">
                    <div className="flex items-center justify-center gap-1">
                      <Crown className="h-4 w-4 text-amber-400" />
                      Premium
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {ALL_FEATURES.map((feature, idx) => (
                  <tr key={feature.key} className={idx % 2 === 0 ? 'bg-muted/20' : ''}>
                    <td className="py-3 px-4 text-sm w-[40%]">{feature.label}</td>
                    <td className="py-3 px-4 w-[20%]">
                      {renderFeatureValue(feature.basic)}
                    </td>
                    <td className="py-3 px-4 w-[20%]">
                      {renderFeatureValue(feature.pro)}
                    </td>
                    <td className="py-3 px-4 w-[20%]">
                      {renderFeatureValue(feature.premium)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle>❓ 자주 묻는 질문</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">결제 후 바로 이용 가능한가요?</h4>
            <p className="text-sm text-muted-foreground">
              네, 결제 완료 즉시 모든 프리미엄 기능을 이용하실 수 있습니다.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">환불은 어떻게 하나요?</h4>
            <p className="text-sm text-muted-foreground">
              결제일로부터 7일 이내 미사용 시 전액 환불이 가능합니다. 고객센터로 문의해주세요.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">플랜 변경이 가능한가요?</h4>
            <p className="text-sm text-muted-foreground">
              언제든 상위 플랜으로 업그레이드 가능합니다. 차액만 결제하시면 됩니다.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">자동 결제가 되나요?</h4>
            <p className="text-sm text-muted-foreground">
              아니요, 현재는 단건 결제만 지원합니다. 만료 전 알림을 보내드립니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

