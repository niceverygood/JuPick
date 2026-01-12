"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { PlanId, PlanFeatures, getPlanFeatures, canAccessFeature, PLANS } from "@/lib/plans"

export interface SubscriptionInfo {
  isSubscribed: boolean
  planId: PlanId
  planName: string
  endDate: Date | null
  daysRemaining: number
  features: PlanFeatures
  loading: boolean
}

export function useSubscription(): SubscriptionInfo {
  const { data: session, status } = useSession()
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({
    isSubscribed: false,
    planId: "free",
    planName: "무료",
    endDate: null,
    daysRemaining: 0,
    features: getPlanFeatures("free"),
    loading: true,
  })

  useEffect(() => {
    if (status === "loading") return

    // 관리자 역할은 항상 최고 등급
    if (session?.user?.role && ["MASTER", "DISTRIBUTOR", "AGENCY"].includes(session.user.role)) {
      setSubscriptionInfo({
        isSubscribed: true,
        planId: "admin",
        planName: "관리자",
        endDate: null,
        daysRemaining: 999,
        features: getPlanFeatures("admin"),
        loading: false,
      })
      return
    }

    // 일반 유저는 구독 상태 확인
    const checkSubscription = async () => {
      try {
        const response = await fetch("/api/subscriptions/status")
        if (response.ok) {
          const data = await response.json()
          const planId = (data.planId as PlanId) || "free"
          setSubscriptionInfo({
            isSubscribed: data.isSubscribed,
            planId,
            planName: PLANS[planId]?.name || "무료",
            endDate: data.endDate ? new Date(data.endDate) : null,
            daysRemaining: data.daysRemaining || 0,
            features: getPlanFeatures(planId),
            loading: false,
          })
        } else {
          setSubscriptionInfo(prev => ({ 
            ...prev, 
            loading: false,
            features: getPlanFeatures("free"),
          }))
        }
      } catch (error) {
        console.error("Failed to check subscription:", error)
        setSubscriptionInfo(prev => ({ 
          ...prev, 
          loading: false,
          features: getPlanFeatures("free"),
        }))
      }
    }

    if (session?.user) {
      checkSubscription()
    } else {
      setSubscriptionInfo(prev => ({ ...prev, loading: false }))
    }
  }, [session, status])

  return subscriptionInfo
}

// 특정 기능 사용 가능 여부 체크 훅
export function useCanUseFeature(feature: keyof PlanFeatures): boolean {
  const { planId, loading } = useSubscription()
  
  if (loading) return false
  return canAccessFeature(planId, feature)
}

// 플랜 기능 체크 유틸리티 훅
export function usePlanFeatures() {
  const subscription = useSubscription()
  
  const canAccess = useCallback((feature: keyof PlanFeatures): boolean => {
    return canAccessFeature(subscription.planId, feature)
  }, [subscription.planId])
  
  const getLimit = useCallback((feature: "dailyRecommendationLimit" | "weeklyHiddenGemsLimit" | "monthlyConsultationLimit"): number => {
    return subscription.features[feature]
  }, [subscription.features])
  
  const isUnlimited = useCallback((feature: "dailyRecommendationLimit" | "weeklyHiddenGemsLimit"): boolean => {
    return subscription.features[feature] === -1
  }, [subscription.features])
  
  return {
    ...subscription,
    canAccess,
    getLimit,
    isUnlimited,
  }
}
