// src/lib/settlement.ts
// 정산 자동화 핵심 로직

import prisma from './prisma'

// 알림 발송 함수 (notifications 모듈이 없을 경우 대체)
async function sendNotification(params: {
  userId: string
  type: string
  title: string
  message: string
}) {
  try {
    // 알림을 DB에 저장
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type as any,
        title: params.title,
        message: params.message,
      }
    })
    console.log(`[NOTIFICATION] ${params.title} - ${params.message}`)
  } catch (error) {
    console.error('Failed to send notification:', error)
  }
}

interface UserSettlement {
  userId: string
  loginId: string
  name: string
  paidDays: number
  freeDays: number
  services: { serviceType: string; days: number; isFreeTest: boolean }[]
}

interface AgencySettlement {
  agencyId: string
  agencyName: string
  agencyDisplayName: string
  totalDays: number
  freeTestDays: number
  users: UserSettlement[]
}

interface DistributorSettlement {
  distributorId: string
  distributorName: string
  distributorDisplayName: string
  dailyRate: number
  totalDays: number
  freeTestDays: number
  totalAmount: number
  details: {
    agencies: AgencySettlement[]
    directUsers: UserSettlement[]
  }
}

/**
 * 특정 기간의 사용자 이용일수 계산
 */
async function calculateUserDays(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  paidDays: number
  freeDays: number
  services: { serviceType: string; days: number; isFreeTest: boolean }[]
}> {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId,
      status: 'ACTIVE',
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
  })

  let paidDays = 0
  let freeDays = 0
  const services: { serviceType: string; days: number; isFreeTest: boolean }[] = []

  for (const sub of subscriptions) {
    const effectiveStart = new Date(Math.max(sub.startDate.getTime(), startDate.getTime()))
    const effectiveEnd = new Date(Math.min(sub.endDate.getTime(), endDate.getTime()))
    const days = Math.ceil((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1

    if (days > 0) {
      services.push({
        serviceType: sub.serviceType,
        days,
        isFreeTest: sub.isFreeTest,
      })

      if (sub.isFreeTest) {
        freeDays += days
      } else {
        paidDays += days
      }
    }
  }

  return { paidDays, freeDays, services }
}

/**
 * 전체 정산 데이터 계산
 */
export async function calculateAllSettlements(
  periodStart: Date,
  periodEnd: Date
): Promise<{
  settlements: DistributorSettlement[]
  summary: { totalAmount: number; totalDays: number; totalFreeTestDays: number }
}> {
  const distributors = await prisma.user.findMany({
    where: { role: 'DISTRIBUTOR' },
    select: { id: true, loginId: true, name: true, dailyRate: true },
  })

  const results: DistributorSettlement[] = []
  let totalAmount = 0
  let totalDays = 0
  let totalFreeTestDays = 0

  for (const dist of distributors) {
    const directChildren = await prisma.user.findMany({
      where: { parentId: dist.id },
      select: { id: true, loginId: true, name: true, role: true },
    })

    const agencies = directChildren.filter((c) => c.role === 'AGENCY')
    const directUsers = directChildren.filter((c) => c.role === 'USER')

    let distTotalDays = 0
    let distFreeTestDays = 0
    const agencyDetails: AgencySettlement[] = []
    const directUserDetails: UserSettlement[] = []

    // 직접 유저 계산
    for (const user of directUsers) {
      const { paidDays, freeDays, services } = await calculateUserDays(user.id, periodStart, periodEnd)
      distTotalDays += paidDays
      distFreeTestDays += freeDays
      if (paidDays > 0 || freeDays > 0) {
        directUserDetails.push({
          userId: user.id,
          loginId: user.loginId,
          name: user.name,
          paidDays,
          freeDays,
          services,
        })
      }
    }

    // 대행사 유저 계산
    for (const agency of agencies) {
      const agencyUsers = await prisma.user.findMany({
        where: { parentId: agency.id, role: 'USER' },
        select: { id: true, loginId: true, name: true },
      })

      let agencyTotalDays = 0
      let agencyFreeTestDays = 0
      const agencyUserDetails: UserSettlement[] = []

      for (const user of agencyUsers) {
        const { paidDays, freeDays, services } = await calculateUserDays(user.id, periodStart, periodEnd)
        agencyTotalDays += paidDays
        agencyFreeTestDays += freeDays
        distTotalDays += paidDays
        distFreeTestDays += freeDays
        if (paidDays > 0 || freeDays > 0) {
          agencyUserDetails.push({
            userId: user.id,
            loginId: user.loginId,
            name: user.name,
            paidDays,
            freeDays,
            services,
          })
        }
      }

      agencyDetails.push({
        agencyId: agency.id,
        agencyName: agency.loginId,
        agencyDisplayName: agency.name,
        totalDays: agencyTotalDays,
        freeTestDays: agencyFreeTestDays,
        users: agencyUserDetails,
      })
    }

    const distAmount = distTotalDays * dist.dailyRate
    totalAmount += distAmount
    totalDays += distTotalDays
    totalFreeTestDays += distFreeTestDays

    results.push({
      distributorId: dist.id,
      distributorName: dist.loginId,
      distributorDisplayName: dist.name,
      dailyRate: dist.dailyRate,
      totalDays: distTotalDays,
      freeTestDays: distFreeTestDays,
      totalAmount: distAmount,
      details: {
        agencies: agencyDetails,
        directUsers: directUserDetails,
      },
    })
  }

  return {
    settlements: results,
    summary: { totalAmount, totalDays, totalFreeTestDays },
  }
}

/**
 * 정산 확정 및 DB 저장
 */
export async function confirmSettlements(
  periodStart: Date,
  periodEnd: Date
): Promise<{ success: boolean; settlementsCreated: number; error?: string }> {
  try {
    // 이미 확정된 정산이 있는지 확인
    const existingSettlement = await prisma.settlement.findFirst({
      where: {
        periodStart: { gte: periodStart },
        periodEnd: { lte: periodEnd },
      },
    })

    if (existingSettlement) {
      return {
        success: false,
        settlementsCreated: 0,
        error: '해당 기간의 정산이 이미 확정되었습니다.',
      }
    }

    // 정산 데이터 계산
    const { settlements } = await calculateAllSettlements(periodStart, periodEnd)

    // DB에 저장
    const createdSettlements = await prisma.$transaction(
      settlements.map((settlement) =>
        prisma.settlement.create({
          data: {
            distributorId: settlement.distributorId,
            periodStart,
            periodEnd,
            totalDays: settlement.totalDays,
            dailyRate: settlement.dailyRate,
            totalAmount: settlement.totalAmount,
            details: settlement.details as any,
            isPaid: false,
          },
        })
      )
    )

    // 정산 로그 생성
    await prisma.log.createMany({
      data: settlements.map((settlement) => ({
        type: 'SETTLEMENT',
        creatorId: 'system', // 시스템에서 생성
        targetId: settlement.distributorId,
        metadata: {
          periodStart: periodStart.toISOString(),
          periodEnd: periodEnd.toISOString(),
          totalDays: settlement.totalDays,
          totalAmount: settlement.totalAmount,
        },
        serviceType: null,
        days: settlement.totalDays,
        amount: settlement.totalAmount,
      })),
    })

    // 총판들에게 알림 발송
    for (const settlement of settlements) {
      await sendSettlementNotification(
        settlement.distributorId,
        settlement.totalAmount,
        periodStart,
        periodEnd
      )
    }

    return {
      success: true,
      settlementsCreated: createdSettlements.length,
    }
  } catch (error) {
    console.error('Settlement confirmation error:', error)
    return {
      success: false,
      settlementsCreated: 0,
      error: error instanceof Error ? error.message : '정산 확정 중 오류가 발생했습니다.',
    }
  }
}

/**
 * 정산 완료 알림 발송
 */
async function sendSettlementNotification(
  distributorId: string,
  amount: number,
  periodStart: Date,
  periodEnd: Date
) {
  try {
    await sendNotification({
      userId: distributorId,
      type: 'SYSTEM',
      title: '📊 주간 정산 확정 안내',
      message: `${formatDate(periodStart)} ~ ${formatDate(periodEnd)} 기간의 정산이 확정되었습니다.\n정산 금액: ${amount.toLocaleString()}원`,
    })
  } catch (error) {
    console.error('Failed to send settlement notification:', error)
  }
}

/**
 * 정산 지급 완료 처리
 */
export async function markSettlementAsPaid(
  settlementId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.settlement.update({
      where: { id: settlementId },
      data: {
        isPaid: true,
        paidAt: new Date(),
      },
    })

    // 지급 완료 알림 발송
    const settlement = await prisma.settlement.findUnique({
      where: { id: settlementId },
    })

    if (settlement) {
      await sendNotification({
        userId: settlement.distributorId,
        type: 'SYSTEM',
        title: '💰 정산 지급 완료',
        message: `${settlement.totalAmount.toLocaleString()}원이 지급되었습니다.`,
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Mark settlement as paid error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '지급 처리 중 오류가 발생했습니다.',
    }
  }
}

/**
 * 확정된 정산 내역 조회
 */
export async function getConfirmedSettlements(options?: {
  distributorId?: string
  isPaid?: boolean
  limit?: number
}) {
  return prisma.settlement.findMany({
    where: {
      ...(options?.distributorId && { distributorId: options.distributorId }),
      ...(options?.isPaid !== undefined && { isPaid: options.isPaid }),
    },
    orderBy: { periodStart: 'desc' },
    take: options?.limit || 10,
  })
}

/**
 * 지난 주 기간 계산
 */
export function getLastWeekPeriod(): { start: Date; end: Date } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  
  // 지난 주 일요일
  const lastSunday = new Date(now)
  lastSunday.setDate(now.getDate() - dayOfWeek - 7)
  lastSunday.setHours(0, 0, 0, 0)
  
  // 지난 주 토요일
  const lastSaturday = new Date(lastSunday)
  lastSaturday.setDate(lastSunday.getDate() + 6)
  lastSaturday.setHours(23, 59, 59, 999)
  
  return { start: lastSunday, end: lastSaturday }
}

/**
 * 이번 주 기간 계산
 */
export function getThisWeekPeriod(): { start: Date; end: Date } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  
  // 이번 주 일요일
  const thisSunday = new Date(now)
  thisSunday.setDate(now.getDate() - dayOfWeek)
  thisSunday.setHours(0, 0, 0, 0)
  
  // 이번 주 토요일
  const thisSaturday = new Date(thisSunday)
  thisSaturday.setDate(thisSunday.getDate() + 6)
  thisSaturday.setHours(23, 59, 59, 999)
  
  return { start: thisSunday, end: thisSaturday }
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

