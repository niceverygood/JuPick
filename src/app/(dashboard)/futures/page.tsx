"use client"

import { useState, useEffect } from "react"
import { Search, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate, getDaysRemaining, getSubscriptionStatus } from "@/lib/utils"

interface SubscriptionData {
  id: string
  userId: string
  user: {
    id: string
    loginId: string
    name: string
    role: string
    parent?: {
      id: string
      loginId: string
      name: string
    }
  }
  startDate: string
  endDate: string
  status: string
  isFreeTest: boolean
}

export default function FuturesPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([])
  const [stats, setStats] = useState({ active: 0, expiring: 0, expired: 0 })
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  useEffect(() => {
    fetchData()
  }, [page, statusFilter])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", page.toString())
      params.set("limit", "20")
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter)
      if (search) params.set("search", search)

      const res = await fetch(`/api/services/futures?${params}`)
      const data = await res.json()
      setSubscriptions(data.subscriptions)
      setTotal(data.total)
      setStats(data.stats)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchData()
  }

  const getStatusBadge = (sub: SubscriptionData) => {
    if (sub.isFreeTest) {
      return <Badge variant="info">🟣 FREE</Badge>
    }
    const status = getSubscriptionStatus(sub.endDate)
    if (status === "expired") {
      return <Badge variant="destructive">🔴 만료</Badge>
    } else if (status === "expiring") {
      return <Badge variant="warning">🟡 만료예정</Badge>
    } else {
      return <Badge variant="success">🟢 활성</Badge>
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">📊 코인선물 관리</h1>
        <p className="text-muted-foreground">
          코인 선물 자동매매 서비스 구독 현황을 관리합니다.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          className={`border-border/50 cursor-pointer transition-colors ${
            statusFilter === "active" ? "ring-2 ring-emerald-500" : ""
          }`}
          onClick={() => setStatusFilter(statusFilter === "active" ? "" : "active")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <span className="text-xl">🟢</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">활성</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`border-border/50 cursor-pointer transition-colors ${
            statusFilter === "expiring" ? "ring-2 ring-amber-500" : ""
          }`}
          onClick={() => setStatusFilter(statusFilter === "expiring" ? "" : "expiring")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <span className="text-xl">🟡</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">만료예정</p>
                <p className="text-2xl font-bold">{stats.expiring}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`border-border/50 cursor-pointer transition-colors ${
            statusFilter === "expired" ? "ring-2 ring-red-500" : ""
          }`}
          onClick={() => setStatusFilter(statusFilter === "expired" ? "" : "expired")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <span className="text-xl">🔴</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">만료</p>
                <p className="text-2xl font-bold">{stats.expired}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="아이디로 검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="expiring">만료예정</SelectItem>
                  <SelectItem value="expired">만료</SelectItem>
                  <SelectItem value="freeTest">무료테스트</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>검색</Button>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              내보내기
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>상태</TableHead>
                <TableHead>아이디</TableHead>
                <TableHead>상위</TableHead>
                <TableHead>시작일</TableHead>
                <TableHead>종료일</TableHead>
                <TableHead>남은일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    로딩 중...
                  </TableCell>
                </TableRow>
              ) : subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    구독이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((sub) => {
                  const daysRemaining = getDaysRemaining(sub.endDate)
                  return (
                    <TableRow key={sub.id}>
                      <TableCell>{getStatusBadge(sub)}</TableCell>
                      <TableCell>
                        <span className="font-medium">{sub.user.loginId}</span>
                        {sub.user.name && (
                          <p className="text-xs text-muted-foreground">
                            {sub.user.name}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>{sub.user.parent?.loginId || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(sub.startDate)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(sub.endDate)}
                      </TableCell>
                      <TableCell>
                        {sub.isFreeTest ? (
                          <span className="text-violet-500">FREE</span>
                        ) : daysRemaining <= 0 ? (
                          <span className="text-destructive">만료</span>
                        ) : (
                          <span>{daysRemaining}일</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-center gap-2 border-t p-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                이전
              </Button>
              <span className="text-sm text-muted-foreground">
                페이지 {page} / {Math.ceil(total / 20)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / 20)}
              >
                다음
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

