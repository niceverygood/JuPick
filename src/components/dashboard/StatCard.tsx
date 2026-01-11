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
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {change !== undefined && (
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    "text-xs font-medium",
                    change >= 0 ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {change >= 0 ? "▲" : "▼"} {Math.abs(change)}%
                </span>
                <span className="text-xs text-muted-foreground">지난주 대비</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10",
              iconColor
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

