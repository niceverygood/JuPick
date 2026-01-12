"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Crown,
  Check,
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  Bell,
  Target,
  Gem,
  Loader2,
  CreditCard,
  Star,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// 구독 플랜 정의
const PLANS = [
  {
    id: "basic",
    name: "Basic",
    description: "AI 주식 추천 시작하기",
    price: 29900,
    originalPrice: 49900,
    period: "월",
    badge: null,
    features: [
      { text: "AI 주식 추천 3종목/일", included: true },
      { text: "기본 시장 분석 리포트", included: true },
      { text: "이메일 알림", included: true },
      { text: "숨겨진 급등주 접근", included: false },
      { text: "실시간 매수/매도 시그널", included: false },
      { text: "포트폴리오 AI 분석", included: false },
      { text: "1:1 전문가 상담", included: false },
    ],
    color: "border-blue-500/50",
    buttonVariant: "outline" as const,
  },
  {
    id: "pro",
    name: "Pro",
    description: "적극적인 투자자를 위한 플랜",
    price: 79900,
    originalPrice: 129900,
    period: "월",
    badge: "BEST",
    features: [
      { text: "AI 주식 추천 무제한", included: true },
      { text: "상세 시장 분석 리포트", included: true },
      { text: "실시간 푸시 알림", included: true },
      { text: "숨겨진 급등주 5종목/주", included: true },
      { text: "실시간 매수/매도 시그널", included: true },
      { text: "포트폴리오 AI 분석", included: false },
      { text: "1:1 전문가 상담", included: false },
    ],
    color: "border-primary",
    buttonVariant: "default" as const,
    highlight: true,
  },
  {
    id: "premium",
    name: "Premium",
    description: "프로 투자자를 위한 올인원",
    price: 149900,
    originalPrice: 249900,
    period: "월",
    badge: "VIP",
    features: [
      { text: "AI 주식 추천 무제한", included: true },
      { text: "프리미엄 시장 분석 리포트", included: true },
      { text: "실시간 푸시 + SMS 알림", included: true },
      { text: "숨겨진 급등주 무제한", included: true },
      { text: "실시간 매수/매도 시그널", included: true },
      { text: "포트폴리오 AI 분석", included: true },
      { text: "1:1 전문가 상담 (월 2회)", included: true },
    ],
    color: "border-amber-500",
    buttonVariant: "default" as const,
  },
]

// 연간 플랜 (20% 할인)
const ANNUAL_DISCOUNT = 0.2

export default function SubscriptionsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly")
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const getPrice = (plan: typeof PLANS[0]) => {
    const basePrice = plan.price
    if (billingCycle === "annual") {
      return Math.floor(basePrice * 12 * (1 - ANNUAL_DISCOUNT))
    }
    return basePrice
  }

  const getOriginalPrice = (plan: typeof PLANS[0]) => {
    const basePrice = plan.originalPrice
    if (billingCycle === "annual") {
      return basePrice * 12
    }
    return basePrice
  }

  const handleSelectPlan = (plan: typeof PLANS[0]) => {
    setSelectedPlan(plan)
    setShowPaymentModal(true)
  }

  const handlePayment = async () => {
    if (!selectedPlan || !session?.user) return

    setIsProcessing(true)

    try {
      const response = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          billingCycle,
          amount: getPrice(selectedPlan),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPaymentSuccess(true)
        // 3초 후 대시보드로 이동
        setTimeout(() => {
          router.push("/")
          router.refresh()
        }, 3000)
      } else {
        alert(data.error || "결제 처리 중 오류가 발생했습니다.")
      }
    } catch (error) {
      console.error("Payment error:", error)
      alert("결제 처리 중 오류가 발생했습니다.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <Badge className="mb-4 bg-gradient-to-r from-primary to-violet-600 text-white border-0">
          <Sparkles className="mr-1 h-3 w-3" />
          첫 달 최대 50% 할인
        </Badge>
        <h1 className="text-3xl font-bold mb-3">
          AI 주식 추천 프리미엄 구독
        </h1>
        <p className="text-muted-foreground">
          AI가 분석한 정확한 매수/매도 타이밍으로 수익률을 높이세요.
          <br />
          언제든지 해지 가능합니다.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={cn(
          "text-sm font-medium transition-colors",
          billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"
        )}>
          월간 결제
        </span>
        <button
          onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            billingCycle === "annual" ? "bg-primary" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
              billingCycle === "annual" ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
        <span className={cn(
          "text-sm font-medium transition-colors",
          billingCycle === "annual" ? "text-foreground" : "text-muted-foreground"
        )}>
          연간 결제
          <Badge variant="secondary" className="ml-2 text-xs bg-emerald-500/20 text-emerald-400">
            20% 할인
          </Badge>
        </span>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              "relative overflow-hidden transition-all hover:shadow-lg",
              plan.color,
              plan.highlight && "scale-105 shadow-xl shadow-primary/20"
            )}
          >
            {/* Badge */}
            {plan.badge && (
              <div className="absolute -top-1 -right-1">
                <Badge className={cn(
                  "rounded-bl-lg rounded-tr-lg",
                  plan.badge === "BEST" 
                    ? "bg-gradient-to-r from-primary to-violet-600" 
                    : "bg-gradient-to-r from-amber-500 to-orange-500"
                )}>
                  {plan.badge === "BEST" && <Star className="mr-1 h-3 w-3" />}
                  {plan.badge === "VIP" && <Crown className="mr-1 h-3 w-3" />}
                  {plan.badge}
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Price */}
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">
                    {getPrice(plan).toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">원</span>
                  <span className="text-sm text-muted-foreground">
                    /{billingCycle === "monthly" ? "월" : "년"}
                  </span>
                </div>
                {plan.originalPrice > plan.price && (
                  <p className="text-sm text-muted-foreground line-through">
                    {getOriginalPrice(plan).toLocaleString()}원
                  </p>
                )}
                {billingCycle === "annual" && (
                  <p className="text-xs text-emerald-400 mt-1">
                    월 {Math.floor(getPrice(plan) / 12).toLocaleString()}원
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                      feature.included 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className={cn(
                      "text-sm",
                      !feature.included && "text-muted-foreground line-through"
                    )}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                className={cn(
                  "w-full",
                  plan.highlight && "bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90"
                )}
                variant={plan.buttonVariant}
                size="lg"
                onClick={() => handleSelectPlan(plan)}
              >
                {plan.highlight ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    지금 시작하기
                  </>
                ) : (
                  "구독하기"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald-400" />
          <span>안전한 결제</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-400" />
          <span>즉시 이용 가능</span>
        </div>
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-blue-400" />
          <span>언제든 해지 가능</span>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-8">
          프리미엄 구독자 전용 혜택
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={TrendingUp}
            title="AI 종목 추천"
            description="머신러닝 기반 종목 분석으로 높은 적중률의 매수/매도 추천"
            color="text-emerald-400"
          />
          <FeatureCard
            icon={Gem}
            title="숨겨진 급등주"
            description="일반 투자자들이 모르는 10배 잠재력 종목 독점 공개"
            color="text-amber-400"
          />
          <FeatureCard
            icon={Target}
            title="정밀 목표가"
            description="진입가, 목표가, 손절가까지 정확한 가격 제시"
            color="text-blue-400"
          />
          <FeatureCard
            icon={Bell}
            title="실시간 알림"
            description="최적의 매수/매도 타이밍을 놓치지 않는 즉시 알림"
            color="text-violet-400"
          />
          <FeatureCard
            icon={Shield}
            title="리스크 관리"
            description="AI가 분석한 리스크 레벨과 포지션 사이즈 제안"
            color="text-rose-400"
          />
          <FeatureCard
            icon={Sparkles}
            title="성과 대시보드"
            description="AI 추천 종목의 실제 적중률과 수익률 투명 공개"
            color="text-cyan-400"
          />
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md bg-[#1a1a1a]">
          {paymentSuccess ? (
            <div className="text-center py-8">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
                <Check className="h-10 w-10 text-emerald-400" />
              </div>
              <DialogTitle className="text-2xl font-bold text-emerald-400 mb-2">
                구독 완료! 🎉
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {selectedPlan?.name} 플랜이 활성화되었습니다.
                <br />
                잠시 후 대시보드로 이동합니다...
              </DialogDescription>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  결제하기
                </DialogTitle>
                <DialogDescription>
                  {selectedPlan?.name} 플랜 - {billingCycle === "monthly" ? "월간" : "연간"} 구독
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Plan Summary */}
                <div className="rounded-lg bg-[#252525] p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">플랜</span>
                    <span className="font-medium">{selectedPlan?.name}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">결제 주기</span>
                    <span className="font-medium">
                      {billingCycle === "monthly" ? "월간" : "연간"}
                    </span>
                  </div>
                  <div className="border-t border-border/50 my-3" />
                  <div className="flex justify-between items-center">
                    <span className="font-medium">총 결제 금액</span>
                    <span className="text-xl font-bold text-primary">
                      {selectedPlan && getPrice(selectedPlan).toLocaleString()}원
                    </span>
                  </div>
                </div>

                {/* Card Form (Mock) */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">카드 번호</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      className="bg-[#252525]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">유효기간</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        className="bg-[#252525]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        placeholder="123"
                        className="bg-[#252525]"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <p className="text-xs text-muted-foreground">
                  결제 버튼을 클릭하면 <span className="text-primary">이용약관</span>과{" "}
                  <span className="text-primary">개인정보처리방침</span>에 동의하게 됩니다.
                  구독은 언제든지 해지할 수 있습니다.
                </p>

                {/* Payment Button */}
                <Button
                  className="w-full bg-gradient-to-r from-primary to-violet-600"
                  size="lg"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      결제 처리 중...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      {selectedPlan && getPrice(selectedPlan).toLocaleString()}원 결제하기
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: React.ElementType
  title: string
  description: string
  color: string
}) {
  return (
    <Card className="border-border/50 bg-card/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg bg-muted/50", color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


