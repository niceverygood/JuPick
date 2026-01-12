// src/lib/planDisplayConfig.ts
// 플랜별 표시 설정 - Free 유저 전환 전략

export const PLAN_DISPLAY_CONFIG = {
  FREE: {
    // AI 추천 탭
    aiRecommendation: {
      visibleCount: 1,        // 1개만 완전 공개
      blurredCount: 2,        // 2개는 블러로 "있다"는 것만
      showStopLoss: false,    // 손절가 숨김
      dailyLimit: 1,          // 하루 1회
    },
    
    // 시그널 탭
    signal: {
      visibleCount: 1,        // 1개만 공개
      blurredCount: 4,        // 4개 블러
      delayMinutes: 60,       // 1시간 지연
      showPrice: false,       // 가격 숨김
    },
    
    // 급등주 탭
    hotStock: {
      visibleCount: 0,        // 완전 공개 없음
      blurredCount: 3,        // 3개 블러
      showPastOnly: true,     // 과거 성과만
      weeklyLimit: 0,
    },
    
    // 리포트 탭
    report: {
      level: 'summary' as const,
      showSectors: 1,         // 1개 섹터만
      blurRest: true,
    },
    
    // 포트폴리오 & 상담
    portfolio: { locked: true },
    consultation: { locked: true },
  },
  
  BASIC: {
    aiRecommendation: {
      visibleCount: 3,
      blurredCount: 2,
      showStopLoss: false,
      dailyLimit: 3,
    },
    signal: {
      visibleCount: 3,
      blurredCount: 2,
      delayMinutes: 30,
      showPrice: true,
    },
    hotStock: {
      visibleCount: 0,
      blurredCount: 3,
      showPastOnly: true,
      weeklyLimit: 0,
    },
    report: {
      level: 'basic' as const,
      showSectors: 3,
      blurRest: true,
    },
    portfolio: { locked: true },
    consultation: { locked: true },
  },
  
  PRO: {
    aiRecommendation: {
      visibleCount: Infinity,
      blurredCount: 0,
      showStopLoss: true,
      dailyLimit: Infinity,
    },
    signal: {
      visibleCount: Infinity,
      blurredCount: 0,
      delayMinutes: 0,
      showPrice: true,
    },
    hotStock: {
      visibleCount: 5,
      blurredCount: 0,
      showPastOnly: false,
      weeklyLimit: 5,
    },
    report: {
      level: 'detailed' as const,
      showSectors: Infinity,
      blurRest: false,
    },
    portfolio: { locked: true },
    consultation: { locked: true },
  },
  
  PREMIUM: {
    aiRecommendation: {
      visibleCount: Infinity,
      blurredCount: 0,
      showStopLoss: true,
      dailyLimit: Infinity,
    },
    signal: {
      visibleCount: Infinity,
      blurredCount: 0,
      delayMinutes: 0,
      showPrice: true,
    },
    hotStock: {
      visibleCount: Infinity,
      blurredCount: 0,
      showPastOnly: false,
      weeklyLimit: Infinity,
    },
    report: {
      level: 'premium' as const,
      showSectors: Infinity,
      blurRest: false,
    },
    portfolio: { locked: false },
    consultation: { locked: false },
  },
} as const;

export type DisplayPlanType = keyof typeof PLAN_DISPLAY_CONFIG;
export type ReportLevel = 'summary' | 'basic' | 'detailed' | 'premium';

// 플랜별 설정 가져오기
export function getPlanConfig(plan: DisplayPlanType) {
  return PLAN_DISPLAY_CONFIG[plan];
}

// 손절가 표시 여부
export function canShowStopLoss(plan: DisplayPlanType): boolean {
  return PLAN_DISPLAY_CONFIG[plan].aiRecommendation.showStopLoss;
}

// 시그널 가격 표시 여부
export function canShowSignalPrice(plan: DisplayPlanType): boolean {
  return PLAN_DISPLAY_CONFIG[plan].signal.showPrice;
}

// 급등주 접근 가능 여부
export function canAccessHotStocks(plan: DisplayPlanType): boolean {
  return !PLAN_DISPLAY_CONFIG[plan].hotStock.showPastOnly;
}


