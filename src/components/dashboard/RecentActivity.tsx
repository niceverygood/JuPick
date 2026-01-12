"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LOG_LABELS } from "@/lib/constants"
import { formatDateTime } from "@/lib/utils"
import type { LogWithRelations } from "@/types"

interface RecentActivityProps {
  logs: LogWithRelations[]
}

export function RecentActivity({ logs }: RecentActivityProps) {
  const getLogBadgeVariant = (type: string) => {
    switch (type) {
      case "SUBSCRIPTION_CREATED":
        return "success"
      case "SUBSCRIPTION_EXTENDED":
        return "info"
      case "SUBSCRIPTION_EXPIRED":
        return "destructive"
      case "USER_CREATED":
        return "default"
      case "LOGIN":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">📋 최근 활동 로그</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="space-y-1 px-6 pb-6">
            {logs.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                최근 활동이 없습니다.
              </p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={getLogBadgeVariant(log.type) as "success" | "info" | "destructive" | "default" | "secondary" | "outline"}>
                      {LOG_LABELS[log.type] || log.type}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">
                        {log.target?.loginId || log.creator?.loginId}
                      </p>
                      {log.serviceType && (
                        <p className="text-xs text-muted-foreground">
                          {log.serviceType === "STOCK" && "주식"}
                          {log.serviceType === "COIN" && "코인"}
                          {log.serviceType === "COIN_FUTURES" && "코인선물"}
                          {log.days && ` ${log.days}일`}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(log.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}


