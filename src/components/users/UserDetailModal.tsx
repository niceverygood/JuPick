"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2, Key, UserX, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleBadge } from "./RoleBadge"
import { SubscriptionModal } from "./SubscriptionModal"
import { SERVICE_LABELS, SERVICE_ICONS } from "@/lib/constants"
import { formatDate, formatCurrency, getDaysRemaining, getSubscriptionStatus } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { UserWithRelations, SubscriptionWithUser } from "@/types"

interface UserDetailModalProps {
  userId: string | null
  open: boolean
  onClose: () => void
}

export function UserDetailModal({ userId, open, onClose }: UserDetailModalProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  
  const [user, setUser] = useState<UserWithRelations | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [subscriptionModal, setSubscriptionModal] = useState<{
    open: boolean
    type: "create" | "extend"
    serviceType?: string
    subscriptionId?: string
    currentEndDate?: Date
  }>({ open: false, type: "create" })

  const [editData, setEditData] = useState({
    name: "",
    dailyRate: 0,
    memo: "",
  })

  const userRole = session?.user?.role

  useEffect(() => {
    if (userId && open) {
      fetchUser()
    }
  }, [userId, open])

  const fetchUser = async () => {
    if (!userId) return
    
    setIsLoading(true)
    try {
      const res = await fetch(`/api/users/${userId}`)
      if (!res.ok) throw new Error("Failed to fetch user")
      const data = await res.json()
      setUser(data)
      setEditData({
        name: data.name || "",
        dailyRate: data.dailyRate || 0,
        memo: data.memo || "",
      })
    } catch {
      toast({ title: "오류", description: "사용자 정보를 불러올 수 없습니다.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!userId) return
    
    setIsSaving(true)
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      })
      
      if (!res.ok) throw new Error("Failed to update user")
      
      toast({ title: "성공", description: "사용자 정보가 수정되었습니다.", variant: "success" })
      router.refresh()
      fetchUser()
    } catch {
      toast({ title: "오류", description: "사용자 정보 수정에 실패했습니다.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetPassword = async () => {
    if (!userId || !confirm("비밀번호를 초기화하시겠습니까?")) return
    
    try {
      const res = await fetch(`/api/users/${userId}/reset-password`, {
        method: "POST",
      })
      
      if (!res.ok) throw new Error("Failed to reset password")
      
      const { tempPassword } = await res.json()
      toast({
        title: "비밀번호 초기화 완료",
        description: `임시 비밀번호: ${tempPassword}`,
      })
    } catch {
      toast({ title: "오류", description: "비밀번호 초기화에 실패했습니다.", variant: "destructive" })
    }
  }

  const handleDeactivate = async () => {
    if (!userId || !user) return
    if (!confirm(`${user.isActive ? "비활성화" : "활성화"}하시겠습니까?`)) return
    
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      })
      
      if (!res.ok) throw new Error("Failed to update user")
      
      toast({
        title: "성공",
        description: `계정이 ${user.isActive ? "비활성화" : "활성화"}되었습니다.`,
        variant: "success",
      })
      router.refresh()
      fetchUser()
    } catch {
      toast({ title: "오류", description: "상태 변경에 실패했습니다.", variant: "destructive" })
    }
  }

  const handleDelete = async () => {
    if (!userId || !confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return
    
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete user")
      }
      
      toast({ title: "성공", description: "계정이 삭제되었습니다.", variant: "success" })
      router.refresh()
      onClose()
    } catch (error) {
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "계정 삭제에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (subscription: SubscriptionWithUser) => {
    if (subscription.isFreeTest) {
      return <Badge variant="info">FREE</Badge>
    }
    
    const status = getSubscriptionStatus(subscription.endDate)
    const days = getDaysRemaining(subscription.endDate)
    
    if (status === "expired") {
      return <Badge variant="destructive">만료</Badge>
    } else if (status === "expiring") {
      return <Badge variant="warning">{days}일 남음</Badge>
    } else {
      return <Badge variant="success">{days}일 남음</Badge>
    }
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!user) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              👤 사용자 상세 - {user.loginId}
              <RoleBadge role={user.role} />
              {!user.isActive && <Badge variant="destructive">비활성</Badge>}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">기본 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">아이디</Label>
                    <p className="font-medium">{user.loginId}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs text-muted-foreground">이름</Label>
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">상위 계정</Label>
                    <p className="font-medium">{user.parent?.loginId || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">생성일</Label>
                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">최근 접속</Label>
                    <p className="font-medium">
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : "없음"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memo" className="text-xs text-muted-foreground">메모</Label>
                    <Input
                      id="memo"
                      value={editData.memo}
                      onChange={(e) => setEditData((prev) => ({ ...prev, memo: e.target.value }))}
                      placeholder="메모를 입력하세요"
                    />
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetPassword}
                    >
                      <Key className="mr-2 h-4 w-4" />
                      비밀번호 초기화
                    </Button>
                    <Button
                      variant={user.isActive ? "outline" : "default"}
                      size="sm"
                      onClick={handleDeactivate}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      {user.isActive ? "계정 비활성화" : "계정 활성화"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Rate - Only for distributors */}
              {user.role === "DISTRIBUTOR" && userRole === "MASTER" && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">💰 정산 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="dailyRate" className="text-xs text-muted-foreground">
                        1일 단가
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="dailyRate"
                          type="number"
                          value={editData.dailyRate}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              dailyRate: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="w-32"
                        />
                        <span className="text-muted-foreground">원</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      현재 단가: {formatCurrency(user.dailyRate)}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Subscriptions */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">구독 관리</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(SERVICE_LABELS).map(([serviceType, label]) => {
                    const subscription = user.subscriptions?.find(
                      (s) => s.serviceType === serviceType && s.status === "ACTIVE"
                    )

                    return (
                      <div
                        key={serviceType}
                        className="rounded-lg border p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{SERVICE_ICONS[serviceType]}</span>
                            <span className="font-medium">{label}</span>
                          </div>
                          {subscription ? (
                            getStatusBadge(subscription)
                          ) : (
                            <Badge variant="outline" className="opacity-50">
                              미사용
                            </Badge>
                          )}
                        </div>

                        {subscription ? (
                          <>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(subscription.startDate)} ~ {formatDate(subscription.endDate)}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setSubscriptionModal({
                                    open: true,
                                    type: "extend",
                                    serviceType,
                                    subscriptionId: subscription.id,
                                    currentEndDate: subscription.endDate,
                                  })
                                }
                              >
                                연장
                              </Button>
                            </div>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setSubscriptionModal({
                                open: true,
                                type: "create",
                                serviceType,
                              })
                            }
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            구독 추가
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="destructive" onClick={handleDelete}>
              삭제
            </Button>
            <div className="flex-1" />
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                "저장"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription Modal */}
      <SubscriptionModal
        open={subscriptionModal.open}
        onClose={() => {
          setSubscriptionModal({ open: false, type: "create" })
          fetchUser()
        }}
        type={subscriptionModal.type}
        userId={user.id}
        serviceType={subscriptionModal.serviceType}
        subscriptionId={subscriptionModal.subscriptionId}
        currentEndDate={subscriptionModal.currentEndDate}
      />
    </>
  )
}

