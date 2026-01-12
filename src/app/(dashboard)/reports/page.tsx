"use client"

import { useState } from "react"
import { usePlan } from "@/hooks/usePlan"
import {
  FileText,
  Crown,
  ArrowRight,
  Loader2,
  Calendar,
  Download,
  Eye,
  Lock,
  TrendingUp,
  BarChart3,
  Globe,
  Building2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Report {
  id: string
  title: string
  date: string
  type: "daily" | "weekly" | "sector" | "special"
  level: "basic" | "detailed" | "premium"
  summary: string
  tags: string[]
}

// 샘플 리포트 데이터
const REPORTS: Report[] = [
  {
    id: "1",
    title: "2026년 1월 2주차 주간 시장 전망",
    date: "2026-01-11",
    type: "weekly",
    level: "basic",
    summary: "코스피 상승 흐름 지속, 반도체 섹터 강세 예상",
    tags: ["코스피", "코스닥", "주간전망"],
  },
  {
    id: "2",
    title: "반도체 섹터 심층 분석 리포트",
    date: "2026-01-10",
    type: "sector",
    level: "detailed",
    summary: "HBM 수요 급증으로 SK하이닉스, 삼성전자 실적 개선 전망",
    tags: ["반도체", "HBM", "AI"],
  },
  {
    id: "3",
    title: "2차전지 산업 구조 변화 분석",
    date: "2026-01-09",
    type: "sector",
    level: "detailed",
    summary: "전고체 배터리 상용화 임박, 수혜 기업 분석",
    tags: ["2차전지", "전고체", "LG에너지솔루션"],
  },
  {
    id: "4",
    title: "글로벌 매크로 경제 분석",
    date: "2026-01-08",
    type: "special",
    level: "premium",
    summary: "Fed 금리 정책 전망 및 국내 시장 영향 분석",
    tags: ["매크로", "금리", "환율"],
  },
  {
    id: "5",
    title: "신규 상장 기업 분석: AI 스타트업 특집",
    date: "2026-01-07",
    type: "special",
    level: "premium",
    summary: "2026년 상반기 주목해야 할 AI 관련 IPO 기업들",
    tags: ["IPO", "AI", "스타트업"],
  },
  {
    id: "6",
    title: "1월 11일 데일리 마켓 브리핑",
    date: "2026-01-11",
    type: "daily",
    level: "basic",
    summary: "외국인 순매수 지속, 코스피 2,800pt 돌파 시도",
    tags: ["데일리", "외국인", "수급"],
  },
]

const TYPE_CONFIG = {
  daily: { label: "데일리", icon: Calendar, color: "text-blue-400" },
  weekly: { label: "주간", icon: TrendingUp, color: "text-emerald-400" },
  sector: { label: "섹터", icon: Building2, color: "text-violet-400" },
  special: { label: "스페셜", icon: Globe, color: "text-amber-400" },
}

const LEVEL_CONFIG = {
  basic: { label: "Basic", minPlan: "basic" },
  detailed: { label: "Pro", minPlan: "pro" },
  premium: { label: "Premium", minPlan: "premium" },
}

export default function ReportsPage() {
  const { isLoading, features, planId, planName } = usePlan()
  const [selectedType, setSelectedType] = useState<string>("all")

  const reportLevel = features.marketReportLevel

  // 접근 가능한 레벨 체크
  const canAccessLevel = (level: string) => {
    const levelOrder = ["none", "basic", "detailed", "premium"]
    return levelOrder.indexOf(reportLevel) >= levelOrder.indexOf(level)
  }

  // 필터링된 리포트
  const filteredReports = REPORTS.filter(report => 
    selectedType === "all" || report.type === selectedType
  )

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // 리포트 접근 불가 (무료 플랜)
  if (reportLevel === "none") {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-400" />
            시장 분석 리포트
          </h1>
          <p className="text-muted-foreground">
            전문 애널리스트가 작성한 시장 분석 리포트를 확인하세요.
          </p>
        </div>

        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20">
              <Crown className="h-10 w-10 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">유료 구독 전용 기능</h2>
            <p className="text-muted-foreground mb-2">
              현재 플랜: <Badge variant="outline">{planName}</Badge>
            </p>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              시장 분석 리포트는 Basic 플랜 이상에서 이용 가능합니다.
              지금 구독하고 전문가의 분석을 받아보세요!
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-violet-600">
              <Link href="/subscriptions">
                구독 시작하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-400" />
            시장 분석 리포트
          </h1>
          <p className="text-muted-foreground">
            전문 애널리스트가 작성한 시장 분석 리포트를 확인하세요.
          </p>
        </div>
        <Badge className={cn(
          reportLevel === "premium" && "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0",
          reportLevel === "detailed" && "bg-primary text-white border-0",
        )}>
          {reportLevel === "premium" ? "Premium" : reportLevel === "detailed" ? "Pro" : "Basic"}
        </Badge>
      </div>

      {/* 리포트 레벨 안내 */}
      {reportLevel !== "premium" && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">더 많은 리포트를 원하시나요?</p>
                <p className="text-sm text-muted-foreground">
                  {reportLevel === "basic" 
                    ? "Pro 플랜으로 업그레이드하면 섹터 심층 분석 리포트를 볼 수 있습니다."
                    : "Premium 플랜으로 업그레이드하면 모든 스페셜 리포트를 볼 수 있습니다."
                  }
                </p>
              </div>
            </div>
            <Button asChild size="sm">
              <Link href="/subscriptions">업그레이드</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 필터 탭 */}
      <Tabs value={selectedType} onValueChange={setSelectedType}>
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="daily">데일리</TabsTrigger>
          <TabsTrigger value="weekly">주간</TabsTrigger>
          <TabsTrigger value="sector">섹터</TabsTrigger>
          <TabsTrigger value="special">스페셜</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 리포트 목록 */}
      <div className="grid gap-4">
        {filteredReports.map((report) => {
          const typeConfig = TYPE_CONFIG[report.type]
          const Icon = typeConfig.icon
          const isLocked = !canAccessLevel(report.level)

          return (
            <Card 
              key={report.id} 
              className={cn(
                "border-border/50 transition-all",
                isLocked ? "opacity-60" : "hover:border-primary/50"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-lg",
                      isLocked ? "bg-muted" : "bg-primary/10"
                    )}>
                      {isLocked ? (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      ) : (
                        <Icon className={cn("h-6 w-6", typeConfig.color)} />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={typeConfig.color}>
                          {typeConfig.label}
                        </Badge>
                        <Badge 
                          variant="secondary"
                          className={cn(
                            report.level === "premium" && "bg-amber-500/20 text-amber-400",
                            report.level === "detailed" && "bg-primary/20 text-primary"
                          )}
                        >
                          {LEVEL_CONFIG[report.level].label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{report.date}</span>
                      </div>
                      <h3 className={cn(
                        "font-semibold",
                        isLocked && "text-muted-foreground"
                      )}>
                        {report.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {report.summary}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {report.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isLocked ? (
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/subscriptions">
                          <Lock className="mr-2 h-4 w-4" />
                          업그레이드 필요
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
