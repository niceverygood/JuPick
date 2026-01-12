"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Crown,
  CreditCard,
  Calendar,
  Clock,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface SubscriptionData {
  isSubscribed: boolean
  isPremium: boolean
  planId: string | null
  startDate?: string
  endDate?: string
  daysRemaining: number
}

export default function MySubscriptionPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch("/api/subscriptions/status")
        if (response.ok) {
          const data = await response.json()
          setSubscription(data)
        }
      } catch (error) {
        console.error("Failed to fetch subscription:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchSubscription()
    }
  }, [session])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // 관리자 역할
  if (session?.user?.role && ["MASTER", "DISTRIBUTOR", "AGENCY"].includes(session.user.role)) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-400" />
            내 구독
          </h1>
          <p className="text-muted-foreground">
            구독 상태 및 결제 정보를 확인하세요.
          </p>
        </div>

        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div>
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 mb-2">
                  관리자
                </Badge>
                <h2 className="text-xl font-bold">무제한 이용 권한</h2>
                <p className="text-sm text-muted-foreground">
                  관리자 계정은 모든 기능을 무제한으로 이용할 수 있습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 구독이 없는 경우
  if (!subscription?.isSubscribed) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            내 구독
          </h1>
          <p className="text-muted-foreground">
            구독 상태 및 결제 정보를 확인하세요.
          </p>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <AlertCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">활성화된 구독이 없습니다</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              AI 주식 추천, 숨겨진 급등주, 실시간 시그널 등 프리미엄 기능을 이용하려면 구독이 필요합니다.
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-violet-600">
              <Link href="/subscriptions">
                <Sparkles className="mr-2 h-4 w-4" />
                구독 플랜 보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* 구독 혜택 미리보기 */}
        <div className="grid gap-4 md:grid-cols-3">
          <BenefitPreviewCard
            title="AI 종목 추천"
            description="높은 적중률의 매수/매도 추천"
            icon={Sparkles}
          />
          <BenefitPreviewCard
            title="숨겨진 급등주"
            description="10배 잠재력 종목 독점 공개"
            icon={Crown}
          />
          <BenefitPreviewCard
            title="실시간 알림"
            description="최적의 매매 타이밍 알림"
            icon={Clock}
          />
        </div>
      </div>
    )
  }

  // 활성 구독이 있는 경우
  const startDate = subscription.startDate ? new Date(subscription.startDate) : null
  const endDate = subscription.endDate ? new Date(subscription.endDate) : null
  const totalDays = startDate && endDate 
    ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    : 30
  const usedDays = totalDays - subscription.daysRemaining
  const progressPercent = Math.round((usedDays / totalDays) * 100)
  const isExpiringSoon = subscription.daysRemaining <= 7

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          내 구독
        </h1>
        <p className="text-muted-foreground">
          구독 상태 및 결제 정보를 확인하세요.
        </p>
      </div>

      {/* 구독 상태 카드 */}
      <Card className={cn(
        "border-primary/30",
        isExpiringSoon && "border-amber-500/50"
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">프리미엄 구독</CardTitle>
                <CardDescription>AI 주식 추천 서비스</CardDescription>
              </div>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
              <Check className="mr-1 h-3 w-3" />
              활성
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 남은 기간 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">남은 기간</span>
              <span className={cn(
                "font-medium",
                isExpiringSoon ? "text-amber-400" : "text-foreground"
              )}>
                {subscription.daysRemaining}일 남음
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                시작: {startDate?.toLocaleDateString("ko-KR")}
              </span>
              <span>
                종료: {endDate?.toLocaleDateString("ko-KR")}
              </span>
            </div>
          </div>

          {/* 만료 임박 경고 */}
          {isExpiringSoon && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-400">구독 만료 임박</p>
                  <p className="text-sm text-muted-foreground">
                    구독이 곧 만료됩니다. 지금 연장하여 서비스 중단 없이 이용하세요.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3">
            <Button asChild className="flex-1">
              <Link href="/subscriptions">
                <RefreshCw className="mr-2 h-4 w-4" />
                구독 연장
              </Link>
            </Button>
            <Button variant="outline" className="flex-1">
              결제 내역
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 구독 혜택 */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">내 구독 혜택</CardTitle>
          <CardDescription>현재 이용 가능한 프리미엄 기능</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <BenefitItem text="AI 종목 추천 무제한" />
            <BenefitItem text="상세 시장 분석 리포트" />
            <BenefitItem text="실시간 푸시 알림" />
            <BenefitItem text="숨겨진 급등주 접근" />
            <BenefitItem text="실시간 매수/매도 시그널" />
            <BenefitItem text="포트폴리오 AI 분석" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
        <Check className="h-3 w-3 text-emerald-400" />
      </div>
      <span>{text}</span>
    </div>
  )
}

function BenefitPreviewCard({
  title,
  description,
  icon: Icon,
}: {
  title: string
  description: string
  icon: React.ElementType
}) {
  return (
    <Card className="border-border/50 bg-card/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


