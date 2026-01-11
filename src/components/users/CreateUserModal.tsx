"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2, Check, X } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { ROLE_LABELS, CREATABLE_ROLES, SERVICE_TYPES, SERVICE_LABELS, QUICK_SELECT_DAYS } from "@/lib/constants"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface CreateUserModalProps {
  open: boolean
  onClose: () => void
}

export function CreateUserModal({ open, onClose }: CreateUserModalProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingId, setIsCheckingId] = useState(false)
  const [loginIdAvailable, setLoginIdAvailable] = useState<boolean | null>(null)
  
  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
    confirmPassword: "",
    name: "",
    role: "USER" as string,
    dailyRate: 100000,
    memo: "",
    subscriptions: {
      STOCK: { enabled: false, days: 30 },
      COIN: { enabled: false, days: 30 },
      COIN_FUTURES: { enabled: false, days: 30 },
    },
  })

  const userRole = session?.user?.role || "USER"
  const creatableRoles = CREATABLE_ROLES[userRole] || []

  const handleCheckLoginId = async () => {
    if (!formData.loginId) return
    
    setIsCheckingId(true)
    try {
      const res = await fetch(`/api/users/check-login-id?loginId=${formData.loginId}`)
      const data = await res.json()
      setLoginIdAvailable(data.available)
    } catch {
      toast({ title: "오류", description: "아이디 확인 중 오류가 발생했습니다.", variant: "destructive" })
    } finally {
      setIsCheckingId(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "오류", description: "비밀번호가 일치하지 않습니다.", variant: "destructive" })
      return
    }

    if (!loginIdAvailable) {
      toast({ title: "오류", description: "아이디 중복 확인을 해주세요.", variant: "destructive" })
      return
    }

    setIsLoading(true)

    try {
      const subscriptions = Object.entries(formData.subscriptions)
        .filter(([_, value]) => value.enabled)
        .map(([serviceType, value]) => {
          const startDate = new Date()
          const endDate = new Date()
          endDate.setDate(endDate.getDate() + value.days - 1)
          return {
            serviceType,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          }
        })

      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginId: formData.loginId,
          password: formData.password,
          name: formData.name,
          role: formData.role,
          dailyRate: formData.role === "DISTRIBUTOR" ? formData.dailyRate : undefined,
          memo: formData.memo || undefined,
          subscriptions,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "계정 생성에 실패했습니다.")
      }

      toast({ title: "성공", description: "계정이 생성되었습니다.", variant: "success" })
      router.refresh()
      onClose()
    } catch (error) {
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "계정 생성에 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      loginId: "",
      password: "",
      confirmPassword: "",
      name: "",
      role: "USER",
      dailyRate: 100000,
      memo: "",
      subscriptions: {
        STOCK: { enabled: false, days: 30 },
        COIN: { enabled: false, days: 30 },
        COIN_FUTURES: { enabled: false, days: 30 },
      },
    })
    setLoginIdAvailable(null)
  }

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) { resetForm(); onClose(); } }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>➕ 새 계정 생성</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label>계정 유형</Label>
            <div className="grid grid-cols-3 gap-2">
              {creatableRoles.map((role) => (
                <Button
                  key={role}
                  type="button"
                  variant={formData.role === role ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setFormData((prev) => ({ ...prev, role }))}
                >
                  {role === "DISTRIBUTOR" && "🏢 "}
                  {role === "AGENCY" && "🏪 "}
                  {role === "USER" && "👤 "}
                  {ROLE_LABELS[role]}
                </Button>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loginId">아이디 *</Label>
              <div className="flex gap-2">
                <Input
                  id="loginId"
                  value={formData.loginId}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, loginId: e.target.value }))
                    setLoginIdAvailable(null)
                  }}
                  placeholder="아이디를 입력하세요"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCheckLoginId}
                  disabled={isCheckingId || !formData.loginId}
                >
                  {isCheckingId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "중복확인"
                  )}
                </Button>
              </div>
              {loginIdAvailable !== null && (
                <p className={cn("text-sm", loginIdAvailable ? "text-emerald-500" : "text-destructive")}>
                  {loginIdAvailable ? (
                    <><Check className="inline h-4 w-4 mr-1" />사용 가능한 아이디입니다.</>
                  ) : (
                    <><X className="inline h-4 w-4 mr-1" />이미 사용 중인 아이디입니다.</>
                  )}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호 *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">이름/닉네임</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="이름 또는 닉네임을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="memo">메모</Label>
              <Input
                id="memo"
                value={formData.memo}
                onChange={(e) => setFormData((prev) => ({ ...prev, memo: e.target.value }))}
                placeholder="메모를 입력하세요"
              />
            </div>
          </div>

          {/* Initial Subscription - Only for USER role */}
          {formData.role === "USER" && (
            <div className="space-y-4">
              <Label>초기 구독 설정 (선택)</Label>
              <div className="space-y-3">
                {Object.entries(SERVICE_TYPES).map(([key, serviceType]) => (
                  <div key={serviceType} className="flex items-center gap-4 rounded-lg border p-3">
                    <Checkbox
                      id={`sub-${serviceType}`}
                      checked={formData.subscriptions[serviceType as keyof typeof formData.subscriptions].enabled}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          subscriptions: {
                            ...prev.subscriptions,
                            [serviceType]: {
                              ...prev.subscriptions[serviceType as keyof typeof prev.subscriptions],
                              enabled: checked as boolean,
                            },
                          },
                        }))
                      }
                    />
                    <Label htmlFor={`sub-${serviceType}`} className="flex-1 cursor-pointer">
                      {SERVICE_LABELS[serviceType]}
                    </Label>
                    <div className="flex gap-1">
                      {QUICK_SELECT_DAYS.map((days) => (
                        <Button
                          key={days}
                          type="button"
                          size="sm"
                          variant={
                            formData.subscriptions[serviceType as keyof typeof formData.subscriptions].days === days
                              ? "default"
                              : "outline"
                          }
                          className="h-7 px-2 text-xs"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              subscriptions: {
                                ...prev.subscriptions,
                                [serviceType]: {
                                  ...prev.subscriptions[serviceType as keyof typeof prev.subscriptions],
                                  days,
                                },
                              },
                            }))
                          }
                          disabled={!formData.subscriptions[serviceType as keyof typeof formData.subscriptions].enabled}
                        >
                          {days}일
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Rate - Only for DISTRIBUTOR role */}
          {formData.role === "DISTRIBUTOR" && (
            <div className="space-y-2">
              <Label htmlFor="dailyRate">💰 1일 이용 단가</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="dailyRate"
                  type="number"
                  value={formData.dailyRate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dailyRate: parseInt(e.target.value) || 0 }))}
                  className="w-40"
                />
                <span className="text-muted-foreground">원</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { resetForm(); onClose(); }}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading || !loginIdAvailable}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                "생성"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

