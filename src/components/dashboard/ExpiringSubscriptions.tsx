"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SERVICE_LABELS, SERVICE_ICONS } from "@/lib/constants"
import { getDaysRemaining, formatDate } from "@/lib/utils"
import type { SubscriptionWithUser } from "@/types"

interface ExpiringSubscriptionsProps {
  subscriptions: SubscriptionWithUser[]
}

export function ExpiringSubscriptions({ subscriptions }: ExpiringSubscriptionsProps) {
  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">⏰ 만료 예정</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px]">
          <div className="space-y-2 px-6 pb-6">
            {subscriptions.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                7일 이내 만료 예정인 구독이 없습니다.
              </p>
            ) : (
              subscriptions.map((sub) => {
                const daysRemaining = getDaysRemaining(sub.endDate)
                return (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {SERVICE_ICONS[sub.serviceType]}
                      </span>
                      <div>
                        <p className="text-sm font-medium">
                          {sub.user?.loginId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {SERVICE_LABELS[sub.serviceType]}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={daysRemaining <= 3 ? "destructive" : "warning"}
                      >
                        {daysRemaining}일 남음
                      </Badge>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(sub.endDate)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}


