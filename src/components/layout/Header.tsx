"use client"

import { useSession, signOut } from "next-auth/react"
import { LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useUIStore } from "@/stores/uiStore"
import { cn } from "@/lib/utils"
import { ROLE_LABELS } from "@/lib/constants"
import { SignalAlerts } from "@/components/notifications/SignalAlerts"

export function Header() {
  const { data: session } = useSession()
  const { sidebarCollapsed } = useUIStore()

  const user = session?.user
  const roleVariant = user?.role?.toLowerCase() as "master" | "distributor" | "agency" | "user" | undefined

  return (
    <header
      className={cn(
        "fixed top-0 z-30 h-16 border-b bg-background/95 backdrop-blur transition-all duration-300",
        sidebarCollapsed ? "left-16" : "left-64",
        "right-0"
      )}
    >
      <div className="flex h-full items-center justify-between px-6">
        {/* Left side - Breadcrumb / Title */}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">
            {new Date().toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* AI Signal Notifications */}
          <SignalAlerts />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start md:flex">
                  <span className="text-sm font-medium">{user?.name || "사용자"}</span>
                  <Badge variant={roleVariant} className="text-[10px] px-1.5 py-0">
                    {user?.role ? ROLE_LABELS[user.role] : "유저"}
                  </Badge>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user?.name}</span>
                  <span className="text-xs text-muted-foreground">{user?.loginId}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                프로필
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

