"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { 
  Download, 
  ChevronDown, 
  ChevronRight, 
  CalendarIcon,
  Users,
  Calendar,
  TrendingUp,
  Building2,
  UserCheck,
  Wallet,
  Clock,
  Gift,
  BarChart3,
  Settings2
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SettlementConfirmation, ConfirmedSettlementsHistory } from "@/components/settlement/SettlementConfirmation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { formatDate, formatCurrency } from "@/lib/utils"
import { SERVICE_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface UserDetail {
  userId: string
  loginId: string
  name: string
  paidDays: number
  freeDays: number
  services: { serviceType: string; days: number; isFreeTest: boolean }[]
}

interface AgencyDetail {
  agencyId: string
  agencyName: string
  agencyDisplayName?: string
  totalDays: number
  freeTestDays?: number
  users: UserDetail[]
  userCount?: number
}

interface SettlementData {
  distributorId: string
  distributorName: string
  distributorDisplayName?: string
  dailyRate: number
  totalDays: number
  freeTestDays: number
  totalAmount: number
  agencyCount?: number
  directUserCount?: number
  details: {
    agencies: AgencyDetail[]
    directUsers: UserDetail[]
  }
}

interface AgencySettlementData {
  role: "AGENCY"
  periodStart: string
  periodEnd: string
  agency: {
    id: string
    loginId: string
    name: string
    parentDistributor: {
      id: string
      loginId: string
      name: string
      dailyRate: number
    } | null
  }
  summary: {
    totalUsers: number
    activeUsers: number
    totalDays: number
    totalFreeTestDays: number
    estimatedAmount: number
  }
  users: UserDetail[]
}

export default function LogsPage() {
  const { data: session } = useSession()
  const userRole = session?.user?.role
  
  const [periodStart, setPeriodStart] = useState<Date>(() => {
    const now = new Date()
    const day = now.getDay()
    const start = new Date(now)
    start.setDate(now.getDate() - day)
    start.setHours(0, 0, 0, 0)
    return start
  })
  const [periodEnd, setPeriodEnd] = useState<Date>(() => {
    const start = new Date()
    const day = start.getDay()
    start.setDate(start.getDate() - day + 6)
    start.setHours(23, 59, 59, 999)
    return start
  })
  const [isLoading, setIsLoading] = useState(true)
  
  // Master/Distributor용 상태
  const [settlements, setSettlements] = useState<SettlementData[]>([])
  const [summary, setSummary] = useState({ totalAmount: 0, totalDays: 0, totalFreeTestDays: 0 })
  const [expandedDistributors, setExpandedDistributors] = useState<Set<string>>(new Set())
  const [expandedAgencies, setExpandedAgencies] = useState<Set<string>>(new Set())
  
  // Agency용 상태
  const [agencyData, setAgencyData] = useState<AgencySettlementData | null>(null)

  useEffect(() => {
    fetchSettlements()
  }, [periodStart, periodEnd])

  const fetchSettlements = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("startDate", periodStart.toISOString())
      params.set("endDate", periodEnd.toISOString())

      const res = await fetch(`/api/settlements?${params}`)
      const data = await res.json()
      
      if (data.role === "AGENCY") {
        setAgencyData(data)
        setSettlements([])
      } else {
        setSettlements(data.settlements || [])
        setSummary(data.summary || { totalAmount: 0, totalDays: 0, totalFreeTestDays: 0 })
        setAgencyData(null)
      }
    } catch (error) {
      console.error("Failed to fetch settlements:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDistributor = (id: string) => {
    setExpandedDistributors((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const toggleAgency = (id: string) => {
    setExpandedAgencies((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const isMaster = userRole === "MASTER"
  const isDistributor = userRole === "DISTRIBUTOR"
  const isAgency = userRole === "AGENCY"

  // 대행사 뷰
  if (isAgency && agencyData) {
    return (
      <AgencySettlementView 
        data={agencyData}
        periodStart={periodStart}
        periodEnd={periodEnd}
        setPeriodStart={setPeriodStart}
        setPeriodEnd={setPeriodEnd}
        onRefresh={fetchSettlements}
        isLoading={isLoading}
      />
    )
  }

  // 총판 뷰 (자신의 데이터만)
  if (isDistributor && settlements.length > 0) {
    return (
      <DistributorSettlementView
        settlement={settlements[0]}
        periodStart={periodStart}
        periodEnd={periodEnd}
        setPeriodStart={setPeriodStart}
        setPeriodEnd={setPeriodEnd}
        onRefresh={fetchSettlements}
        isLoading={isLoading}
        expandedAgencies={expandedAgencies}
        toggleAgency={toggleAgency}
      />
    )
  }

  // 마스터 뷰 (모든 총판)
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">📋 정산 관리</h1>
        <p className="text-muted-foreground">
          기간별 이용일수 및 정산 내역을 확인합니다.
        </p>
      </div>

      {/* Tabs for Master */}
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="current" className="gap-2">
            <Calendar className="w-4 h-4" />
            현재 정산
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Settings2 className="w-4 h-4" />
            확정 내역
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {/* Period Selector */}
          <PeriodSelector
            periodStart={periodStart}
            periodEnd={periodEnd}
            setPeriodStart={setPeriodStart}
            setPeriodEnd={setPeriodEnd}
            onRefresh={fetchSettlements}
          />

      {/* Summary Cards */}
      {isMaster && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="총 정산금액"
            value={formatCurrency(summary.totalAmount)}
            icon={Wallet}
            iconColor="text-emerald-400"
            description="이번 주 총 정산 예정액"
          />
          <StatCard
            title="총 이용일수"
            value={`${summary.totalDays}일`}
            icon={Calendar}
            iconColor="text-blue-400"
            description="유료 서비스 이용일"
          />
          <StatCard
            title="무료 테스트"
            value={`${summary.totalFreeTestDays}일`}
            icon={Gift}
            iconColor="text-amber-400"
            description="정산 제외 일수"
          />
          <StatCard
            title="총판 수"
            value={`${settlements.length}개`}
            icon={Building2}
            iconColor="text-purple-400"
            description="활성 총판"
          />
        </div>
      )}

      {/* Master Summary Table */}
      {isMaster && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              총판별 정산 요약
            </CardTitle>
            <CardDescription>
              {formatDate(periodStart)} ~ {formatDate(periodEnd)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="py-3 text-left font-medium text-muted-foreground">총판</th>
                    <th className="py-3 text-center font-medium text-muted-foreground">대행사</th>
                    <th className="py-3 text-center font-medium text-muted-foreground">직접 유저</th>
                    <th className="py-3 text-right font-medium text-muted-foreground">이용일수</th>
                    <th className="py-3 text-right font-medium text-muted-foreground">단가</th>
                    <th className="py-3 text-right font-medium text-muted-foreground">정산금액</th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.map((settlement) => (
                    <tr key={settlement.distributorId} className="border-b border-border/30 hover:bg-muted/30">
                      <td className="py-3">
                        <div>
                          <p className="font-medium">{settlement.distributorDisplayName || settlement.distributorName}</p>
                          <p className="text-xs text-muted-foreground">{settlement.distributorName}</p>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <Badge variant="outline">{settlement.agencyCount || settlement.details.agencies.length}개</Badge>
                      </td>
                      <td className="py-3 text-center">
                        <Badge variant="outline">{settlement.directUserCount || settlement.details.directUsers.length}명</Badge>
                      </td>
                      <td className="py-3 text-right">
                        <span className="font-medium">{settlement.totalDays}일</span>
                        {settlement.freeTestDays > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">(+{settlement.freeTestDays} 무료)</span>
                        )}
                      </td>
                      <td className="py-3 text-right text-muted-foreground">
                        {formatCurrency(settlement.dailyRate)}/일
                      </td>
                      <td className="py-3 text-right">
                        <span className="font-bold text-emerald-400">
                          {formatCurrency(settlement.totalAmount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-muted/30">
                    <td className="py-3">합계</td>
                    <td className="py-3 text-center">-</td>
                    <td className="py-3 text-center">-</td>
                    <td className="py-3 text-right">{summary.totalDays}일</td>
                    <td className="py-3 text-right">-</td>
                    <td className="py-3 text-right text-emerald-400">{formatCurrency(summary.totalAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Breakdown */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">📊 상세 내역</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">로딩 중...</div>
          ) : settlements.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              해당 기간의 정산 내역이 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {settlements.map((settlement) => (
                <div key={settlement.distributorId}>
                  {/* Distributor Row */}
                  <div
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-4 py-3 hover:bg-muted/50 transition-colors"
                    onClick={() => toggleDistributor(settlement.distributorId)}
                  >
                    <div className="flex items-center gap-3">
                      {expandedDistributors.has(settlement.distributorId) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Building2 className="w-5 h-5 text-purple-400" />
                      <div>
                        <span className="font-medium">{settlement.distributorDisplayName || settlement.distributorName}</span>
                        <span className="text-xs text-muted-foreground ml-2">({settlement.distributorName})</span>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        단가: {formatCurrency(settlement.dailyRate)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {settlement.totalDays}일
                      </span>
                      <span className="font-bold text-emerald-400">
                        {formatCurrency(settlement.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedDistributors.has(settlement.distributorId) && (
                    <div className="ml-6 mt-2 space-y-2 animate-fade-in">
                      {/* Direct Users */}
                      {settlement.details.directUsers.length > 0 && (
                        <div className="rounded-lg border border-border/30 bg-background/50 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Users className="w-4 h-4 text-blue-400" />
                            <p className="text-sm font-medium">
                              직접 생성 유저
                            </p>
                            <Badge variant="outline" className="ml-auto">
                              {settlement.details.directUsers.reduce((acc, u) => acc + u.paidDays, 0)}일
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            {settlement.details.directUsers.map((user) => (
                              <UserRow key={user.userId} user={user} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Agencies */}
                      {settlement.details.agencies.map((agency) => (
                        <div key={agency.agencyId}>
                          <div
                            className="flex cursor-pointer items-center justify-between rounded-lg border border-border/30 bg-background/50 px-4 py-3 hover:bg-muted/30 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleAgency(agency.agencyId)
                            }}
                          >
                            <div className="flex items-center gap-2">
                              {expandedAgencies.has(agency.agencyId) ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                              <UserCheck className="w-4 h-4 text-amber-400" />
                              <span className="text-sm font-medium">
                                {agency.agencyDisplayName || agency.agencyName}
                              </span>
                              <Badge variant="outline" className="text-xs">대행사</Badge>
                              <Badge variant="secondary" className="text-xs">
                                {agency.users.length}명
                              </Badge>
                            </div>
                            <span className="text-sm font-medium">
                              {agency.totalDays}일
                            </span>
                          </div>

                          {expandedAgencies.has(agency.agencyId) && (
                            <div className="ml-6 mt-2 rounded-lg border border-border/30 bg-background/30 p-4 animate-fade-in">
                              {agency.users.length > 0 ? (
                                <div className="space-y-2">
                                  {agency.users.map((user) => (
                                    <UserRow key={user.userId} user={user} />
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground text-center py-2">
                                  해당 기간에 이용 내역이 없습니다.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}

                      {settlement.details.agencies.length === 0 && settlement.details.directUsers.length === 0 && (
                        <div className="rounded-lg border border-border/30 bg-background/50 p-4 text-center text-muted-foreground">
                          해당 기간에 이용 내역이 없습니다.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

          {/* Settlement Confirmation (Master Only) */}
          {isMaster && (
            <SettlementConfirmation
              periodStart={periodStart}
              periodEnd={periodEnd}
              totalAmount={summary.totalAmount}
              totalDays={summary.totalDays}
              settlementsCount={settlements.length}
              onConfirm={fetchSettlements}
            />
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <ConfirmedSettlementsHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// 총판 정산 뷰 컴포넌트
function DistributorSettlementView({
  settlement,
  periodStart,
  periodEnd,
  setPeriodStart,
  setPeriodEnd,
  onRefresh,
  isLoading,
  expandedAgencies,
  toggleAgency,
}: {
  settlement: SettlementData
  periodStart: Date
  periodEnd: Date
  setPeriodStart: (date: Date) => void
  setPeriodEnd: (date: Date) => void
  onRefresh: () => void
  isLoading: boolean
  expandedAgencies: Set<string>
  toggleAgency: (id: string) => void
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">📋 내 정산 현황</h1>
        <p className="text-muted-foreground">
          내 하위 대행사 및 유저의 이용 현황과 정산 내역을 확인합니다.
        </p>
      </div>

      {/* Period Selector */}
      <PeriodSelector
        periodStart={periodStart}
        periodEnd={periodEnd}
        setPeriodStart={setPeriodStart}
        setPeriodEnd={setPeriodEnd}
        onRefresh={onRefresh}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="이번 주 정산금액"
          value={formatCurrency(settlement.totalAmount)}
          icon={Wallet}
          iconColor="text-emerald-400"
          description={`단가: ${formatCurrency(settlement.dailyRate)}/일`}
        />
        <StatCard
          title="유료 이용일수"
          value={`${settlement.totalDays}일`}
          icon={Calendar}
          iconColor="text-blue-400"
          description="정산 대상 일수"
        />
        <StatCard
          title="무료 테스트"
          value={`${settlement.freeTestDays}일`}
          icon={Gift}
          iconColor="text-amber-400"
          description="정산 제외 일수"
        />
        <StatCard
          title="소속 현황"
          value={`${settlement.details.agencies.length}개 대행사`}
          icon={Building2}
          iconColor="text-purple-400"
          description={`직접 유저 ${settlement.details.directUsers.length}명`}
        />
      </div>

      {/* Info Card */}
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-full">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-emerald-400">
                {formatDate(periodStart)} ~ {formatDate(periodEnd)} 정산 예정
              </p>
              <p className="text-sm text-muted-foreground">
                총 {settlement.totalDays}일 × {formatCurrency(settlement.dailyRate)} = <span className="font-bold text-emerald-400">{formatCurrency(settlement.totalAmount)}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Direct Users */}
      {settlement.details.directUsers.length > 0 && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-lg">직접 생성 유저</CardTitle>
              </div>
              <Badge variant="outline">
                {settlement.details.directUsers.reduce((acc, u) => acc + u.paidDays, 0)}일
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {settlement.details.directUsers.map((user) => (
                <UserRow key={user.userId} user={user} showDetails />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agencies */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              <CardTitle className="text-lg">소속 대행사</CardTitle>
            </div>
            <Badge variant="outline">
              {settlement.details.agencies.length}개
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">로딩 중...</div>
          ) : settlement.details.agencies.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              소속 대행사가 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {settlement.details.agencies.map((agency) => (
                <div key={agency.agencyId}>
                  <div
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-4 py-3 hover:bg-muted/50 transition-colors"
                    onClick={() => toggleAgency(agency.agencyId)}
                  >
                    <div className="flex items-center gap-3">
                      {expandedAgencies.has(agency.agencyId) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <UserCheck className="w-5 h-5 text-amber-400" />
                      <div>
                        <span className="font-medium">{agency.agencyDisplayName || agency.agencyName}</span>
                        <span className="text-xs text-muted-foreground ml-2">({agency.agencyName})</span>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {agency.users.length}명
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {agency.totalDays}일
                        {(agency.freeTestDays || 0) > 0 && (
                          <span className="text-xs ml-1">(+{agency.freeTestDays} 무료)</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {expandedAgencies.has(agency.agencyId) && (
                    <div className="ml-6 mt-2 rounded-lg border border-border/30 bg-background/50 p-4 animate-fade-in">
                      {agency.users.length > 0 ? (
                        <div className="space-y-2">
                          {agency.users.map((user) => (
                            <UserRow key={user.userId} user={user} showDetails />
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          해당 기간에 이용 내역이 없습니다.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// 대행사 정산 뷰 컴포넌트
function AgencySettlementView({
  data,
  periodStart,
  periodEnd,
  setPeriodStart,
  setPeriodEnd,
  onRefresh,
  isLoading,
}: {
  data: AgencySettlementData
  periodStart: Date
  periodEnd: Date
  setPeriodStart: (date: Date) => void
  setPeriodEnd: (date: Date) => void
  onRefresh: () => void
  isLoading: boolean
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">📋 내 회원 이용 현황</h1>
        <p className="text-muted-foreground">
          내 소속 유저들의 서비스 이용 현황을 확인합니다.
        </p>
      </div>

      {/* Period Selector */}
      <PeriodSelector
        periodStart={periodStart}
        periodEnd={periodEnd}
        setPeriodStart={setPeriodStart}
        setPeriodEnd={setPeriodEnd}
        onRefresh={onRefresh}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="총 회원 수"
          value={`${data.summary.totalUsers}명`}
          icon={Users}
          iconColor="text-blue-400"
          description="등록된 전체 회원"
        />
        <StatCard
          title="활성 회원"
          value={`${data.summary.activeUsers}명`}
          icon={UserCheck}
          iconColor="text-emerald-400"
          description="이번 주 서비스 이용"
        />
        <StatCard
          title="총 이용일수"
          value={`${data.summary.totalDays}일`}
          icon={Calendar}
          iconColor="text-purple-400"
          description="유료 서비스 이용"
        />
        <StatCard
          title="무료 테스트"
          value={`${data.summary.totalFreeTestDays}일`}
          icon={Gift}
          iconColor="text-amber-400"
          description="무료 체험 이용"
        />
      </div>

      {/* Parent Distributor Info */}
      {data.agency.parentDistributor && (
        <Card className="border-purple-500/30 bg-purple-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-full">
                <Building2 className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">소속 총판</p>
                <p className="font-medium">{data.agency.parentDistributor.name}</p>
                <p className="text-xs text-muted-foreground">
                  단가: {formatCurrency(data.agency.parentDistributor.dailyRate)}/일
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm text-muted-foreground">예상 정산 기여액</p>
                <p className="text-xl font-bold text-purple-400">
                  {formatCurrency(data.summary.estimatedAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-lg">회원별 이용 현황</CardTitle>
            </div>
            <Badge variant="outline">
              {formatDate(periodStart)} ~ {formatDate(periodEnd)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">로딩 중...</div>
          ) : data.users.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              등록된 회원이 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="py-3 text-left font-medium text-muted-foreground">회원</th>
                    <th className="py-3 text-center font-medium text-muted-foreground">서비스</th>
                    <th className="py-3 text-right font-medium text-muted-foreground">유료 이용</th>
                    <th className="py-3 text-right font-medium text-muted-foreground">무료 테스트</th>
                    <th className="py-3 text-right font-medium text-muted-foreground">총 이용일</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((user) => (
                    <tr key={user.userId} className="border-b border-border/30 hover:bg-muted/30">
                      <td className="py-3">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.loginId}</p>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          {user.services.map((s, i) => (
                            <Badge
                              key={i}
                              variant={s.isFreeTest ? "info" : "secondary"}
                              className="text-xs"
                            >
                              {SERVICE_LABELS[s.serviceType as keyof typeof SERVICE_LABELS] || s.serviceType}
                            </Badge>
                          ))}
                          {user.services.length === 0 && (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        {user.paidDays > 0 ? (
                          <span className="font-medium text-emerald-400">{user.paidDays}일</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {user.freeDays > 0 ? (
                          <span className="text-amber-400">{user.freeDays}일</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 text-right font-bold">
                        {user.paidDays + user.freeDays > 0 ? (
                          `${user.paidDays + user.freeDays}일`
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-muted/30">
                    <td className="py-3">합계</td>
                    <td className="py-3 text-center">-</td>
                    <td className="py-3 text-right text-emerald-400">{data.summary.totalDays}일</td>
                    <td className="py-3 text-right text-amber-400">{data.summary.totalFreeTestDays}일</td>
                    <td className="py-3 text-right">{data.summary.totalDays + data.summary.totalFreeTestDays}일</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// 기간 선택 컴포넌트
function PeriodSelector({
  periodStart,
  periodEnd,
  setPeriodStart,
  setPeriodEnd,
  onRefresh,
}: {
  periodStart: Date
  periodEnd: Date
  setPeriodStart: (date: Date) => void
  setPeriodEnd: (date: Date) => void
  onRefresh: () => void
}) {
  const setThisWeek = () => {
    const now = new Date()
    const day = now.getDay()
    const start = new Date(now)
    start.setDate(now.getDate() - day)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    setPeriodStart(start)
    setPeriodEnd(end)
  }

  const setLastWeek = () => {
    const now = new Date()
    const day = now.getDay()
    const start = new Date(now)
    start.setDate(now.getDate() - day - 7)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    setPeriodStart(start)
    setPeriodEnd(end)
  }

  const setThisMonth = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    setPeriodStart(start)
    setPeriodEnd(end)
  }

  return (
    <Card className="border-border/50 bg-card/80">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground whitespace-nowrap">기간:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[130px] justify-start text-sm">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatDate(periodStart)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={periodStart}
                  onSelect={(date) => date && setPeriodStart(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <span className="text-muted-foreground">~</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[130px] justify-start text-sm">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatDate(periodEnd)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={periodEnd}
                  onSelect={(date) => date && setPeriodEnd(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="ghost" size="sm" onClick={setThisWeek}>이번 주</Button>
            <Button variant="ghost" size="sm" onClick={setLastWeek}>지난 주</Button>
            <Button variant="ghost" size="sm" onClick={setThisMonth}>이번 달</Button>
          </div>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-2">
            <Button onClick={onRefresh}>조회</Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 통계 카드 컴포넌트
function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  description,
}: {
  title: string
  value: string
  icon: React.ElementType
  iconColor: string
  description?: string
}) {
  return (
    <Card className="border-border/50 bg-card/80">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className={cn("p-2 rounded-lg bg-muted/50", iconColor)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 유저 행 컴포넌트
function UserRow({ user, showDetails = false }: { user: UserDetail; showDetails?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
          {user.name.charAt(0)}
        </div>
        <div>
          <span className="font-medium text-sm">{user.name}</span>
          <span className="text-xs text-muted-foreground ml-2">({user.loginId})</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {user.services.map((s, i) => (
          <Badge
            key={i}
            variant={s.isFreeTest ? "info" : "secondary"}
            className="text-xs"
          >
            {SERVICE_LABELS[s.serviceType as keyof typeof SERVICE_LABELS] || s.serviceType} {s.days}일
          </Badge>
        ))}
        {showDetails && user.paidDays > 0 && (
          <span className="text-sm font-medium text-emerald-400 ml-2">
            유료 {user.paidDays}일
          </span>
        )}
      </div>
    </div>
  )
}
