"use client"

import { useState } from "react"
import { Lock, Crown, Sparkles, TrendingUp, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface PremiumLockProps {
  children: React.ReactNode
  isSubscribed?: boolean
  type?: "blur" | "hide" | "teaser"
  teaserText?: string
  feature?: string
  compact?: boolean // 작은 영역용 컴팩트 모드
}

export function PremiumLock({
  children,
  isSubscribed = false,
  type = "blur",
  teaserText,
  feature = "프리미엄 콘텐츠",
  compact = false,
}: PremiumLockProps) {
  const [showModal, setShowModal] = useState(false)

  if (isSubscribed) {
    return <>{children}</>
  }

  // 컴팩트 모드 - 작은 카드 영역용
  if (compact) {
    return (
      <>
        <div 
          className="cursor-pointer group" 
          onClick={() => setShowModal(true)}
        >
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors w-fit">
            <Lock className="h-3 w-3 lg:h-3.5 lg:w-3.5 text-primary shrink-0" />
            <span className="text-xs lg:text-sm font-medium text-primary whitespace-nowrap">프리미엄 전용</span>
          </div>
        </div>
        <PremiumModal 
          open={showModal} 
          onClose={() => setShowModal(false)} 
          feature={feature}
        />
      </>
    )
  }

  return (
    <>
      <div className="relative group cursor-pointer" onClick={() => setShowModal(true)}>
        {/* Content with blur/hide effect */}
        <div
          className={cn(
            "transition-all duration-300",
            type === "blur" && "blur-md select-none pointer-events-none",
            type === "hide" && "opacity-0",
            type === "teaser" && "blur-sm select-none pointer-events-none"
          )}
        >
          {children}
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-background/95 via-background/70 to-transparent rounded-lg">
          <div className="flex flex-col items-center gap-2 lg:gap-3 p-3 lg:p-6 text-center animate-pulse-glow">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative flex h-10 w-10 lg:h-16 lg:w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-600 shadow-lg shadow-primary/50">
                <Lock className="h-5 w-5 lg:h-8 lg:w-8 text-white" />
              </div>
            </div>
            
            <div className="space-y-0.5 lg:space-y-1">
              <p className="text-sm lg:text-lg font-bold text-foreground whitespace-nowrap">
                🔒 프리미엄 전용
              </p>
              {teaserText && (
                <p className="text-xs lg:text-sm text-primary font-medium animate-pulse line-clamp-1">
                  {teaserText}
                </p>
              )}
              <p className="text-[10px] lg:text-xs text-muted-foreground whitespace-nowrap">
                클릭하여 구독 혜택 확인
              </p>
            </div>
          </div>
        </div>

        {/* Hover effect */}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
      </div>

      {/* Subscription Modal */}
      <PremiumModal 
        open={showModal} 
        onClose={() => setShowModal(false)} 
        feature={feature}
      />
    </>
  )
}

interface PremiumModalProps {
  open: boolean
  onClose: () => void
  feature?: string
}

export function PremiumModal({ open, onClose, feature }: PremiumModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-primary/20 bg-[#1a1a1a]">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            프리미엄 구독 🚀
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {feature}에 접근하려면 구독이 필요합니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Benefits */}
          <div className="space-y-3">
            <BenefitItem 
              icon={<Sparkles className="h-5 w-5 text-amber-400" />}
              title="AI 추천 종목 무제한"
              description="매일 업데이트되는 매수/매도 시그널"
            />
            <BenefitItem 
              icon={<TrendingUp className="h-5 w-5 text-emerald-400" />}
              title="숨겨진 급등주 공개"
              description="AI가 발굴한 10배 잠재력 종목"
            />
            <BenefitItem 
              icon={<Zap className="h-5 w-5 text-violet-400" />}
              title="실시간 알림"
              description="최적의 매수/매도 타이밍 알림"
            />
          </div>

          {/* Pricing teaser */}
          <div className="rounded-lg bg-gradient-to-r from-primary/20 to-violet-500/20 p-4 text-center border border-primary/30">
            <p className="text-sm text-muted-foreground">지금 구독 시</p>
            <p className="text-2xl font-bold text-primary">첫 달 50% 할인</p>
            <p className="text-xs text-muted-foreground mt-1">
              다음 달부터 정상가 적용
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-2">
            <Button 
              className="w-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90"
              size="lg"
            >
              <Crown className="mr-2 h-4 w-4" />
              프리미엄 구독하기
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              나중에 할게요
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function BenefitItem({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-[#252525] p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1a1a1a]">
        {icon}
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

// 가격 블러 컴포넌트
interface PriceBlurProps {
  price: string
  isSubscribed?: boolean
}

export function PriceBlur({ price, isSubscribed = false }: PriceBlurProps) {
  const [showModal, setShowModal] = useState(false)

  if (isSubscribed) {
    return <span>{price}</span>
  }

  return (
    <>
      <span 
        className="cursor-pointer hover:text-primary transition-colors"
        onClick={() => setShowModal(true)}
      >
        <span className="blur-sm select-none">88,888</span>
        <span className="text-primary ml-1">🔒</span>
      </span>
      <PremiumModal 
        open={showModal} 
        onClose={() => setShowModal(false)}
        feature="정확한 목표가"
      />
    </>
  )
}

// 티저 카드 컴포넌트 (숨겨진 급등주용)
interface TeaserCardProps {
  title: string
  subtitle?: string
  highlight?: string
  isSubscribed?: boolean
}

export function TeaserCard({ 
  title, 
  subtitle, 
  highlight,
  isSubscribed = false 
}: TeaserCardProps) {
  const [showModal, setShowModal] = useState(false)

  if (isSubscribed) {
    return null // 구독자에겐 실제 콘텐츠 표시
  }

  return (
    <>
      <div 
        className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-6 cursor-pointer group hover:border-amber-500/50 transition-all"
        onClick={() => setShowModal(true)}
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 animate-pulse" />
        
        {/* Crown badge */}
        <div className="absolute -top-2 -right-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
          <Crown className="h-6 w-6 text-white" />
        </div>

        <div className="relative space-y-2">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">
              Premium Only
            </span>
          </div>
          
          <h3 className="text-lg font-bold text-foreground">
            {title}
          </h3>
          
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          
          {highlight && (
            <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-sm font-medium text-amber-400">
              <Sparkles className="h-3 w-3" />
              {highlight}
            </div>
          )}

          <p className="text-xs text-muted-foreground pt-2">
            클릭하여 잠금 해제 →
          </p>
        </div>
      </div>
      
      <PremiumModal 
        open={showModal} 
        onClose={() => setShowModal(false)}
        feature={title}
      />
    </>
  )
}

