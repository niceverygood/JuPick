// src/lib/planLimits.ts
// 플랜별 제한 및 기능 설정

export const PLAN_LIMITS = {
  FREE: {
    dailyRecommendations: 1,
    weeklyHotStocks: 0,
    monthlyConsultations: 0,
    features: {
      marketReport: false,
      marketReportLevel: null as null | 'basic' | 'detailed' | 'premium',
      emailNotification: false,
      pushNotification: false,
      smsNotification: false,
      hotStocks: false,
      realTimeSignal: false,
      portfolioAnalysis: false,
      expertConsultation: false,
      preciseTargetPrice: false,
    }
  },
  BASIC: {
    dailyRecommendations: 3,
    weeklyHotStocks: 0,
    monthlyConsultations: 0,
    features: {
      marketReport: true,
      marketReportLevel: 'basic' as null | 'basic' | 'detailed' | 'premium',
      emailNotification: true,
      pushNotification: false,
      smsNotification: false,
      hotStocks: false,
      realTimeSignal: false,
      portfolioAnalysis: false,
      expertConsultation: false,
      preciseTargetPrice: false,
    }
  },
  PRO: {
    dailyRecommendations: Infinity,
    weeklyHotStocks: 5,
    monthlyConsultations: 0,
    features: {
      marketReport: true,
      marketReportLevel: 'detailed' as null | 'basic' | 'detailed' | 'premium',
      emailNotification: true,
      pushNotification: true,
      smsNotification: false,
      hotStocks: true,
      realTimeSignal: true,
      portfolioAnalysis: false,
      expertConsultation: false,
      preciseTargetPrice: true,
    }
  },
  PREMIUM: {
    dailyRecommendations: Infinity,
    weeklyHotStocks: Infinity,
    monthlyConsultations: 2,
    features: {
      marketReport: true,
      marketReportLevel: 'premium' as null | 'basic' | 'detailed' | 'premium',
      emailNotification: true,
      pushNotification: true,
      smsNotification: true,
      hotStocks: true,
      realTimeSignal: true,
      portfolioAnalysis: true,
      expertConsultation: true,
      preciseTargetPrice: true,
    }
  }
} as const

export type PlanType = keyof typeof PLAN_LIMITS
export type FeatureKey = keyof typeof PLAN_LIMITS.FREE.features

// 플랜별 가격 정보
export const PLAN_PRICES = {
  FREE: { monthly: 0, yearly: 0 },
  BASIC: { monthly: 29000, yearly: 290000 },
  PRO: { monthly: 79000, yearly: 790000 },
  PREMIUM: { monthly: 149000, yearly: 1490000 },
} as const

// 플랜별 이름
export const PLAN_NAMES: Record<PlanType, string> = {
  FREE: '무료',
  BASIC: 'Basic',
  PRO: 'Pro',
  PREMIUM: 'Premium',
}

// 기능 사용 가능 여부 체크
export function canUseFeature(plan: PlanType, feature: FeatureKey): boolean {
  const value = PLAN_LIMITS[plan].features[feature]
  if (typeof value === 'boolean') return value
  if (value === null) return false
  return true
}

// 마켓 리포트 레벨 가져오기
export function getMarketReportLevel(plan: PlanType): null | 'basic' | 'detailed' | 'premium' {
  return PLAN_LIMITS[plan].features.marketReportLevel
}

// 남은 추천 횟수 계산
export function getRemainingRecommendations(plan: PlanType, usedToday: number): number {
  const limit = PLAN_LIMITS[plan].dailyRecommendations
  if (limit === Infinity) return Infinity
  return Math.max(0, limit - usedToday)
}

// 남은 급등주 조회 횟수 계산
export function getRemainingHotStocks(plan: PlanType, usedThisWeek: number): number {
  const limit = PLAN_LIMITS[plan].weeklyHotStocks
  if (limit === Infinity) return Infinity
  return Math.max(0, limit - usedThisWeek)
}

// 남은 상담 횟수 계산
export function getRemainingConsultations(plan: PlanType, usedThisMonth: number): number {
  const limit = PLAN_LIMITS[plan].monthlyConsultations
  return Math.max(0, limit - usedThisMonth)
}

// 주 시작일 계산 (월요일 기준)
export function getWeekStart(): Date {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  const weekStart = new Date(now)
  weekStart.setDate(diff)
  weekStart.setHours(0, 0, 0, 0)
  return weekStart
}

// 월 시작일 계산
export function getMonthStart(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
}

// 오늘 날짜 시작 시간
export function getTodayStart(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
}

// 플랜 비교 (현재 플랜이 필요한 플랜보다 높거나 같은지)
export function isPlanSufficient(currentPlan: PlanType, requiredPlan: PlanType): boolean {
  const planOrder: PlanType[] = ['FREE', 'BASIC', 'PRO', 'PREMIUM']
  return planOrder.indexOf(currentPlan) >= planOrder.indexOf(requiredPlan)
}

// 플랜 업그레이드 필요 여부 확인 및 필요한 최소 플랜 반환
export function getRequiredPlanForFeature(feature: FeatureKey): PlanType {
  const plans: PlanType[] = ['FREE', 'BASIC', 'PRO', 'PREMIUM']
  for (const plan of plans) {
    if (canUseFeature(plan, feature)) {
      return plan
    }
  }
  return 'PREMIUM'
}


