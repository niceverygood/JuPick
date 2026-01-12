// src/lib/portone.ts
// 포트원 결제 연동 라이브러리

export const PORTONE_CONFIG = {
  // 포트원 스토어 ID (V2)
  storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID || '',
  // 채널 키 (주픽 채널)
  channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY || '',
  // API Secret (서버사이드용)
  apiSecret: process.env.PORTONE_API_SECRET || '',
}

// 결제 상태
export type PaymentStatus = 
  | 'READY'      // 결제 대기
  | 'PAID'       // 결제 완료
  | 'FAILED'     // 결제 실패
  | 'CANCELLED'  // 결제 취소
  | 'PARTIAL_CANCELLED' // 부분 취소

// 결제 요청 파라미터
export interface PaymentRequest {
  paymentId: string           // 고유 결제 ID
  orderName: string           // 주문명 (예: "JUPICK Pro 구독 1개월")
  totalAmount: number         // 결제 금액
  customer?: {
    customerId?: string       // 고객 ID
    fullName?: string         // 고객명
    phoneNumber?: string      // 연락처
    email?: string            // 이메일
  }
  redirectUrl?: string        // 결제 완료 후 리다이렉트 URL
  // 정기결제용
  billingKeyRequest?: {
    customerId: string        // 빌링키 저장용 고객 ID
  }
}

// 정기결제 빌링키 발급 파라미터
export interface BillingKeyRequest {
  customerId: string
  billingKeyId: string        // 빌링키 ID (고유값)
}

// 정기결제 요청 파라미터
export interface SubscriptionPaymentRequest {
  billingKey: string          // 발급받은 빌링키
  paymentId: string           // 고유 결제 ID
  orderName: string           // 주문명
  totalAmount: number         // 결제 금액
  customer?: {
    customerId?: string
    fullName?: string
    email?: string
  }
}

// 결제 결과
export interface PaymentResult {
  paymentId: string
  transactionId?: string
  status: PaymentStatus
  amount?: number
  paidAt?: string
  failedReason?: string
}

// 빌링키 결과
export interface BillingKeyResult {
  billingKey: string
  customerId: string
  cardInfo?: {
    cardCompany: string
    cardNumber: string        // 마스킹된 카드번호
  }
}

/**
 * 포트원 V2 결제창 호출을 위한 파라미터 생성
 */
export function createPaymentParams(request: PaymentRequest) {
  return {
    storeId: PORTONE_CONFIG.storeId,
    channelKey: PORTONE_CONFIG.channelKey,
    paymentId: request.paymentId,
    orderName: request.orderName,
    totalAmount: request.totalAmount,
    currency: 'CURRENCY_KRW',
    payMethod: 'CARD',
    customer: request.customer,
    redirectUrl: request.redirectUrl,
  }
}

/**
 * 빌링키 발급용 파라미터 생성 (정기결제)
 */
export function createBillingKeyParams(request: BillingKeyRequest) {
  return {
    storeId: PORTONE_CONFIG.storeId,
    channelKey: PORTONE_CONFIG.channelKey,
    billingKeyMethod: 'CARD',
    customer: {
      customerId: request.customerId,
    },
  }
}

/**
 * 결제 ID 생성 헬퍼
 */
export function generatePaymentId(prefix: string = 'payment'): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}_${timestamp}_${random}`
}

/**
 * 구독 플랜 정보
 */
export const SUBSCRIPTION_PLANS = {
  BASIC: {
    id: 'basic',
    name: 'Basic',
    price: 29000,
    description: 'AI 주식 추천 기본',
    features: ['일 3회 AI 추천', '시장 리포트', '이메일 알림'],
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 79000,
    description: 'AI 주식 추천 프로',
    features: ['무제한 AI 추천', '숨겨진 급등주', '실시간 시그널', '푸시 알림'],
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 149000,
    description: 'AI 주식 추천 프리미엄',
    features: ['Pro 모든 기능', '포트폴리오 AI 분석', '전문가 1:1 상담 (월 2회)', 'SMS 알림'],
  },
} as const

export type PlanId = keyof typeof SUBSCRIPTION_PLANS


