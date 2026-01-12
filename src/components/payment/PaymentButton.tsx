// src/components/payment/PaymentButton.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, CreditCard, CheckCircle, User } from 'lucide-react'
import { toast } from 'sonner'
import { generatePaymentId, SUBSCRIPTION_PLANS, type PlanId } from '@/lib/portone'

interface PaymentButtonProps {
  planId: PlanId
  userId: string
  userName?: string
  userEmail?: string
  userPhone?: string
  onSuccess?: (paymentId: string) => void
  onError?: (error: string) => void
  className?: string
  disabled?: boolean
}

export function PaymentButton({
  planId,
  userId,
  userName,
  userEmail,
  userPhone,
  onSuccess,
  onError,
  className,
  disabled,
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: userName || '',
    email: userEmail || '',
    phone: userPhone || '',
  })
  const plan = SUBSCRIPTION_PLANS[planId]

  const isValidEmail = (email: string) => {
    return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const isValidPhone = (phone: string) => {
    const cleaned = phone.replace(/[^0-9]/g, '')
    return cleaned.length >= 10 && cleaned.length <= 11
  }

  const isFormValid = () => {
    return formData.name.trim() && isValidEmail(formData.email) && isValidPhone(formData.phone)
  }

  // props로 받은 정보가 모두 유효한지 확인
  const hasAllRequiredInfo = () => {
    return userName?.trim() && isValidEmail(userEmail || '') && isValidPhone(userPhone || '')
  }

  const handlePaymentClick = () => {
    // 필수 정보가 모두 있으면 바로 결제 진행
    if (hasAllRequiredInfo()) {
      processPayment(userName!, userEmail!, userPhone!)
      return
    }
    
    // 필수 정보가 없으면 다이얼로그 표시
    setShowDialog(true)
  }

  const handleFormSubmit = () => {
    if (!isFormValid()) {
      if (!formData.name.trim()) {
        toast.error('이름을 입력해주세요.')
      } else if (!isValidEmail(formData.email)) {
        toast.error('올바른 이메일 주소를 입력해주세요.')
      } else if (!isValidPhone(formData.phone)) {
        toast.error('올바른 전화번호를 입력해주세요.')
      }
      return
    }
    setShowDialog(false)
    processPayment(formData.name, formData.email, formData.phone)
  }

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/[^0-9]/g, '')
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
    } else if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const processPayment = async (name: string, email: string, phone: string) => {
    setIsLoading(true)

    try {
      const PortOne = await import('@portone/browser-sdk/v2')

      const paymentId = generatePaymentId('jupick')
      const formattedPhone = formatPhoneNumber(phone)

      const paymentParams = {
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
        paymentId,
        orderName: `JUPICK ${plan.name} 구독 1개월`,
        totalAmount: plan.price,
        currency: 'CURRENCY_KRW' as const,
        payMethod: 'CARD' as const,
        customer: {
          customerId: userId,
          fullName: name,
          email: email,
          phoneNumber: formattedPhone,
        },
        customData: JSON.stringify({
          userId,
          planId: plan.id,
        }),
        redirectUrl: `${window.location.origin}/payment/complete?paymentId=${paymentId}&planId=${plan.id}`,
      }

      console.log('Payment params:', paymentParams)

      const response = await PortOne.requestPayment(paymentParams)

      console.log('Payment response:', response)

      if (response?.code) {
        const errorMessage = response.message || '결제가 취소되었습니다.'
        toast.error(errorMessage)
        onError?.(errorMessage)
        return
      }

      const verifyResponse = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          planId: plan.id,
        }),
      })

      const verifyResult = await verifyResponse.json()

      if (!verifyResponse.ok) {
        throw new Error(verifyResult.error || '결제 검증에 실패했습니다.')
      }

      toast.success('구독이 활성화되었습니다! 🎉')
      onSuccess?.(paymentId)

      window.location.reload()
    } catch (error) {
      console.error('Payment error:', error)
      const message = error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.'
      toast.error(message)
      onError?.(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={handlePaymentClick}
        disabled={disabled || isLoading}
        className={className}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            결제 처리 중...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            {plan.price.toLocaleString()}원/월 결제하기
          </>
        )}
      </Button>

      {/* 구매자 정보 입력 다이얼로그 (정보가 없을 때만 표시) */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px] bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              구매자 정보 입력
            </DialogTitle>
            <DialogDescription>
              결제를 위해 아래 정보가 필요합니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                이름 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="홍길동"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                이메일 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                휴대폰 번호 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="010-1234-5678"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFormSubmit()
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              취소
            </Button>
            <Button 
              onClick={handleFormSubmit}
              disabled={!isFormValid()}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              결제 진행
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function PaymentSuccess({ planName }: { planName: string }) {
  return (
    <div className="flex items-center gap-2 text-emerald-500">
      <CheckCircle className="h-5 w-5" />
      <span>{planName} 구독 중</span>
    </div>
  )
}
