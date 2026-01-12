"use client"

import { useEffect } from "react"
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
  X,
  CreditCard,
  Crown,
  Zap,
  FileText,
  PieChart,
  MessageCircle,
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
    name: "유저 대시보드",
    href: "/user-dashboard",
    icon: Crown,
    roles: ["USER"],
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
    name: "실시간 시그널",
    href: "/signals",
    icon: Zap,
    roles: ["MASTER", "DISTRIBUTOR", "AGENCY", "USER"],
  },
  {
    name: "포트폴리오 분석",
    href: "/portfolio-analysis",
    icon: PieChart,
    roles: ["MASTER", "DISTRIBUTOR", "AGENCY", "USER"],
  },
  {
    name: "전문가 상담",
    href: "/consultation",
    icon: MessageCircle,
    roles: ["MASTER", "DISTRIBUTOR", "AGENCY", "USER"],
  },
  {
    name: "시장 리포트",
    href: "/reports",
    icon: FileText,
    roles: ["MASTER", "DISTRIBUTOR", "AGENCY", "USER"],
  },
  {
    name: "공지사항",
    href: "/notices",
    icon: Megaphone,
    roles: ["MASTER", "DISTRIBUTOR", "AGENCY", "USER"],
  },
  {
    name: "프리미엄 플랜",
    href: "/pricing",
    icon: Crown,
    roles: ["MASTER", "DISTRIBUTOR", "AGENCY", "USER"],
  },
  {
    name: "내 구독",
    href: "/my-subscription",
    icon: CreditCard,
    roles: ["USER"],
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
  const { sidebarCollapsed, toggleSidebar, sidebarMobileOpen, setSidebarMobileOpen } = useUIStore()

  const userRole = session?.user?.role || "USER"

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(userRole)
  )

  // 뷰포트 변경 시 모바일 사이드바 닫기
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarMobileOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setSidebarMobileOpen])

  const handleNavClick = () => {
    // 모바일에서 네비게이션 클릭 시 사이드바 닫기
    if (window.innerWidth < 1024) {
      setSidebarMobileOpen(false)
    }
  }

  return (
    <>
      {/* 모바일 배경 오버레이 */}
      {sidebarMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}
      
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen border-r bg-[var(--sidebar)] transition-all duration-300",
          // 데스크탑
          sidebarCollapsed ? "lg:w-16" : "lg:w-64",
          // 모바일: 기본 숨김, 열렸을 때 w-64
          "w-64",
          sidebarMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-[var(--sidebar-border)] px-4">
        {(!sidebarCollapsed || sidebarMobileOpen) && (
          <Link href="/" className="flex items-center gap-2" onClick={handleNavClick}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
              <span className="text-lg font-bold text-primary-foreground">J</span>
            </div>
            <span className="text-xl font-bold gradient-text whitespace-nowrap">JUPICK</span>
          </Link>
        )}
        
        {/* 데스크탑: 사이드바 접기 버튼 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "h-8 w-8 text-muted-foreground hover:text-foreground hidden lg:flex",
            sidebarCollapsed && "mx-auto"
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
        
        {/* 모바일: 닫기 버튼 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarMobileOpen(false)}
          className="h-8 w-8 text-muted-foreground hover:text-foreground lg:hidden"
        >
          <X className="h-4 w-4" />
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
                onClick={handleNavClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-[var(--sidebar-accent)] text-primary"
                    : "text-muted-foreground hover:bg-[var(--sidebar-accent)] hover:text-foreground",
                  sidebarCollapsed && !sidebarMobileOpen && "lg:justify-center lg:px-2"
                )}
                title={sidebarCollapsed && !sidebarMobileOpen ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {(!sidebarCollapsed || sidebarMobileOpen) && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </aside>
    </>
  )
}
