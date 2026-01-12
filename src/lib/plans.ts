// 구독 플랜 설정 및 권한 관리

export type PlanId = "free" | "basic" | "pro" | "premium" | "admin"

export interface PlanFeatures {
  // AI 종목 추천
  dailyRecommendationLimit: number  // -1 = 무제한
  
  // 시장 분석 리포트
  marketReportLevel: "none" | "basic" | "detailed" | "premium"
  
  // 알림
  emailNotification: boolean
  pushNotification: boolean
  smsNotification: boolean
  
  // 숨겨진 급등주
  hiddenGemsAccess: boolean
  weeklyHiddenGemsLimit: number  // -1 = 무제한
  
  // 실시간 시그널
  realtimeSignals: boolean
  
  // 포트폴리오 AI 분석
  portfolioAnalysis: boolean
  
  // 전문가 상담
  expertConsultation: boolean
  monthlyConsultationLimit: number  // 0 = 없음
  
  // 가격 정보 접근
  preciseTargetPrice: boolean
  stopLossPrice: boolean
}

export interface Plan {
  id: PlanId
  name: string
  description: string
  price: number
  originalPrice: number
  features: PlanFeatures
  badge?: string
  highlight?: boolean
}

// 플랜 정의
export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "무료",
    description: "기본 기능 체험",
    price: 0,
    originalPrice: 0,
    features: {
      dailyRecommendationLimit: 1,
      marketReportLevel: "none",
      emailNotification: false,
      pushNotification: false,
      smsNotification: false,
      hiddenGemsAccess: false,
      weeklyHiddenGemsLimit: 0,
      realtimeSignals: false,
      portfolioAnalysis: false,
      expertConsultation: false,
      monthlyConsultationLimit: 0,
      preciseTargetPrice: false,
      stopLossPrice: false,
    },
  },
  basic: {
    id: "basic",
    name: "Basic",
    description: "AI 주식 추천 시작하기",
    price: 29900,
    originalPrice: 49900,
    features: {
      dailyRecommendationLimit: 3,
      marketReportLevel: "basic",
      emailNotification: true,
      pushNotification: false,
      smsNotification: false,
      hiddenGemsAccess: false,
      weeklyHiddenGemsLimit: 0,
      realtimeSignals: false,
      portfolioAnalysis: false,
      expertConsultation: false,
      monthlyConsultationLimit: 0,
      preciseTargetPrice: false,
      stopLossPrice: false,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "적극적인 투자자를 위한 플랜",
    price: 79900,
    originalPrice: 129900,
    badge: "BEST",
    highlight: true,
    features: {
      dailyRecommendationLimit: -1,
      marketReportLevel: "detailed",
      emailNotification: true,
      pushNotification: true,
      smsNotification: false,
      hiddenGemsAccess: true,
      weeklyHiddenGemsLimit: 5,
      realtimeSignals: true,
      portfolioAnalysis: false,
      expertConsultation: false,
      monthlyConsultationLimit: 0,
      preciseTargetPrice: true,
      stopLossPrice: true,
    },
  },
  premium: {
    id: "premium",
    name: "Premium",
    description: "프로 투자자를 위한 올인원",
    price: 149900,
    originalPrice: 249900,
    badge: "VIP",
    features: {
      dailyRecommendationLimit: -1,
      marketReportLevel: "premium",
      emailNotification: true,
      pushNotification: true,
      smsNotification: true,
      hiddenGemsAccess: true,
      weeklyHiddenGemsLimit: -1,
      realtimeSignals: true,
      portfolioAnalysis: true,
      expertConsultation: true,
      monthlyConsultationLimit: 2,
      preciseTargetPrice: true,
      stopLossPrice: true,
    },
  },
  admin: {
    id: "admin",
    name: "관리자",
    description: "모든 기능 이용 가능",
    price: 0,
    originalPrice: 0,
    features: {
      dailyRecommendationLimit: -1,
      marketReportLevel: "premium",
      emailNotification: true,
      pushNotification: true,
      smsNotification: true,
      hiddenGemsAccess: true,
      weeklyHiddenGemsLimit: -1,
      realtimeSignals: true,
      portfolioAnalysis: true,
      expertConsultation: true,
      monthlyConsultationLimit: -1,
      preciseTargetPrice: true,
      stopLossPrice: true,
    },
  },
}

// 플랜 권한 체크 함수
export function getPlanFeatures(planId: PlanId): PlanFeatures {
  return PLANS[planId]?.features || PLANS.free.features
}

export function canAccessFeature(planId: PlanId, feature: keyof PlanFeatures): boolean {
  const features = getPlanFeatures(planId)
  const value = features[feature]
  
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value !== 0
  if (typeof value === "string") return value !== "none"
  
  return false
}

export function getFeatureLimit(planId: PlanId, feature: keyof PlanFeatures): number {
  const features = getPlanFeatures(planId)
  const value = features[feature]
  
  if (typeof value === "number") return value
  return 0
}

// 플랜 비교 (업그레이드 체크용)
export function isPlanHigherOrEqual(currentPlan: PlanId, requiredPlan: PlanId): boolean {
  const planOrder: PlanId[] = ["free", "basic", "pro", "premium", "admin"]
  return planOrder.indexOf(currentPlan) >= planOrder.indexOf(requiredPlan)
}

// 플랜별 기능 목록 (UI 표시용)
export const PLAN_FEATURE_LIST = [
  {
    key: "dailyRecommendationLimit",
    name: "AI 주식 추천",
    getValue: (plan: Plan) => {
      const limit = plan.features.dailyRecommendationLimit
      return limit === -1 ? "무제한" : `${limit}종목/일`
    },
  },
  {
    key: "marketReportLevel",
    name: "시장 분석 리포트",
    getValue: (plan: Plan) => {
      const levels: Record<string, string> = {
        none: "미제공",
        basic: "기본",
        detailed: "상세",
        premium: "프리미엄",
      }
      return levels[plan.features.marketReportLevel]
    },
  },
  {
    key: "notification",
    name: "알림",
    getValue: (plan: Plan) => {
      const { emailNotification, pushNotification, smsNotification } = plan.features
      if (smsNotification) return "이메일 + 푸시 + SMS"
      if (pushNotification) return "이메일 + 푸시"
      if (emailNotification) return "이메일"
      return "미제공"
    },
  },
  {
    key: "hiddenGemsAccess",
    name: "숨겨진 급등주",
    getValue: (plan: Plan) => {
      if (!plan.features.hiddenGemsAccess) return "미제공"
      const limit = plan.features.weeklyHiddenGemsLimit
      return limit === -1 ? "무제한" : `${limit}종목/주`
    },
  },
  {
    key: "realtimeSignals",
    name: "실시간 매수/매도 시그널",
    getValue: (plan: Plan) => plan.features.realtimeSignals ? "제공" : "미제공",
  },
  {
    key: "portfolioAnalysis",
    name: "포트폴리오 AI 분석",
    getValue: (plan: Plan) => plan.features.portfolioAnalysis ? "제공" : "미제공",
  },
  {
    key: "expertConsultation",
    name: "1:1 전문가 상담",
    getValue: (plan: Plan) => {
      if (!plan.features.expertConsultation) return "미제공"
      const limit = plan.features.monthlyConsultationLimit
      return limit === -1 ? "무제한" : `월 ${limit}회`
    },
  },
]
