'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lock, Sparkles, Crown, Zap, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface UpgradePromptProps {
  feature: string
  requiredPlan: 'BASIC' | 'PRO' | 'PREMIUM'
  message?: string
  benefits?: string[]
  className?: string
}

const PLAN_INFO = {
  BASIC: { 
    name: 'Basic', 
    price: '29,000', 
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    icon: Zap,
  },
  PRO: { 
    name: 'Pro', 
    price: '79,000', 
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    icon: Crown,
  },
  PREMIUM: { 
    name: 'Premium', 
    price: '149,000', 
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    icon: Crown,
  },
}

export function UpgradePrompt({ 
  feature, 
  requiredPlan, 
  message, 
  benefits,
  className 
}: UpgradePromptProps) {
  const planInfo = PLAN_INFO[requiredPlan]
  const Icon = planInfo.icon
  
  return (
    <Card className={cn(
      "relative overflow-hidden",
      planInfo.bgColor,
      planInfo.borderColor,
      className
    )}>
      {/* 배경 효과 */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
      <div className={cn(
        "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20",
        `bg-gradient-to-r ${planInfo.color}`
      )} />
      
      <CardContent className="relative p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* 아이콘 */}
          <div className={cn(
            "p-4 rounded-full",
            planInfo.bgColor
          )}>
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          
          {/* 제목 */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold">
              {feature}
            </h3>
            <p className="text-muted-foreground text-sm max-w-md">
              {message || `이 기능은 ${planInfo.name} 플랜 이상에서 이용 가능합니다.`}
            </p>
          </div>
          
          {/* 혜택 목록 */}
          {benefits && benefits.length > 0 && (
            <div className="w-full max-w-sm">
              <ul className="space-y-2 text-left">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* 플랜 배지 */}
          <Badge className={cn(
            "px-4 py-2 text-white border-0",
            `bg-gradient-to-r ${planInfo.color}`
          )}>
            <Icon className="w-4 h-4 mr-2" />
            {planInfo.name} - 월 {planInfo.price}원
          </Badge>
          
          {/* CTA 버튼 */}
          <Link href="/subscriptions" className="w-full max-w-xs">
            <Button 
              className={cn(
                "w-full",
                `bg-gradient-to-r ${planInfo.color}`,
                "hover:opacity-90 transition-opacity"
              )}
              size="lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              지금 업그레이드
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          
          {/* 안내 문구 */}
          <p className="text-xs text-muted-foreground">
            7일 무료 체험 • 언제든지 해지 가능
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// 미니 버전 (인라인 사용)
export function UpgradePromptInline({ 
  feature, 
  requiredPlan 
}: { 
  feature: string
  requiredPlan: 'BASIC' | 'PRO' | 'PREMIUM' 
}) {
  const planInfo = PLAN_INFO[requiredPlan]
  
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg",
      planInfo.bgColor,
      planInfo.borderColor,
      "border"
    )}>
      <div className="flex items-center gap-2">
        <Lock className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {feature}은 {planInfo.name} 플랜에서 이용 가능
        </span>
      </div>
      <Link href="/subscriptions">
        <Button size="sm" variant="ghost" className="text-primary">
          업그레이드
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </Link>
    </div>
  )
}

// 블러 처리된 프리뷰 카드
export function LockedPreviewCard({
  children,
  requiredPlan,
  onClick
}: {
  children: React.ReactNode
  requiredPlan: 'BASIC' | 'PRO' | 'PREMIUM'
  onClick?: () => void
}) {
  const planInfo = PLAN_INFO[requiredPlan]
  
  return (
    <div 
      className="relative group cursor-pointer"
      onClick={onClick}
    >
      {/* 블러 처리된 콘텐츠 */}
      <div className="blur-sm pointer-events-none select-none">
        {children}
      </div>
      
      {/* 오버레이 */}
      <div className={cn(
        "absolute inset-0 flex flex-col items-center justify-center",
        "bg-gradient-to-t from-background/90 via-background/70 to-background/50",
        "opacity-100 group-hover:opacity-90 transition-opacity",
        "rounded-lg border",
        planInfo.borderColor
      )}>
        <div className={cn(
          "p-3 rounded-full mb-3",
          planInfo.bgColor
        )}>
          <Lock className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium mb-1">
          {planInfo.name} 플랜 전용
        </p>
        <p className="text-xs text-muted-foreground">
          클릭하여 자세히 보기
        </p>
      </div>
    </div>
  )
}


