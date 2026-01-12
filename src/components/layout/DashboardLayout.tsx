"use client"

import { useEffect } from "react"
import { useUIStore } from "@/stores/uiStore"
import { cn } from "@/lib/utils"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { Toaster } from "@/components/ui/toaster"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { sidebarCollapsed, sidebarMobileOpen } = useUIStore()

  // 모바일에서 사이드바 열렸을 때 스크롤 방지
  useEffect(() => {
    if (sidebarMobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [sidebarMobileOpen])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      
      <main
        className={cn(
          "min-h-screen pt-16 transition-all duration-300",
          // 데스크탑: 사이드바 너비만큼 패딩
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-64",
          // 모바일: 패딩 없음
          "pl-0"
        )}
      >
        <div className="p-4 lg:p-6">{children}</div>
      </main>
      <Toaster />
    </div>
  )
}
