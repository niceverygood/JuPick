// src/app/api/settlements/confirm/route.ts
// 정산 확정 및 지급 관리 API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { 
  confirmSettlements, 
  markSettlementAsPaid, 
  getConfirmedSettlements 
} from '@/lib/settlement'

/**
 * GET: 확정된 정산 내역 조회
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = session.user.role

    // 마스터만 전체 조회 가능
    if (userRole !== 'MASTER' && userRole !== 'DISTRIBUTOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const isPaidParam = searchParams.get('isPaid')
    const limitParam = searchParams.get('limit')

    const options: { distributorId?: string; isPaid?: boolean; limit?: number } = {}

    // 총판은 자신의 정산만 조회
    if (userRole === 'DISTRIBUTOR') {
      options.distributorId = session.user.id
    }

    if (isPaidParam !== null) {
      options.isPaid = isPaidParam === 'true'
    }

    if (limitParam) {
      options.limit = parseInt(limitParam, 10)
    }

    const settlements = await getConfirmedSettlements(options)

    return NextResponse.json({ settlements })
  } catch (error) {
    console.error('Get confirmed settlements error:', error)
    return NextResponse.json(
      { error: 'Failed to get settlements' },
      { status: 500 }
    )
  }
}

/**
 * POST: 정산 확정 (마스터 전용)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 마스터만 정산 확정 가능
    if (session.user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { periodStart: startStr, periodEnd: endStr } = body

    if (!startStr || !endStr) {
      return NextResponse.json(
        { error: 'periodStart와 periodEnd가 필요합니다.' },
        { status: 400 }
      )
    }

    const periodStart = new Date(startStr)
    const periodEnd = new Date(endStr)

    periodStart.setHours(0, 0, 0, 0)
    periodEnd.setHours(23, 59, 59, 999)

    const result = await confirmSettlements(periodStart, periodEnd)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `정산 확정 완료: ${result.settlementsCreated}건`,
        settlementsCreated: result.settlementsCreated,
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Confirm settlements error:', error)
    return NextResponse.json(
      { error: 'Failed to confirm settlements' },
      { status: 500 }
    )
  }
}

/**
 * PATCH: 정산 지급 완료 처리 (마스터 전용)
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 마스터만 지급 처리 가능
    if (session.user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { settlementId } = body

    if (!settlementId) {
      return NextResponse.json(
        { error: 'settlementId가 필요합니다.' },
        { status: 400 }
      )
    }

    const result = await markSettlementAsPaid(settlementId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '지급 완료 처리되었습니다.',
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Mark settlement as paid error:', error)
    return NextResponse.json(
      { error: 'Failed to mark settlement as paid' },
      { status: 500 }
    )
  }
}


