"use client"

import { Badge } from "@/components/ui/badge"
import { SERVICE_LABELS, SERVICE_ICONS } from "@/lib/constants"
import { getDaysRemaining, getSubscriptionStatus } from "@/lib/utils"
import type { SubscriptionWithUser, ServiceType } from "@/types"

interface ServiceStatusBadgeProps {
  subscriptions: SubscriptionWithUser[]
  serviceType: ServiceType
}

export function ServiceStatusBadge({ subscriptions, serviceType }: ServiceStatusBadgeProps) {
  const subscription = subscriptions.find(
    (s) => s.serviceType === serviceType && s.status === "ACTIVE"
  )

  if (!subscription) {
    return (
      <Badge variant="outline" className="opacity-50">
        <span className="mr-1">{SERVICE_ICONS[serviceType]}</span>
        미사용
      </Badge>
    )
  }

  const status = getSubscriptionStatus(subscription.endDate)
  const daysRemaining = getDaysRemaining(subscription.endDate)

  const variant = subscription.isFreeTest
    ? "info"
    : status === "active"
    ? "success"
    : status === "expiring"
    ? "warning"
    : "destructive"

  return (
    <Badge variant={variant}>
      <span className="mr-1">{SERVICE_ICONS[serviceType]}</span>
      {subscription.isFreeTest ? (
        "FREE"
      ) : status === "expired" ? (
        "만료"
      ) : (
        `${daysRemaining}일`
      )}
    </Badge>
  )
}

