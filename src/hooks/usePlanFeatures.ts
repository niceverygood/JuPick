// src/hooks/usePlanFeatures.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

// =====================
// AI 추천 Hooks
// =====================

interface Recommendation {
  id: string
  stockCode: string
  stockName: string
  currentPrice: number
  targetPrice: number
  stopLoss: number | null
  reason: string
  confidence: number
  category: string
  isHotStock: boolean
  createdAt: string
  expiresAt: string
}

interface RecommendationsResponse {
  recommendations: Recommendation[]
  remaining: number
  limit: number
  usedToday: number
  showStopLoss: boolean
}

export function useRecommendations() {
  const { data: session, status } = useSession()
  
  return useQuery<RecommendationsResponse>({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const res = await fetch('/api/user/recommendations')
      const data = await res.json()
      if (!res.ok) throw data
      return data
    },
    enabled: status === 'authenticated' && !!session,
    staleTime: 1000 * 60 * 5, // 5분
  })
}

export function useRequestRecommendation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/user/recommendations', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (!res.ok) throw data
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
      toast.success('새로운 AI 추천이 생성되었습니다!')
    },
    onError: (error: any) => {
      if (error.upgradeRequired) {
        toast.error(error.message || '플랜 업그레이드가 필요합니다.')
      } else {
        toast.error(error.message || '추천 생성에 실패했습니다.')
      }
    }
  })
}

// =====================
// 급등주 Hooks
// =====================

interface HotStock extends Recommendation {
  potentialReturn?: string
}

interface HotStocksResponse {
  hotStocks: HotStock[]
  remaining: number
  limit: number
  usedThisWeek: number
  preview?: { stockName: string; potentialReturn: string; isLocked: boolean }[]
}

export function useHotStocks() {
  const { data: session, status } = useSession()
  
  return useQuery<HotStocksResponse>({
    queryKey: ['hotStocks'],
    queryFn: async () => {
      const res = await fetch('/api/user/hot-stocks')
      const data = await res.json()
      if (!res.ok) throw data
      return data
    },
    enabled: status === 'authenticated' && !!session,
    staleTime: 1000 * 60 * 10, // 10분
    retry: false, // 403 에러 시 재시도 안함
  })
}

// =====================
// 실시간 시그널 Hooks
// =====================

interface Signal {
  id: string
  stockCode: string
  stockName: string
  signalType: 'BUY' | 'SELL' | 'HOLD' | 'ALERT'
  price: number
  targetPrice: number | null
  stopLoss: number | null
  reason: string
  isRead: boolean
  createdAt: string
}

interface SignalsResponse {
  signals: Signal[]
  unreadCount: number
  todayStats: {
    buy: number
    sell: number
    alert: number
    total: number
  }
  preview?: { stockName: string; signalType: string; isLocked: boolean }[]
}

export function useSignals() {
  const { data: session, status } = useSession()
  
  return useQuery<SignalsResponse>({
    queryKey: ['signals'],
    queryFn: async () => {
      const res = await fetch('/api/user/signals')
      const data = await res.json()
      if (!res.ok) throw data
      return data
    },
    enabled: status === 'authenticated' && !!session,
    refetchInterval: 30000, // 30초마다 갱신
    retry: false,
  })
}

export function useMarkSignalsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (signalIds: string[]) => {
      const res = await fetch('/api/user/signals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signalIds })
      })
      const data = await res.json()
      if (!res.ok) throw data
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signals'] })
    }
  })
}

// =====================
// 시장 리포트 Hooks
// =====================

interface MarketReport {
  id: string
  title: string
  content: string
  reportType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SPECIAL'
  reportDate: string
  createdAt: string
  hasDetailedContent: boolean
  hasPremiumContent: boolean
  previewText: string | null
}

interface ReportsResponse {
  reports: MarketReport[]
  reportLevel: 'basic' | 'detailed' | 'premium' | null
  preview?: { title: string; summary: string }
}

export function useMarketReports() {
  const { data: session, status } = useSession()
  
  return useQuery<ReportsResponse>({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await fetch('/api/user/reports')
      const data = await res.json()
      if (!res.ok) throw data
      return data
    },
    enabled: status === 'authenticated' && !!session,
    staleTime: 1000 * 60 * 30, // 30분
    retry: false,
  })
}

// =====================
// 포트폴리오 분석 Hooks
// =====================

interface PortfolioAnalysis {
  id: string
  totalValue: number
  totalProfit: number
  profitRate: number
  riskScore: number
  diversificationScore: number
  suggestions: string[]
  holdings: any[]
  createdAt: string
}

interface PortfolioAnalysisResponse {
  analysis: PortfolioAnalysis | null
  canAnalyze: boolean
  preview?: {
    riskScore: string
    diversificationScore: string
    suggestion: string
    benefits: string[]
  }
}

export function usePortfolioAnalysis() {
  const { data: session, status } = useSession()
  
  return useQuery<PortfolioAnalysisResponse>({
    queryKey: ['portfolioAnalysis'],
    queryFn: async () => {
      const res = await fetch('/api/user/portfolio-analysis')
      const data = await res.json()
      if (!res.ok) throw data
      return data
    },
    enabled: status === 'authenticated' && !!session,
    retry: false,
  })
}

interface Holding {
  stockCode: string
  stockName: string
  quantity: number
  avgPrice: number
  sector?: string
}

export function useRequestPortfolioAnalysis() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (holdings: Holding[]) => {
      const res = await fetch('/api/user/portfolio-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holdings })
      })
      const data = await res.json()
      if (!res.ok) throw data
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioAnalysis'] })
      toast.success('포트폴리오 분석이 완료되었습니다!')
    },
    onError: (error: any) => {
      if (error.upgradeRequired) {
        toast.error('Premium 플랜에서만 이용 가능합니다.')
      } else {
        toast.error(error.message || '분석에 실패했습니다.')
      }
    }
  })
}

// =====================
// 전문가 상담 Hooks
// =====================

interface Consultation {
  id: string
  question: string
  answer: string | null
  status: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  scheduledAt: string | null
  completedAt: string | null
  createdAt: string
}

interface ConsultationsResponse {
  consultations: Consultation[]
  remaining: number
  limit: number
  usedThisMonth: number
  canBook: boolean
  benefits?: string[]
}

export function useConsultations() {
  const { data: session, status } = useSession()
  
  return useQuery<ConsultationsResponse>({
    queryKey: ['consultations'],
    queryFn: async () => {
      const res = await fetch('/api/user/consultations')
      const data = await res.json()
      if (!res.ok) throw data
      return data
    },
    enabled: status === 'authenticated' && !!session,
    retry: false,
  })
}

interface BookConsultationParams {
  question: string
  preferredDate?: string
  contactMethod?: 'video' | 'phone' | 'chat'
}

export function useBookConsultation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (params: BookConsultationParams) => {
      const res = await fetch('/api/user/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })
      const data = await res.json()
      if (!res.ok) throw data
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] })
      toast.success(data.message || '상담 신청이 완료되었습니다!')
    },
    onError: (error: any) => {
      if (error.upgradeRequired) {
        toast.error('Premium 플랜에서만 이용 가능합니다.')
      } else {
        toast.error(error.message || '상담 신청에 실패했습니다.')
      }
    }
  })
}

export function useCancelConsultation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (consultationId: string) => {
      const res = await fetch(`/api/user/consultations?id=${consultationId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (!res.ok) throw data
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] })
      toast.success(data.message || '상담이 취소되었습니다.')
    },
    onError: (error: any) => {
      toast.error(error.message || '상담 취소에 실패했습니다.')
    }
  })
}


