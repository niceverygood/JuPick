"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { PlanFeatures, PlanId, PLANS } from "@/lib/plans"

export interface PlanInfo {
  isLoading: boolean
  isSubscribed: boolean
  planId: PlanId
  planName: string
  features: PlanFeatures
  daysRemaining: number
  endDate: Date | null
  refetch: () => Promise<void>
}

export function usePlan(): PlanInfo {
  const { data: session, status } = useSession()
  const [planInfo, setPlanInfo] = useState<Omit<PlanInfo, "refetch">>({
    isLoading: true,
    isSubscribed: false,
    planId: "free",
    planName: "무료",
    features: PLANS.free.features,
    daysRemaining: 0,
    endDate: null,
  })

  const fetchPlan = useCallback(async () => {
    if (status === "loading") return
    
    if (!session?.user) {
      setPlanInfo({
        isLoading: false,
        isSubscribed: false,
        planId: "free",
        planName: "무료",
        features: PLANS.free.features,
        daysRemaining: 0,
        endDate: null,
      })
      return
    }

    try {
      const response = await fetch("/api/subscriptions/status")
      if (response.ok) {
        const data = await response.json()
        setPlanInfo({
          isLoading: false,
          isSubscribed: data.isSubscribed,
          planId: data.planId as PlanId,
          planName: data.planName,
          features: data.features || PLANS[data.planId as PlanId]?.features || PLANS.free.features,
          daysRemaining: data.daysRemaining || 0,
          endDate: data.endDate ? new Date(data.endDate) : null,
        })
      } else {
        setPlanInfo(prev => ({ ...prev, isLoading: false }))
      }
    } catch (error) {
      console.error("Failed to fetch plan:", error)
      setPlanInfo(prev => ({ ...prev, isLoading: false }))
    }
  }, [session, status])

  useEffect(() => {
    fetchPlan()
  }, [fetchPlan])

  return { ...planInfo, refetch: fetchPlan }
}

// 특정 기능 접근 가능 여부 체크
export function useCanAccess(feature: keyof PlanFeatures): boolean {
  const { features, isLoading } = usePlan()
  
  if (isLoading) return false
  
  const value = features[feature]
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value !== 0
  if (typeof value === "string") return value !== "none"
  
  return false
}

// 특정 기능의 제한값 가져오기
export function useFeatureLimit(feature: keyof PlanFeatures): number {
  const { features, isLoading } = usePlan()
  
  if (isLoading) return 0
  
  const value = features[feature]
  if (typeof value === "number") return value
  return 0
}


