"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Megaphone,
  TrendingUp,
  Coins,
  BarChart3,
  Users,
  ClipboardList,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
  Briefcase,
  Gem,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useUIStore } from "@/stores/uiStore"
import { ScrollArea } from "@/components/ui/scroll-area"

const navigation = [
  {
    name: "대시보드",
    href: "/",
    icon: LayoutDashboard,
    roles: ["MASTER", "DISTRIBUTOR", "AGENCY", "USER"],
  },
  {
    name: "AI 종목추천",
    href: "/recommendations",
    icon: Sparkles,
    roles: ["MASTER", "DISTRIBUTOR", "AGENCY", "USER"],
  },
  {
    name: "AI 성과",
    href: "/performance",
    icon: Trophy,
    roles: ["MASTER", "DISTRIBUTOR", "AGENCY", "USER"],
  },
  {
    name: "숨겨진 급등주",
    href: "/hidden-gems",
    icon: Gem,
    roles: ["MASTER", "DISTRIBUTOR", "AGENCY", "USER"],
  },
  {
    name: "내 포트폴리오",
    href: "/portfolio",
    icon: Briefcase,
    roles: ["MASTER", "DISTRIBUTOR", "AGENCY", "USER"],
  },
  {
    name: "공지사항",
    href: "/notices",
    icon: Megaphone,
    roles: ["MASTER", "DISTRIBUTOR", "AGENCY", "USER"],
  },
  {
    name: "주식 관리",
    href: "/stock",
    icon: TrendingUp,
    roles: ["MASTER", "DISTRIBUTOR", "AGENCY"],
  },
  {
    name: "코인 관리",
    href: "/coin",
    icon: Coins,
    roles: ["MASTER", "DISTRIBUTOR", "AGENCY"],
  },
  {
    name: "코인선물 관리",
    href: "/futures",
    icon: BarChart3,
    roles: ["MASTER", "DISTRIBUTOR", "AGENCY"],
  },
  {
    name: "사용자 관리",
    href: "/users",
    icon: Users,
    roles: ["MASTER", "DISTRIBUTOR", "AGENCY"],
  },
  {
    name: "정산 로그",
    href: "/logs",
    icon: ClipboardList,
    roles: ["MASTER", "DISTRIBUTOR", "AGENCY"],
  },
  {
    name: "설정",
    href: "/settings",
    icon: Settings,
    roles: ["MASTER", "DISTRIBUTOR", "AGENCY", "USER"],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  const userRole = session?.user?.role || "USER"

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(userRole)
  )

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-[var(--sidebar)] transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-[var(--sidebar-border)] px-4">
        {!sidebarCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">J</span>
            </div>
            <span className="text-xl font-bold gradient-text">JUPICK</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "h-8 w-8 text-muted-foreground hover:text-foreground",
            sidebarCollapsed && "mx-auto"
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <nav className="space-y-1 p-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--sidebar-accent)] text-primary"
                    : "text-muted-foreground hover:bg-[var(--sidebar-accent)] hover:text-foreground",
                  sidebarCollapsed && "justify-center px-2"
                )}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </aside>
  )
}

