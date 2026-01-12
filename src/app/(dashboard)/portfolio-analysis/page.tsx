"use client"

import { useState } from "react"
import { usePlan } from "@/hooks/usePlan"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"
import {
  Briefcase,
  Crown,
  ArrowRight,
  Loader2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Shield,
  Sparkles,
  Plus,
  Trash2,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface PortfolioStock {
  symbol: string
  name: string
  quantity: number
  avgPrice: number
  currentPrice: number
  returnRate: number
  sector: string
}

// 샘플 포트폴리오 데이터
const SAMPLE_PORTFOLIO: PortfolioStock[] = [
  { symbol: "005930", name: "삼성전자", quantity: 100, avgPrice: 65000, currentPrice: 72500, returnRate: 11.54, sector: "반도체" },
  { symbol: "000660", name: "SK하이닉스", quantity: 50, avgPrice: 150000, currentPrice: 178000, returnRate: 18.67, sector: "반도체" },
  { symbol: "035420", name: "NAVER", quantity: 30, avgPrice: 190000, currentPrice: 185000, returnRate: -2.63, sector: "IT" },
  { symbol: "373220", name: "LG에너지솔루션", quantity: 10, avgPrice: 400000, currentPrice: 385000, returnRate: -3.75, sector: "2차전지" },
  { symbol: "005380", name: "현대차", quantity: 40, avgPrice: 180000, currentPrice: 215000, returnRate: 19.44, sector: "자동차" },
]

// 섹터별 비중 계산
function calculateSectorAllocation(portfolio: PortfolioStock[]) {
  const sectorMap: Record<string, number> = {}
  let totalValue = 0

  portfolio.forEach(stock => {
    const value = stock.quantity * stock.currentPrice
    totalValue += value
    sectorMap[stock.sector] = (sectorMap[stock.sector] || 0) + value
  })

  return Object.entries(sectorMap).map(([name, value]) => ({
    name,
    value: Math.round((value / totalValue) * 100),
    amount: value,
  }))
}

const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]

export default function PortfolioAnalysisPage() {
  const { isLoading, features, planId, planName } = usePlan()
  const [portfolio, setPortfolio] = useState<PortfolioStock[]>(SAMPLE_PORTFOLIO)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)

  const canAccess = features.portfolioAnalysis

  // 총 자산 및 수익 계산
  const totalInvested = portfolio.reduce((sum, s) => sum + s.quantity * s.avgPrice, 0)
  const totalCurrent = portfolio.reduce((sum, s) => sum + s.quantity * s.currentPrice, 0)
  const totalReturn = totalCurrent - totalInvested
  const totalReturnRate = (totalReturn / totalInvested) * 100

  const sectorData = calculateSectorAllocation(portfolio)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    // 실제로는 AI API 호출
    await new Promise(resolve => setTimeout(resolve, 2000))
    setAnalysisResult(`
📊 포트폴리오 AI 분석 결과

✅ 강점
- 반도체 섹터 집중 투자로 AI/HBM 수혜 기대
- 삼성전자, SK하이닉스 우량주 비중 적절

⚠️ 개선점
- 섹터 집중도 과도 (반도체 60% 이상)
- 방어적 자산(배당주, 채권) 부재
- IT 섹터 손실 종목 점검 필요

💡 추천 액션
1. 반도체 비중 40%로 조정
2. 금융, 헬스케어 섹터 편입 고려
3. NAVER 손절가 180,000원 설정 권고
4. LG에너지솔루션 추가 매수 기회 탐색

📈 예상 수익률 개선: +15~20%
🎯 리스크 레벨: 중간 → 낮음
    `.trim())
    setIsAnalyzing(false)
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Premium 이하 플랜은 접근 불가
  if (!canAccess) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-violet-400" />
            포트폴리오 AI 분석
          </h1>
          <p className="text-muted-foreground">
            AI가 당신의 포트폴리오를 분석하고 최적화 방안을 제시합니다.
          </p>
        </div>

        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20">
              <Crown className="h-10 w-10 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Premium 플랜 전용 기능</h2>
            <p className="text-muted-foreground mb-2">
              현재 플랜: <Badge variant="outline">{planName}</Badge>
            </p>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              포트폴리오 AI 분석은 Premium 플랜에서만 이용 가능합니다.
              지금 업그레이드하고 전문가 수준의 포트폴리오 분석을 받아보세요!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-violet-600">
                <Link href="/subscriptions">
                  Premium 업그레이드
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 기능 미리보기 */}
        <div className="grid gap-4 md:grid-cols-3">
          <FeaturePreview
            icon={TrendingUp}
            title="수익률 분석"
            description="종목별, 섹터별 수익률 심층 분석"
          />
          <FeaturePreview
            icon={Shield}
            title="리스크 평가"
            description="포트폴리오 리스크 수준 및 개선점"
          />
          <FeaturePreview
            icon={Target}
            title="최적화 제안"
            description="AI 기반 리밸런싱 추천"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-violet-400" />
            포트폴리오 AI 분석
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
              Premium
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            AI가 당신의 포트폴리오를 분석하고 최적화 방안을 제시합니다.
          </p>
        </div>
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="bg-gradient-to-r from-primary to-violet-600"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              분석 중...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              AI 분석 시작
            </>
          )}
        </Button>
      </div>

      {/* 포트폴리오 요약 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">총 투자금</p>
            <p className="text-2xl font-bold">{totalInvested.toLocaleString()}원</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">현재 평가액</p>
            <p className="text-2xl font-bold">{totalCurrent.toLocaleString()}원</p>
          </CardContent>
        </Card>
        <Card className={cn(
          "border-border/50",
          totalReturn >= 0 ? "bg-emerald-500/5" : "bg-red-500/5"
        )}>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">총 수익</p>
            <p className={cn(
              "text-2xl font-bold",
              totalReturn >= 0 ? "text-emerald-400" : "text-red-400"
            )}>
              {totalReturn >= 0 ? "+" : ""}{totalReturn.toLocaleString()}원
            </p>
          </CardContent>
        </Card>
        <Card className={cn(
          "border-border/50",
          totalReturnRate >= 0 ? "bg-emerald-500/5" : "bg-red-500/5"
        )}>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">수익률</p>
            <p className={cn(
              "text-2xl font-bold",
              totalReturnRate >= 0 ? "text-emerald-400" : "text-red-400"
            )}>
              {totalReturnRate >= 0 ? "+" : ""}{totalReturnRate.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 섹터별 비중 차트 */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>섹터별 비중</CardTitle>
            <CardDescription>포트폴리오 섹터 분산 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string, props: any) => [
                      `${props.payload.amount.toLocaleString()}원`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI 분석 결과 */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI 분석 결과
            </CardTitle>
            <CardDescription>
              포트폴리오 최적화를 위한 AI 추천
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysisResult ? (
              <div className="whitespace-pre-wrap text-sm bg-muted/30 p-4 rounded-lg max-h-64 overflow-y-auto">
                {analysisResult}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Sparkles className="h-12 w-12 mb-4 opacity-50" />
                <p>"AI 분석 시작" 버튼을 클릭하세요</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 보유 종목 목록 */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>보유 종목</CardTitle>
          <CardDescription>현재 보유 중인 종목 목록</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-2">종목</th>
                  <th className="text-right py-3 px-2">수량</th>
                  <th className="text-right py-3 px-2">평균단가</th>
                  <th className="text-right py-3 px-2">현재가</th>
                  <th className="text-right py-3 px-2">평가금액</th>
                  <th className="text-right py-3 px-2">수익률</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((stock) => (
                  <tr key={stock.symbol} className="border-b border-border/30 hover:bg-muted/30">
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium">{stock.name}</p>
                        <p className="text-xs text-muted-foreground">{stock.symbol}</p>
                      </div>
                    </td>
                    <td className="text-right py-3 px-2">{stock.quantity.toLocaleString()}</td>
                    <td className="text-right py-3 px-2">{stock.avgPrice.toLocaleString()}</td>
                    <td className="text-right py-3 px-2">{stock.currentPrice.toLocaleString()}</td>
                    <td className="text-right py-3 px-2">
                      {(stock.quantity * stock.currentPrice).toLocaleString()}
                    </td>
                    <td className={cn(
                      "text-right py-3 px-2 font-medium",
                      stock.returnRate >= 0 ? "text-emerald-400" : "text-red-400"
                    )}>
                      {stock.returnRate >= 0 ? "+" : ""}{stock.returnRate.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function FeaturePreview({ icon: Icon, title, description }: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <Card className="border-border/30 bg-card/30 opacity-60">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


