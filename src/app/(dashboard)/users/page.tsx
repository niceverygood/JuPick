"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Search, Plus, ChevronRight, MoreHorizontal } from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RoleBadge } from "@/components/users/RoleBadge"
import { ServiceStatusBadge } from "@/components/users/ServiceStatusBadge"
import { CreateUserModal } from "@/components/users/CreateUserModal"
import { UserDetailModal } from "@/components/users/UserDetailModal"
import { ROLE_LABELS } from "@/lib/constants"
import { formatDate } from "@/lib/utils"
import type { UserWithRelations } from "@/types"

export default function UsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<UserWithRelations[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("")
  
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [detailModalUserId, setDetailModalUserId] = useState<string | null>(null)

  const userRole = session?.user?.role

  useEffect(() => {
    fetchUsers()
  }, [page, roleFilter])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", page.toString())
      params.set("limit", "20")
      if (roleFilter && roleFilter !== "all") params.set("role", roleFilter)
      if (search) params.set("search", search)

      const res = await fetch(`/api/users?${params}`)
      const data = await res.json()
      setUsers(data.users)
      setTotal(data.total)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchUsers()
  }

  const roleCounts = users.reduce(
    (acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">👥 사용자 관리</h1>
          <p className="text-muted-foreground">
            하위 계정을 관리하고 구독을 설정하세요.
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          새 계정 추가
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="아이디 또는 이름으로 검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="역할" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {userRole === "MASTER" && (
                    <SelectItem value="DISTRIBUTOR">총판</SelectItem>
                  )}
                  {(userRole === "MASTER" || userRole === "DISTRIBUTOR") && (
                    <SelectItem value="AGENCY">대행사</SelectItem>
                  )}
                  <SelectItem value="USER">유저</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>검색</Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex flex-wrap gap-2">
            {userRole === "MASTER" && (
              <Badge variant="distributor">
                총판 {roleCounts.DISTRIBUTOR || 0}
              </Badge>
            )}
            {(userRole === "MASTER" || userRole === "DISTRIBUTOR") && (
              <Badge variant="agency">
                대행사 {roleCounts.AGENCY || 0}
              </Badge>
            )}
            <Badge variant="user">
              유저 {roleCounts.USER || 0}
            </Badge>
            <Badge variant="secondary">
              비활성 {users.filter((u) => !u.isActive).length}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">아이디</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>상위</TableHead>
                <TableHead>구독 상태</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    로딩 중...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    사용자가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer"
                    onClick={() => setDetailModalUserId(user.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.loginId}</span>
                        {!user.isActive && (
                          <Badge variant="secondary" className="text-xs">
                            비활성
                          </Badge>
                        )}
                      </div>
                      {user.name && (
                        <p className="text-xs text-muted-foreground">
                          {user.name}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell>
                      {user.parent?.loginId || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {user.role === "USER" && user.subscriptions && (
                          <>
                            <ServiceStatusBadge
                              subscriptions={user.subscriptions as any}
                              serviceType="STOCK"
                            />
                            <ServiceStatusBadge
                              subscriptions={user.subscriptions as any}
                              serviceType="COIN"
                            />
                            <ServiceStatusBadge
                              subscriptions={user.subscriptions as any}
                              serviceType="COIN_FUTURES"
                            />
                          </>
                        )}
                        {user.role !== "USER" && (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              setDetailModalUserId(user.id)
                            }}
                          >
                            상세보기
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
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

      {/* Modals */}
      <CreateUserModal
        open={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false)
          fetchUsers()
        }}
      />
      <UserDetailModal
        userId={detailModalUserId}
        open={!!detailModalUserId}
        onClose={() => {
          setDetailModalUserId(null)
          fetchUsers()
        }}
      />
    </div>
  )
}

