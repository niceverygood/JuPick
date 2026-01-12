// src/app/(dashboard)/payment/complete/page.tsx
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, Home, ArrowRight } from 'lucide-react'
import Link from 'next/link'

function PaymentCompleteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  const paymentId = searchParams.get('paymentId')
  const planId = searchParams.get('planId')

  useEffect(() => {
    async function verifyPayment() {
      if (!paymentId || !planId) {
        setStatus('error')
        setMessage('결제 정보가 올바르지 않습니다.')
        return
      }

      try {
        const response = await fetch('/api/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, planId }),
        })

        const result = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(`${result.subscription.planName} 플랜 구독이 활성화되었습니다!`)
        } else {
          setStatus('error')
          setMessage(result.error || '결제 처리 중 오류가 발생했습니다.')
        }
      } catch (error) {
        setStatus('error')
        setMessage('결제 확인 중 오류가 발생했습니다.')
      }
    }

    verifyPayment()
  }, [paymentId, planId])

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="w-full max-w-md border-border/50 bg-card/80">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
              </div>
              <CardTitle>결제 확인 중...</CardTitle>
              <CardDescription>
                잠시만 기다려주세요. 결제 정보를 확인하고 있습니다.
              </CardDescription>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 animate-bounce">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
              <CardTitle className="text-emerald-400">결제 완료! 🎉</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
              <CardTitle className="text-red-400">결제 실패</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {status === 'success' && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
              <p className="text-sm text-emerald-400">
                지금 바로 프리미엄 기능을 이용해보세요!
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {status === 'success' && (
              <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                <Link href="/user-dashboard">
                  AI 추천 보러가기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                홈으로 돌아가기
              </Link>
            </Button>
            {status === 'error' && (
              <Button asChild variant="ghost" className="w-full">
                <Link href="/pricing">
                  다시 시도하기
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <PaymentCompleteContent />
    </Suspense>
  )
}


