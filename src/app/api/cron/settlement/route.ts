// src/app/api/cron/settlement/route.ts
// Vercel Cron Job - 주간 정산 자동화
// cron: 0 0 * * 0 (매주 일요일 자정)

import { NextRequest, NextResponse } from 'next/server'
import { confirmSettlements, getLastWeekPeriod } from '@/lib/settlement'

// Vercel Cron 설정을 위한 config
export const runtime = 'nodejs'
export const maxDuration = 60 // 최대 실행 시간 (초)

/**
 * Vercel Cron Job Handler
 * 매주 일요일 자정에 실행되어 지난 주 정산을 자동으로 확정합니다.
 * 
 * Vercel cron 설정 (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/settlement",
 *     "schedule": "0 0 * * 0"
 *   }]
 * }
 */
export async function GET(req: NextRequest) {
  try {
    // Vercel Cron 인증 확인
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    // 개발 환경이 아닌 경우 인증 확인
    if (process.env.NODE_ENV === 'production') {
      if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        console.error('Unauthorized cron request')
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    console.log('🔄 Starting weekly settlement automation...')

    // 지난 주 기간 계산
    const { start: periodStart, end: periodEnd } = getLastWeekPeriod()
    
    console.log(`📅 Settlement period: ${periodStart.toISOString()} ~ ${periodEnd.toISOString()}`)

    // 정산 확정 실행
    const result = await confirmSettlements(periodStart, periodEnd)

    if (result.success) {
      console.log(`✅ Settlement completed: ${result.settlementsCreated} settlements created`)
      return NextResponse.json({
        success: true,
        message: `정산 자동화 완료: ${result.settlementsCreated}건 확정`,
        period: {
          start: periodStart.toISOString(),
          end: periodEnd.toISOString(),
        },
        settlementsCreated: result.settlementsCreated,
      })
    } else {
      console.error(`❌ Settlement failed: ${result.error}`)
      return NextResponse.json({
        success: false,
        error: result.error,
        period: {
          start: periodStart.toISOString(),
          end: periodEnd.toISOString(),
        },
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Settlement cron error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Settlement automation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST: 수동 정산 실행 (관리자용)
 */
export async function POST(req: NextRequest) {
  try {
    // 관리자 인증 확인 (실제 구현 시 세션 검증 필요)
    const adminSecret = process.env.ADMIN_SECRET
    const authHeader = req.headers.get('authorization')
    
    if (process.env.NODE_ENV === 'production') {
      if (adminSecret && authHeader !== `Bearer ${adminSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
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

    if (isNaN(periodStart.getTime()) || isNaN(periodEnd.getTime())) {
      return NextResponse.json(
        { error: '유효하지 않은 날짜 형식입니다.' },
        { status: 400 }
      )
    }

    console.log(`📅 Manual settlement: ${periodStart.toISOString()} ~ ${periodEnd.toISOString()}`)

    const result = await confirmSettlements(periodStart, periodEnd)

    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? `수동 정산 완료: ${result.settlementsCreated}건 확정`
        : result.error,
      settlementsCreated: result.settlementsCreated,
    })
  } catch (error) {
    console.error('Manual settlement error:', error)
    return NextResponse.json(
      { error: 'Manual settlement failed' },
      { status: 500 }
    )
  }
}


