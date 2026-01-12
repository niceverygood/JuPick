import { UserRole, ServiceType, SubscriptionStatus, LogType } from '@prisma/client'

export type { UserRole, ServiceType, SubscriptionStatus, LogType }

export interface UserWithRelations {
  id: string
  loginId: string
  name: string
  role: UserRole
  parentId: string | null
  parent?: UserWithRelations | null
  children?: UserWithRelations[]
  dailyRate: number
  memo: string | null
  isActive: boolean
  isFreeTest: boolean
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date | null
  subscriptions?: SubscriptionWithUser[]
}

export interface SubscriptionWithUser {
  id: string
  userId: string
  user?: UserWithRelations
  serviceType: ServiceType
  status: SubscriptionStatus
  startDate: Date
  endDate: Date
  isFreeTest: boolean
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface LogWithRelations {
  id: string
  type: LogType
  creatorId: string
  creator?: UserWithRelations
  targetId: string | null
  target?: UserWithRelations | null
  metadata: Record<string, unknown> | null
  serviceType: ServiceType | null
  days: number | null
  amount: number | null
  createdAt: Date
}

export interface NoticeWithAuthor {
  id: string
  title: string
  content: string
  attachmentUrl: string | null
  authorId: string
  author?: UserWithRelations
  isPinned: boolean
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SettlementDetails {
  agencies: AgencyDetail[]
  directUsers: UserDetail[]
}

export interface AgencyDetail {
  agencyId: string
  agencyName: string
  totalDays: number
  users: UserDetail[]
}

export interface UserDetail {
  userId: string
  userName: string
  paidDays: number
  freeDays: number
  services?: ServiceDetail[]
}

export interface ServiceDetail {
  serviceType: ServiceType
  days: number
  isFreeTest: boolean
}

export interface SettlementResult {
  distributorId: string
  distributorName: string
  dailyRate: number
  totalDays: number
  totalAmount: number
  freeTestDays: number
  details: SettlementDetails
}

export interface DashboardStats {
  weeklySettlement: number
  weeklySettlementChange: number
  totalSubordinates: number
  activeSubordinates: number
  subscriptionsByService: {
    stock: number
    coin: number
    futures: number
  }
  expiringCount: number
}

export interface CreateUserInput {
  loginId: string
  password: string
  name: string
  role: UserRole
  dailyRate?: number
  memo?: string
  subscriptions?: CreateSubscriptionInput[]
}

export interface CreateSubscriptionInput {
  serviceType: ServiceType
  startDate: Date
  endDate: Date
  isFreeTest?: boolean
}

export interface UpdateUserInput {
  name?: string
  password?: string
  dailyRate?: number
  memo?: string
  isActive?: boolean
}

export interface UpdateSubscriptionInput {
  endDate?: Date
  status?: SubscriptionStatus
}

// Session types
export interface SessionUser {
  id: string
  loginId: string
  name: string
  role: UserRole
}


