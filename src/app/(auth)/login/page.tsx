"use client"

import { useState, Suspense, useRef } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  
  const loginIdRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Read values directly from DOM refs
    const loginId = loginIdRef.current?.value || ""
    const password = passwordRef.current?.value || ""

    if (!loginId || !password) {
      setError("아이디와 비밀번호를 모두 입력해주세요.")
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn("credentials", {
        loginId,
        password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.")
      } else if (result?.ok) {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError("로그인 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary animate-pulse-glow">
          <span className="text-2xl font-bold text-primary-foreground">J</span>
        </div>
        <CardTitle className="text-2xl font-bold gradient-text">JUPICK</CardTitle>
        <CardDescription className="text-muted-foreground">
          AI 종목추천 관리 플랫폼에 로그인하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loginId">아이디</Label>
            <Input
              id="loginId"
              name="loginId"
              ref={loginIdRef}
              type="text"
              placeholder="아이디를 입력하세요"
              disabled={isLoading}
              required
              className="bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호를 입력하세요"
                disabled={isLoading}
                required
                className="bg-background/50 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                로그인 중...
              </>
            ) : (
              "로그인"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-md px-4 animate-fade-in">
      <Suspense fallback={
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      }>
        <LoginForm />
      </Suspense>
      
      <p className="mt-6 text-center text-sm text-muted-foreground">
        계정이 없으신가요? 관리자에게 문의하세요.
      </p>
    </div>
  )
}
