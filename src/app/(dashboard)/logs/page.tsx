"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Download, ChevronDown, ChevronRight, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { formatDate, formatCurrency } from "@/lib/utils"
import { SERVICE_LABELS } from "@/lib/constants"

interface SettlementData {
  distributorId: string
  distributorName: string
  dailyRate: number
  totalDays: number
  freeTestDays: number
  totalAmount: number
  details: {
    agencies: {
      agencyId: string
      agencyName: string
      totalDays: number
      users: UserDetail[]
    }[]
    directUsers: UserDetail[]
  }
}

interface UserDetail {
  userId: string
  loginId: string
  name: string
  paidDays: number
  freeDays: number
  services: { serviceType: string; days: number; isFreeTest: boolean }[]
}

export default function LogsPage() {
  const { data: session } = useSession()
  const [settlements, setSettlements] = useState<SettlementData[]>([])
  const [summary, setSummary] = useState({ totalAmount: 0, totalDays: 0, totalFreeTestDays: 0 })
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
  const [expandedDistributors, setExpandedDistributors] = useState<Set<string>>(new Set())
  const [expandedAgencies, setExpandedAgencies] = useState<Set<string>>(new Set())

  const isMaster = session?.user?.role === "MASTER"

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
      setSettlements(data.settlements)
      setSummary(data.summary)
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">📋 정산 로그</h1>
        <p className="text-muted-foreground">
          기간별 이용일수 및 정산 내역을 확인합니다.
        </p>
      </div>

      {/* Filters */}
      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">기간:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[140px] justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate(periodStart)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    selected={periodStart}
                    onSelect={(date) => date && setPeriodStart(date)}
                  />
                </PopoverContent>
              </Popover>
              <span>~</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[140px] justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate(periodEnd)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    selected={periodEnd}
                    onSelect={(date) => date && setPeriodEnd(date)}
                  />
                </PopoverContent>
              </Popover>
              <Button onClick={fetchSettlements}>조회</Button>
            </div>
            <div className="flex-1" />
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              CSV 내보내기
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {isMaster && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              💰 이번 주 정산 요약 ({formatDate(periodStart)} ~ {formatDate(periodEnd)})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium">총판</th>
                    <th className="py-2 text-right font-medium">이용일수</th>
                    <th className="py-2 text-right font-medium">단가</th>
                    <th className="py-2 text-right font-medium">정산금액</th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.map((settlement) => (
                    <tr key={settlement.distributorId} className="border-b">
                      <td className="py-2">{settlement.distributorName}</td>
                      <td className="py-2 text-right">{settlement.totalDays}일</td>
                      <td className="py-2 text-right">{formatCurrency(settlement.dailyRate)}</td>
                      <td className="py-2 text-right font-medium">
                        {formatCurrency(settlement.totalAmount)}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td className="py-2">합계</td>
                    <td className="py-2 text-right">{summary.totalDays}일</td>
                    <td className="py-2 text-right">-</td>
                    <td className="py-2 text-right">{formatCurrency(summary.totalAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {summary.totalFreeTestDays > 0 && (
              <p className="mt-4 text-sm text-muted-foreground">
                * 무료 테스트: {summary.totalFreeTestDays}일 (정산 제외)
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detailed Breakdown */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">📊 총판별 상세 내역</CardTitle>
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
                    className="flex cursor-pointer items-center justify-between rounded-lg border bg-muted/50 px-4 py-3 hover:bg-muted"
                    onClick={() => toggleDistributor(settlement.distributorId)}
                  >
                    <div className="flex items-center gap-2">
                      {expandedDistributors.has(settlement.distributorId) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span className="font-medium">{settlement.distributorName}</span>
                      <Badge variant="secondary">
                        단가: {formatCurrency(settlement.dailyRate)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {settlement.totalDays}일
                      </span>
                      <span className="font-medium">
                        {formatCurrency(settlement.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedDistributors.has(settlement.distributorId) && (
                    <div className="ml-6 mt-2 space-y-2">
                      {/* Direct Users */}
                      {settlement.details.directUsers.length > 0 && (
                        <div className="rounded-lg border bg-background/50 p-3">
                          <p className="mb-2 text-sm font-medium text-muted-foreground">
                            직접 생성 유저 ({settlement.details.directUsers.reduce((acc, u) => acc + u.paidDays, 0)}일)
                          </p>
                          {settlement.details.directUsers.map((user) => (
                            <div
                              key={user.userId}
                              className="flex items-center justify-between py-1 text-sm"
                            >
                              <span>{user.loginId}</span>
                              <div className="flex gap-2">
                                {user.services.map((s, i) => (
                                  <Badge
                                    key={i}
                                    variant={s.isFreeTest ? "info" : "secondary"}
                                  >
                                    {SERVICE_LABELS[s.serviceType]} {s.days}일
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Agencies */}
                      {settlement.details.agencies.map((agency) => (
                        <div key={agency.agencyId}>
                          <div
                            className="flex cursor-pointer items-center justify-between rounded-lg border bg-background/50 px-4 py-2 hover:bg-muted/50"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleAgency(agency.agencyId)
                            }}
                          >
                            <div className="flex items-center gap-2">
                              {expandedAgencies.has(agency.agencyId) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <span className="text-sm font-medium">
                                {agency.agencyName} (대행사)
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {agency.totalDays}일
                            </span>
                          </div>

                          {expandedAgencies.has(agency.agencyId) && (
                            <div className="ml-6 mt-2 rounded-lg border bg-background/50 p-3">
                              {agency.users.map((user) => (
                                <div
                                  key={user.userId}
                                  className="flex items-center justify-between py-1 text-sm"
                                >
                                  <span>{user.loginId}</span>
                                  <div className="flex gap-2">
                                    {user.services.map((s, i) => (
                                      <Badge
                                        key={i}
                                        variant={s.isFreeTest ? "info" : "secondary"}
                                      >
                                        {SERVICE_LABELS[s.serviceType]} {s.days}일
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
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

