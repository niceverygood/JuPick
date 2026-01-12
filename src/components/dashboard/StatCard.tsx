"use client"

import { 
  Users, 
  UserPlus, 
  Building2, 
  Coins, 
  TrendingUp, 
  Wallet,
  Clock 
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const iconMap = {
  users: Users,
  userPlus: UserPlus,
  building: Building2,
  coins: Coins,
  trending: TrendingUp,
  wallet: Wallet,
  clock: Clock,
}

type IconName = keyof typeof iconMap

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  change?: number
  iconName: IconName
  iconColor?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  change,
  iconName,
  iconColor = "text-primary",
}: StatCardProps) {
  const Icon = iconMap[iconName]
  
  return (
    <Card className="card-hover border-border/50 bg-card/80">
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 lg:space-y-2 min-w-0 flex-1">
            <p className="text-xs lg:text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-lg lg:text-2xl font-bold truncate">{value}</p>
            {subtitle && (
              <p className="text-[10px] lg:text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
            {change !== undefined && (
              <div className="flex items-center gap-1 flex-wrap">
                <span
                  className={cn(
                    "text-[10px] lg:text-xs font-medium",
                    change >= 0 ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {change >= 0 ? "▲" : "▼"} {Math.abs(change)}%
                </span>
                <span className="text-[10px] lg:text-xs text-muted-foreground hidden sm:inline">지난주 대비</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0",
              iconColor
            )}
          >
            <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
