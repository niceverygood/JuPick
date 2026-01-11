import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Wallet, Users, TrendingUp, Clock } from "lucide-react"
import { StatCard } from "@/components/dashboard/StatCard"
import { WeeklyChart } from "@/components/dashboard/WeeklyChart"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { ExpiringSubscriptions } from "@/components/dashboard/ExpiringSubscriptions"
import { formatCurrency } from "@/lib/utils"

async function getStats(userId: string, role: string) {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)
  
  // Get subordinate IDs based on role
  let subordinateIds: string[] = []
  
  if (role === "MASTER") {
    const allUsers = await prisma.user.findMany({ select: { id: true } })
    subordinateIds = allUsers.map((u) => u.id)
  } else if (role === "DISTRIBUTOR") {
    const directChildren = await prisma.user.findMany({
      where: { parentId: userId },
      select: { id: true },
    })
    const grandchildren = await prisma.user.findMany({
      where: { parentId: { in: directChildren.map((c) => c.id) } },
      select: { id: true },
    })
    subordinateIds = [...directChildren, ...grandchildren].map((u) => u.id)
  } else if (role === "AGENCY") {
    const children = await prisma.user.findMany({
      where: { parentId: userId },
      select: { id: true },
    })
    subordinateIds = children.map((u) => u.id)
  }

  // Count active subscriptions by type
  const activeSubscriptions = await prisma.subscription.groupBy({
    by: ["serviceType"],
    where: {
      userId: { in: subordinateIds },
      status: "ACTIVE",
      endDate: { gte: now },
    },
    _count: true,
  })

  const subscriptionsByService = {
    stock: activeSubscriptions.find((s) => s.serviceType === "STOCK")?._count || 0,
    coin: activeSubscriptions.find((s) => s.serviceType === "COIN")?._count || 0,
    futures: activeSubscriptions.find((s) => s.serviceType === "COIN_FUTURES")?._count || 0,
  }

  // Count expiring subscriptions (7 days)
  const sevenDaysLater = new Date(now)
  sevenDaysLater.setDate(now.getDate() + 7)
  
  const expiringCount = await prisma.subscription.count({
    where: {
      userId: { in: subordinateIds },
      status: "ACTIVE",
      endDate: { gte: now, lte: sevenDaysLater },
    },
  })

  // Count subordinates
  const totalSubordinates = subordinateIds.length
  const activeSubordinates = await prisma.user.count({
    where: {
      id: { in: subordinateIds },
      isActive: true,
    },
  })

  // Calculate weekly settlement (for distributors)
  let weeklySettlement = 0
  if (role === "MASTER") {
    const distributors = await prisma.user.findMany({
      where: { role: "DISTRIBUTOR" },
      select: { id: true, dailyRate: true },
    })
    
    for (const dist of distributors) {
      const distChildren = await prisma.user.findMany({
        where: {
          OR: [
            { parentId: dist.id },
            { parent: { parentId: dist.id } },
          ],
          role: "USER",
        },
        select: { id: true },
      })
      
      const subs = await prisma.subscription.findMany({
        where: {
          userId: { in: distChildren.map((c) => c.id) },
          status: "ACTIVE",
          isFreeTest: false,
          startDate: { lte: weekEnd },
          endDate: { gte: weekStart },
        },
      })
      
      let totalDays = 0
      for (const sub of subs) {
        const start = new Date(Math.max(sub.startDate.getTime(), weekStart.getTime()))
        const end = new Date(Math.min(sub.endDate.getTime(), weekEnd.getTime()))
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
        totalDays += Math.max(0, days)
      }
      
      weeklySettlement += totalDays * dist.dailyRate
    }
  }

  return {
    weeklySettlement,
    totalSubordinates,
    activeSubordinates,
    subscriptionsByService,
    expiringCount,
  }
}

async function getChartData(userId: string, role: string) {
  // Generate last 7 days data
  const data = []
  const now = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(now.getDate() - i)
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
    
    // Placeholder data - in production, calculate from actual subscriptions
    data.push({
      date: dateStr,
      stock: Math.floor(Math.random() * 50) + 20,
      coin: Math.floor(Math.random() * 40) + 15,
      futures: Math.floor(Math.random() * 30) + 10,
    })
  }
  
  return data
}

async function getRecentLogs(userId: string, role: string) {
  let where = {}
  
  if (role !== "MASTER") {
    const subordinateIds = await getSubordinateIds(userId, role)
    where = {
      OR: [
        { creatorId: userId },
        { targetId: { in: subordinateIds } },
      ],
    }
  }
  
  const logs = await prisma.log.findMany({
    where,
    include: {
      creator: { select: { id: true, loginId: true, name: true, role: true } },
      target: { select: { id: true, loginId: true, name: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  })
  
  return logs
}

async function getExpiringSubscriptions(userId: string, role: string) {
  const now = new Date()
  const sevenDaysLater = new Date(now)
  sevenDaysLater.setDate(now.getDate() + 7)
  
  let subordinateIds: string[] = []
  
  if (role === "MASTER") {
    const allUsers = await prisma.user.findMany({ select: { id: true } })
    subordinateIds = allUsers.map((u) => u.id)
  } else {
    subordinateIds = await getSubordinateIds(userId, role)
  }
  
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: { in: subordinateIds },
      status: "ACTIVE",
      endDate: { gte: now, lte: sevenDaysLater },
    },
    include: {
      user: { select: { id: true, loginId: true, name: true, role: true } },
    },
    orderBy: { endDate: "asc" },
    take: 10,
  })
  
  return subscriptions
}

async function getSubordinateIds(userId: string, role: string): Promise<string[]> {
  if (role === "DISTRIBUTOR") {
    const directChildren = await prisma.user.findMany({
      where: { parentId: userId },
      select: { id: true },
    })
    const grandchildren = await prisma.user.findMany({
      where: { parentId: { in: directChildren.map((c) => c.id) } },
      select: { id: true },
    })
    return [...directChildren, ...grandchildren].map((u) => u.id)
  } else if (role === "AGENCY") {
    const children = await prisma.user.findMany({
      where: { parentId: userId },
      select: { id: true },
    })
    return children.map((u) => u.id)
  }
  return []
}

export default async function DashboardPage() {
  const session = await auth()
  const userId = session?.user?.id || ""
  const role = session?.user?.role || "USER"
  
  const [stats, chartData, logs, expiringSubscriptions] = await Promise.all([
    getStats(userId, role),
    getChartData(userId, role),
    getRecentLogs(userId, role),
    getExpiringSubscriptions(userId, role),
  ])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">📊 대시보드</h1>
        <p className="text-muted-foreground">
          자동매매 서비스 현황을 한눈에 확인하세요.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {role === "MASTER" && (
          <StatCard
            title="💰 이번주 정산예정"
            value={formatCurrency(stats.weeklySettlement)}
            change={12}
            icon={Wallet}
            iconColor="text-emerald-500"
          />
        )}
        <StatCard
          title="👥 하위계정 현황"
          value={`${stats.totalSubordinates}명`}
          subtitle={`활성: ${stats.activeSubordinates}명`}
          icon={Users}
          iconColor="text-blue-500"
        />
        <StatCard
          title="📈 활성구독 현황"
          value={`${stats.subscriptionsByService.stock + stats.subscriptionsByService.coin + stats.subscriptionsByService.futures}건`}
          subtitle={`주식: ${stats.subscriptionsByService.stock} / 코인: ${stats.subscriptionsByService.coin} / 선물: ${stats.subscriptionsByService.futures}`}
          icon={TrendingUp}
          iconColor="text-violet-500"
        />
        <StatCard
          title="⏰ 만료 예정"
          value={`${stats.expiringCount}건`}
          subtitle="7일 이내"
          icon={Clock}
          iconColor="text-amber-500"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <WeeklyChart data={chartData} />
        <ExpiringSubscriptions subscriptions={expiringSubscriptions as any} />
      </div>

      {/* Recent Activity */}
      <RecentActivity logs={logs as any} />
    </div>
  )
}

