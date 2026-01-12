"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RoleBadge } from "@/components/users/RoleBadge"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { UserRole } from "@/types"

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const { toast } = useToast()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const user = session?.user

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({ title: "오류", description: "새 비밀번호를 입력해주세요.", variant: "destructive" })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({ title: "오류", description: "새 비밀번호가 일치하지 않습니다.", variant: "destructive" })
      return
    }

    if (newPassword.length < 4) {
      toast({ title: "오류", description: "비밀번호는 최소 4자 이상이어야 합니다.", variant: "destructive" })
      return
    }

    setIsChangingPassword(true)
    try {
      const res = await fetch(`/api/users/${user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      })

      if (!res.ok) throw new Error("Failed to change password")

      toast({ title: "성공", description: "비밀번호가 변경되었습니다.", variant: "success" })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      toast({ title: "오류", description: "비밀번호 변경에 실패했습니다.", variant: "destructive" })
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">⚙️ 설정</h1>
        <p className="text-muted-foreground">
          계정 설정 및 보안 옵션을 관리합니다.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile */}
        <Card className="border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle>프로필 정보</CardTitle>
            <CardDescription>
              현재 로그인된 계정 정보입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <h3 className="text-lg font-medium">{user?.name || "사용자"}</h3>
                <p className="text-sm text-muted-foreground">{user?.loginId}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">역할</span>
                <RoleBadge role={user?.role as UserRole || "USER"} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">아이디</span>
                <span className="font-medium">{user?.loginId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">이름</span>
                <span className="font-medium">{user?.name || "-"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card className="border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle>비밀번호 변경</CardTitle>
            <CardDescription>
              보안을 위해 주기적으로 비밀번호를 변경해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">새 비밀번호</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호를 입력하세요"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPasswords(!showPasswords)}
                >
                  {showPasswords ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호를 다시 입력하세요"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="w-full"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  변경 중...
                </>
              ) : (
                "비밀번호 변경"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Info */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle>시스템 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">버전</p>
              <p className="font-medium">JUPICK v1.0.0</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">환경</p>
              <p className="font-medium">Production</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">마지막 업데이트</p>
              <p className="font-medium">{formatDate(new Date())}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


