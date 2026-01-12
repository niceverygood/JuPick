"use client"

import { useState } from "react"
import { usePlan } from "@/hooks/usePlan"
import Image from "next/image"
import {
  MessageCircle,
  Crown,
  ArrowRight,
  Loader2,
  Calendar,
  Clock,
  Video,
  Phone,
  CheckCircle,
  Star,
  TrendingUp,
  Rocket,
  Shield,
  BarChart3,
  DollarSign,
  Target,
  Zap,
  Globe,
  PieChart,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import Link from "next/link"

// AI 전문가 캐릭터 데이터
const AI_EXPERTS = [
  {
    id: "claude",
    name: "Claude Lee",
    koreanName: "숫자의 검사",
    title: "Balanced Analyst",
    image: "/experts/claude-lee.png",
    avatarBg: "bg-gradient-to-br from-sky-100 to-blue-200",
    avatarEmoji: "👨‍💼",
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30",
    buttonColor: "bg-gradient-to-r from-blue-500 to-cyan-500",
    quote: '"감(感)에만 의존한 투자를 멀리하세요."',
    subQuote: "철저한 숫자 감각에 의존한 Top 5 추천을 만나보세요",
    description: '"숫자는 거짓말하지 않습니다. 감정이 아닌 데이터로 투자하세요."',
    analysisTitle: "분석 기준",
    analysisItems: [
      { icon: BarChart3, text: "PER, PBR 기반 밸류에이션 분석", color: "text-blue-400" },
      { icon: DollarSign, text: "현금흐름 & 재무건전성 검증", color: "text-emerald-400" },
      { icon: TrendingUp, text: "실적 성장률 & 수익성 지표", color: "text-violet-400" },
    ],
    recommendationType: "펀더멘털이 검증된 저평가 우량주",
    buttonText: "클로드리의 Top 5 받아보기",
    rating: 4.9,
  },
  {
    id: "gemini",
    name: "Gemi Nine",
    koreanName: "파괴적 혁신가",
    title: "Future Trend Strategist",
    image: "/experts/gemi-nine.png",
    avatarBg: "bg-gradient-to-br from-amber-100 to-orange-200",
    avatarEmoji: "🚀",
    color: "from-orange-500/20 to-amber-500/20",
    borderColor: "border-orange-500/30",
    buttonColor: "bg-gradient-to-r from-orange-500 to-amber-500",
    quote: '"남들이 "미쳤다"고 할 때가 기회입니다."',
    subQuote: "혁신과 성장에 베팅하는 공격적 Top 5를 만나보세요",
    description: '"역사는 미친 놈들이 만들어요. 테슬라도, 엔비디아도 처음엔 미쳤다고 했죠."',
    analysisTitle: "분석 기준",
    analysisItems: [
      { icon: Rocket, text: "AI, 반도체, 혁신 테마주", color: "text-orange-400" },
      { icon: Zap, text: "신성장 산업 & 기술 트렌드", color: "text-amber-400" },
      { icon: Globe, text: "TAM 확대 & 시장 지배력", color: "text-red-400" },
    ],
    recommendationType: "미래를 선도할 고성장 혁신 기업",
    buttonText: "제미나인의 Top 5 받아보기",
    rating: 4.8,
  },
  {
    id: "gpt",
    name: "G.P. Taylor",
    koreanName: "월가의 노장",
    title: "Chief Macro & Risk Officer",
    image: "/experts/gp-taylor.png",
    avatarBg: "bg-gradient-to-br from-teal-100 to-emerald-200",
    avatarEmoji: "🎯",
    color: "from-purple-500/20 to-violet-500/20",
    borderColor: "border-purple-500/30",
    buttonColor: "bg-gradient-to-r from-purple-500 to-violet-500",
    quote: '"살아남아야 다음 기회가 있습니다."',
    subQuote: "40년 경험이 담긴 리스크 최소화 Top 5를 만나보세요",
    description: '"시장은 당신이 버틸 수 있는 것보다 더 오래 비이성적일 수 있습니다."',
    analysisTitle: "분석 기준",
    analysisItems: [
      { icon: Shield, text: "변동성 대비 안정적 수익", color: "text-purple-400" },
      { icon: PieChart, text: "배당 & 현금창출력 우선", color: "text-pink-400" },
      { icon: Target, text: "거시경제 리스크 고려", color: "text-indigo-400" },
    ],
    recommendationType: "어떤 위기에도 버틸 수 있는 방어주",
    buttonText: "쥐피테일러의 Top 5 받아보기",
    rating: 4.7,
  },
]

interface Booking {
  id: string
  consultantName: string
  date: string
  time: string
  type: "video" | "phone"
  status: "upcoming" | "completed" | "cancelled"
}

// 샘플 예약 데이터
const SAMPLE_BOOKINGS: Booking[] = [
  {
    id: "1",
    consultantName: "Claude Lee",
    date: "2026-01-15",
    time: "14:00",
    type: "video",
    status: "upcoming",
  },
]

// 가능한 시간대
const AVAILABLE_TIMES = [
  "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"
]

export default function ConsultationPage() {
  const { isLoading, features, planName } = usePlan()
  const [selectedExpert, setSelectedExpert] = useState<typeof AI_EXPERTS[0] | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [selectedType, setSelectedType] = useState<"video" | "phone">("video")
  const [bookings, setBookings] = useState<Booking[]>(SAMPLE_BOOKINGS)
  const [isBooking, setIsBooking] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const canAccess = features.expertConsultation
  const monthlyLimit = features.monthlyConsultationLimit
  const usedThisMonth = bookings.filter(b => b.status === "upcoming" || b.status === "completed").length
  const remainingConsultations = monthlyLimit === -1 ? 999 : monthlyLimit - usedThisMonth

  const handleBook = async () => {
    if (!selectedExpert || !selectedDate || !selectedTime) return
    
    setIsBooking(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const newBooking: Booking = {
      id: Date.now().toString(),
      consultantName: selectedExpert.name,
      date: selectedDate,
      time: selectedTime,
      type: selectedType,
      status: "upcoming",
    }
    
    setBookings([...bookings, newBooking])
    setShowSuccess(true)
    setIsBooking(false)
    
    // 초기화
    setSelectedExpert(null)
    setSelectedDate("")
    setSelectedTime("")
    
    setTimeout(() => setShowSuccess(false), 3000)
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
            <MessageCircle className="h-6 w-6 text-cyan-400" />
            1:1 전문가 상담
          </h1>
          <p className="text-muted-foreground">
            투자 전문가와 1:1 상담으로 맞춤형 투자 조언을 받아보세요.
          </p>
        </div>

        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20">
              <Crown className="h-10 w-10 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Premium 플랜 전용 기능</h2>
            <div className="text-muted-foreground mb-2 flex items-center justify-center gap-2">
              <span>현재 플랜:</span> <Badge variant="outline">{planName}</Badge>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              1:1 전문가 상담은 Premium 플랜에서만 이용 가능합니다.
              매월 2회 전문가와 화상/음성 상담을 받아보세요!
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-violet-600">
              <Link href="/subscriptions">
                Premium 업그레이드
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* AI 전문가 프리뷰 */}
        <div className="grid gap-6 md:grid-cols-3">
          {AI_EXPERTS.map((expert) => (
            <AIExpertCard key={expert.id} expert={expert} locked />
          ))}
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
            <MessageCircle className="h-6 w-6 text-cyan-400" />
            1:1 전문가 상담
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
              Premium
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            투자 전문가와 1:1 상담으로 맞춤형 투자 조언을 받아보세요.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">이번 달 남은 상담</p>
          <p className="text-2xl font-bold text-primary">
            {remainingConsultations === 999 ? "무제한" : `${remainingConsultations}회`}
          </p>
        </div>
      </div>

      {/* 성공 메시지 */}
      {showSuccess && (
        <Card className="border-emerald-500/50 bg-emerald-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <span>상담 예약이 완료되었습니다!</span>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="experts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="experts">AI 전문가</TabsTrigger>
          <TabsTrigger value="book">상담 예약</TabsTrigger>
          <TabsTrigger value="history">예약 내역</TabsTrigger>
        </TabsList>

        {/* AI 전문가 탭 */}
        <TabsContent value="experts" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {AI_EXPERTS.map((expert) => (
              <AIExpertCard 
                key={expert.id} 
                expert={expert} 
                onSelect={() => setSelectedExpert(expert)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="book" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* 전문가 선택 */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold">AI 전문가 선택</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {AI_EXPERTS.map((expert) => (
                  <Card
                    key={expert.id}
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary/50",
                      selectedExpert?.id === expert.id && "border-primary bg-primary/5"
                    )}
                    onClick={() => setSelectedExpert(expert)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="relative w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border-2 border-border">
                        <Image
                          src={expert.image}
                          alt={expert.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert.id}`
                          }}
                        />
                      </div>
                      <h3 className="font-semibold text-sm">{expert.name}</h3>
                      <p className="text-xs text-muted-foreground">{expert.koreanName}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {expert.title}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 예약 정보 */}
            <Card className="border-border/50 h-fit">
              <CardHeader>
                <CardTitle>예약 정보</CardTitle>
                <CardDescription>상담 일정을 선택하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 선택된 전문가 */}
                {selectedExpert && (
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-sm text-muted-foreground">선택된 전문가</p>
                    <p className="font-medium">{selectedExpert.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedExpert.title}</p>
                  </div>
                )}

                {/* 날짜 선택 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">상담 날짜</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border/50"
                  />
                </div>

                {/* 시간 선택 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">상담 시간</label>
                  <div className="grid grid-cols-3 gap-2">
                    {AVAILABLE_TIMES.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 상담 방식 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">상담 방식</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={selectedType === "video" ? "default" : "outline"}
                      onClick={() => setSelectedType("video")}
                      className="justify-start"
                    >
                      <Video className="mr-2 h-4 w-4" />
                      화상 상담
                    </Button>
                    <Button
                      variant={selectedType === "phone" ? "default" : "outline"}
                      onClick={() => setSelectedType("phone")}
                      className="justify-start"
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      음성 상담
                    </Button>
                  </div>
                </div>

                {/* 예약 버튼 */}
                <Button
                  className="w-full"
                  disabled={!selectedExpert || !selectedDate || !selectedTime || isBooking || remainingConsultations <= 0}
                  onClick={handleBook}
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      예약 중...
                    </>
                  ) : remainingConsultations <= 0 ? (
                    "이번 달 상담 횟수 소진"
                  ) : (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      상담 예약하기
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>예약 내역</CardTitle>
              <CardDescription>진행 중인 상담 및 완료된 상담 내역</CardDescription>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  예약된 상담이 없습니다.
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          {booking.type === "video" ? (
                            <Video className="h-5 w-5 text-primary" />
                          ) : (
                            <Phone className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{booking.consultantName}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.date} {booking.time}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={booking.status === "upcoming" ? "default" : "secondary"}
                      >
                        {booking.status === "upcoming" ? "예정" : booking.status === "completed" ? "완료" : "취소"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// AI 전문가 카드 컴포넌트
function AIExpertCard({ 
  expert, 
  locked = false,
  onSelect 
}: { 
  expert: typeof AI_EXPERTS[0]
  locked?: boolean
  onSelect?: () => void
}) {
  const [imgError, setImgError] = useState(false)
  
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all",
      expert.borderColor,
      !locked && "hover:scale-[1.02] cursor-pointer",
      locked && "opacity-70"
    )}>
      {/* 배경 그라데이션 */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-30",
        expert.color
      )} />
      
      <CardContent className="relative p-6 space-y-4">
        {/* 프로필 영역 */}
        <div className="flex items-center gap-4">
          <div className={cn(
            "relative w-24 h-24 rounded-2xl overflow-hidden border-2 shadow-lg shrink-0 flex items-center justify-center",
            expert.avatarBg,
            expert.id === "claude" && "border-blue-300/50",
            expert.id === "gemini" && "border-orange-300/50",
            expert.id === "gpt" && "border-teal-300/50"
          )}>
            {!imgError ? (
              <Image
                src={expert.image}
                alt={expert.name}
                fill
                className="object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-5xl">{expert.avatarEmoji}</span>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold">{expert.name}</h3>
            <p className={cn(
              "text-sm font-medium",
              expert.id === "claude" && "text-blue-400",
              expert.id === "gemini" && "text-orange-400",
              expert.id === "gpt" && "text-purple-400"
            )}>{expert.koreanName}</p>
            <p className="text-xs text-muted-foreground">{expert.title}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span className="text-sm font-medium">{expert.rating}</span>
            </div>
          </div>
        </div>

        {/* 명언 */}
        <div className={cn(
          "p-4 rounded-xl",
          expert.id === "claude" && "bg-blue-500/10 border border-blue-500/20",
          expert.id === "gemini" && "bg-orange-500/10 border border-orange-500/20",
          expert.id === "gpt" && "bg-purple-500/10 border border-purple-500/20"
        )}>
          <p className={cn(
            "text-lg font-bold mb-1 leading-snug",
            expert.id === "claude" && "text-blue-400",
            expert.id === "gemini" && "text-orange-400",
            expert.id === "gpt" && "text-purple-400"
          )}>
            {expert.quote}
          </p>
          <p className="text-sm text-muted-foreground">
            {expert.subQuote}
          </p>
        </div>

        {/* 설명 */}
        <p className="text-sm text-muted-foreground italic border-l-2 border-muted pl-3">
          {expert.description}
        </p>

        {/* 분석 기준 */}
        <div>
          <p className="text-sm text-muted-foreground mb-3">{expert.analysisTitle}</p>
          <div className="space-y-2.5">
            {expert.analysisItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg",
                  expert.id === "claude" && "bg-blue-500/10",
                  expert.id === "gemini" && "bg-orange-500/10",
                  expert.id === "gpt" && "bg-purple-500/10"
                )}>
                  <item.icon className={cn("h-4 w-4", item.color)} />
                </div>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 추천 기준 */}
        <div className={cn(
          "p-4 rounded-xl",
          expert.id === "claude" && "bg-blue-500/10 border border-blue-500/20",
          expert.id === "gemini" && "bg-orange-500/10 border border-orange-500/20",
          expert.id === "gpt" && "bg-purple-500/10 border border-purple-500/20"
        )}>
          <p className="text-xs text-muted-foreground mb-1">추천 기준</p>
          <p className={cn(
            "text-sm font-semibold",
            expert.id === "claude" && "text-blue-400",
            expert.id === "gemini" && "text-orange-400",
            expert.id === "gpt" && "text-purple-400"
          )}>
            {expert.recommendationType}
          </p>
        </div>

        {/* 버튼 */}
        <Button 
          className={cn("w-full text-white font-semibold h-12", expert.buttonColor)}
          onClick={onSelect}
          disabled={locked}
        >
          {expert.buttonText}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
