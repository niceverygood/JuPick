import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const userRole = session.user.role
    const userId = session.user.id

    // Master, Distributor, Agency can view settlements
    if (userRole !== "MASTER" && userRole !== "DISTRIBUTOR" && userRole !== "AGENCY") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const periodStart = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(new Date().getDate() - new Date().getDay()))
    const periodEnd = endDate
      ? new Date(endDate)
      : new Date(new Date().setDate(periodStart.getDate() + 6))

    periodStart.setHours(0, 0, 0, 0)
    periodEnd.setHours(23, 59, 59, 999)

    // AGENCY 역할인 경우 별도 처리
    if (userRole === "AGENCY") {
      return await getAgencySettlements(userId, periodStart, periodEnd)
    }

    // Get distributors (MASTER or DISTRIBUTOR)
    let distributors
    if (userRole === "MASTER") {
      distributors = await prisma.user.findMany({
        where: { role: "DISTRIBUTOR" },
        select: { id: true, loginId: true, name: true, dailyRate: true },
      })
    } else {
      // DISTRIBUTOR - only their own data
      distributors = [
        await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, loginId: true, name: true, dailyRate: true },
        }),
      ].filter(Boolean)
    }

    const results = []
    let totalAmount = 0
    let totalDays = 0
    let totalFreeTestDays = 0

    for (const dist of distributors) {
      if (!dist) continue

      // Get all users under this distributor
      const directChildren = await prisma.user.findMany({
        where: { parentId: dist.id },
        select: { id: true, loginId: true, name: true, role: true },
      })

      const agencies = directChildren.filter((c) => c.role === "AGENCY")
      const directUsers = directChildren.filter((c) => c.role === "USER")

      let distTotalDays = 0
      let distFreeTestDays = 0
      const agencyDetails = []
      const directUserDetails = []

      // Calculate direct users
      for (const user of directUsers) {
        const { paidDays, freeDays, services } = await calculateUserDays(
          user.id,
          periodStart,
          periodEnd
        )
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

      // Calculate agency users
      for (const agency of agencies) {
        const agencyUsers = await prisma.user.findMany({
          where: { parentId: agency.id, role: "USER" },
          select: { id: true, loginId: true, name: true },
        })

        let agencyTotalDays = 0
        let agencyFreeTestDays = 0
        const agencyUserDetails = []

        for (const user of agencyUsers) {
          const { paidDays, freeDays, services } = await calculateUserDays(
            user.id,
            periodStart,
            periodEnd
          )
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
          userCount: agencyUsers.length,
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
        agencyCount: agencies.length,
        directUserCount: directUsers.length,
        details: {
          agencies: agencyDetails,
          directUsers: directUserDetails,
        },
      })
    }

    return NextResponse.json({
      role: userRole,
      periodStart,
      periodEnd,
      settlements: results,
      summary: {
        totalAmount,
        totalDays,
        totalFreeTestDays,
      },
    })
  } catch (error) {
    console.error("Error calculating settlements:", error)
    return NextResponse.json(
      { error: "Failed to calculate settlements" },
      { status: 500 }
    )
  }
}

// 대행사(AGENCY) 정산 조회
async function getAgencySettlements(agencyId: string, periodStart: Date, periodEnd: Date) {
  // 대행사 정보 조회
  const agency = await prisma.user.findUnique({
    where: { id: agencyId },
    select: { 
      id: true, 
      loginId: true, 
      name: true,
      parent: {
        select: { id: true, loginId: true, name: true, dailyRate: true }
      }
    },
  })

  if (!agency) {
    return NextResponse.json({ error: "Agency not found" }, { status: 404 })
  }

  // 대행사 소속 유저들 조회
  const users = await prisma.user.findMany({
    where: { parentId: agencyId, role: "USER" },
    select: { id: true, loginId: true, name: true },
  })

  let totalDays = 0
  let totalFreeTestDays = 0
  const userDetails = []

  for (const user of users) {
    const { paidDays, freeDays, services } = await calculateUserDays(
      user.id,
      periodStart,
      periodEnd
    )
    totalDays += paidDays
    totalFreeTestDays += freeDays
    
    userDetails.push({
      userId: user.id,
      loginId: user.loginId,
      name: user.name,
      paidDays,
      freeDays,
      services,
    })
  }

  // 정산 예상 금액 (총판의 단가 기준)
  const estimatedAmount = agency.parent ? totalDays * agency.parent.dailyRate : 0

  return NextResponse.json({
    role: "AGENCY",
    periodStart,
    periodEnd,
    agency: {
      id: agency.id,
      loginId: agency.loginId,
      name: agency.name,
      parentDistributor: agency.parent ? {
        id: agency.parent.id,
        loginId: agency.parent.loginId,
        name: agency.parent.name,
        dailyRate: agency.parent.dailyRate,
      } : null,
    },
    summary: {
      totalUsers: users.length,
      activeUsers: userDetails.filter(u => u.paidDays > 0 || u.freeDays > 0).length,
      totalDays,
      totalFreeTestDays,
      estimatedAmount, // 참고용 예상 금액
    },
    users: userDetails,
  })
}

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
      status: "ACTIVE",
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
  })

  let paidDays = 0
  let freeDays = 0
  const services: { serviceType: string; days: number; isFreeTest: boolean }[] = []

  for (const sub of subscriptions) {
    const effectiveStart = new Date(
      Math.max(sub.startDate.getTime(), startDate.getTime())
    )
    const effectiveEnd = new Date(
      Math.min(sub.endDate.getTime(), endDate.getTime())
    )
    const days =
      Math.ceil(
        (effectiveEnd.getTime() - effectiveStart.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1

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
