// src/app/api/payment/webhook/route.ts
// 포트원 웹훅 처리 API

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { PORTONE_CONFIG, SUBSCRIPTION_PLANS } from '@/lib/portone'
import crypto from 'crypto'

// 포트원 V2 API URL
const PORTONE_API_URL = 'https://api.portone.io'

// 웹훅 시그니처 검증
function verifyWebhookSignature(
  body: string,
  timestamp: string,
  signature: string,
  secret: string
): boolean {
  const payload = `${timestamp}.${body}`
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  return signature === expectedSignature
}

// 결제 정보 조회
async function getPayment(paymentId: string) {
  const response = await fetch(`${PORTONE_API_URL}/payments/${encodeURIComponent(paymentId)}`, {
    method: 'GET',
    headers: {
      'Authorization': `PortOne ${PORTONE_CONFIG.apiSecret}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get payment info')
  }

  return response.json()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const timestamp = req.headers.get('webhook-timestamp') || ''
    const signature = req.headers.get('webhook-signature') || ''

    // 웹훅 시그니처 검증 (프로덕션 환경에서는 반드시 검증)
    if (process.env.NODE_ENV === 'production' && process.env.PORTONE_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature(
        body,
        timestamp,
        signature,
        process.env.PORTONE_WEBHOOK_SECRET
      )
      if (!isValid) {
        console.error('Webhook signature verification failed')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const webhookData = JSON.parse(body)
    const { type, data } = webhookData

    console.log(`[Webhook] Received: ${type}`, data)

    switch (type) {
      case 'Transaction.Paid': {
        // 결제 완료 이벤트
        const paymentId = data.paymentId
        
        // 결제 정보 조회
        const paymentInfo = await getPayment(paymentId)
        
        // customData에서 사용자 정보 추출 (결제 요청 시 전달한 데이터)
        const customData = paymentInfo.customData ? JSON.parse(paymentInfo.customData) : {}
        const { userId, planId } = customData

        if (userId && planId) {
          const plan = SUBSCRIPTION_PLANS[planId.toUpperCase() as keyof typeof SUBSCRIPTION_PLANS]
          
          if (plan) {
            // 구독 시작일/종료일 계산
            const startDate = new Date()
            const endDate = new Date()
            endDate.setMonth(endDate.getMonth() + 1)

            // 구독 생성 및 유저 업데이트
            await prisma.$transaction(async (tx) => {
              // 기존 활성 구독 만료 처리
              await tx.subscription.updateMany({
                where: {
                  userId,
                  status: 'ACTIVE',
                },
                data: { status: 'EXPIRED' },
              })

              // 새 구독 생성
              await tx.subscription.create({
                data: {
                  userId,
                  serviceType: 'STOCK',
                  status: 'ACTIVE',
                  planId: planId.toLowerCase(),
                  startDate,
                  endDate,
                  createdById: userId,
                },
              })

              // 유저 플랜 업데이트
              await tx.user.update({
                where: { id: userId },
                data: {
                  plan: planId.toUpperCase() as 'BASIC' | 'PRO' | 'PREMIUM',
                  planExpiresAt: endDate,
                },
              })

              // 로그 기록
              await tx.log.create({
                data: {
                  type: 'SUBSCRIPTION_CREATED',
                  creatorId: userId,
                  targetId: userId,
                  metadata: {
                    paymentId,
                    planId,
                    amount: paymentInfo.amount.total,
                    source: 'webhook',
                  },
                },
              })
            })

            console.log(`[Webhook] Subscription activated for user ${userId}`)
          }
        }
        break
      }

      case 'Transaction.Cancelled':
      case 'Transaction.PartialCancelled': {
        // 결제 취소/부분취소 이벤트
        const paymentId = data.paymentId
        
        // 해당 결제와 연관된 구독 찾기
        const log = await prisma.log.findFirst({
          where: {
            type: 'SUBSCRIPTION_CREATED',
            metadata: {
              path: ['paymentId'],
              equals: paymentId,
            },
          },
        })

        if (log) {
          // 구독 취소 처리
          await prisma.subscription.updateMany({
            where: {
              userId: log.targetId!,
              status: 'ACTIVE',
            },
            data: { status: 'EXPIRED' },
          })

          // 유저 플랜 초기화
          await prisma.user.update({
            where: { id: log.targetId! },
            data: {
              plan: 'FREE',
              planExpiresAt: null,
            },
          })

          console.log(`[Webhook] Subscription cancelled for user ${log.targetId}`)
        }
        break
      }

      case 'Transaction.Failed': {
        // 결제 실패 이벤트
        console.log(`[Webhook] Payment failed: ${data.paymentId}`)
        break
      }

      case 'BillingKey.Issued': {
        // 빌링키 발급 완료 (정기결제용)
        console.log(`[Webhook] Billing key issued: ${data.billingKey}`)
        break
      }

      case 'BillingKey.Deleted': {
        // 빌링키 삭제
        console.log(`[Webhook] Billing key deleted: ${data.billingKey}`)
        break
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}


