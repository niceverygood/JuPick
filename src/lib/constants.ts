export const ROLES = {
  MASTER: 'MASTER',
  DISTRIBUTOR: 'DISTRIBUTOR',
  AGENCY: 'AGENCY',
  USER: 'USER',
} as const

export const ROLE_LABELS: Record<string, string> = {
  MASTER: '마스터',
  DISTRIBUTOR: '총판',
  AGENCY: '대행사',
  USER: '유저',
}

export const SERVICE_TYPES = {
  STOCK: 'STOCK',
  COIN: 'COIN',
  COIN_FUTURES: 'COIN_FUTURES',
} as const

export const SERVICE_LABELS: Record<string, string> = {
  STOCK: '주식',
  COIN: '코인',
  COIN_FUTURES: '코인선물',
}

export const SERVICE_ICONS: Record<string, string> = {
  STOCK: '📈',
  COIN: '🪙',
  COIN_FUTURES: '📊',
}

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  PENDING: 'PENDING',
} as const

export const STATUS_LABELS: Record<string, string> = {
  ACTIVE: '활성',
  EXPIRED: '만료',
  PENDING: '대기',
}

export const LOG_TYPES = {
  SUBSCRIPTION_CREATED: 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_EXTENDED: 'SUBSCRIPTION_EXTENDED',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
  USER_CREATED: 'USER_CREATED',
  USER_DELETED: 'USER_DELETED',
  LOGIN: 'LOGIN',
  SETTLEMENT: 'SETTLEMENT',
} as const

export const LOG_LABELS: Record<string, string> = {
  SUBSCRIPTION_CREATED: '구독 생성',
  SUBSCRIPTION_EXTENDED: '구독 연장',
  SUBSCRIPTION_EXPIRED: '구독 만료',
  USER_CREATED: '유저 생성',
  USER_DELETED: '유저 삭제',
  LOGIN: '로그인',
  SETTLEMENT: '정산',
}

// 역할별 생성 가능한 하위 역할
export const CREATABLE_ROLES: Record<string, string[]> = {
  MASTER: ['DISTRIBUTOR', 'AGENCY', 'USER'],
  DISTRIBUTOR: ['AGENCY', 'USER'],
  AGENCY: ['USER'],
  USER: [],
}

// 빠른 선택 기간 (일)
export const QUICK_SELECT_DAYS = [7, 15, 30, 90]

// 기본 일일 단가
export const DEFAULT_DAILY_RATE = 100000

