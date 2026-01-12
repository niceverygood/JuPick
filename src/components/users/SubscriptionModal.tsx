"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2, CalendarIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SERVICE_LABELS, SERVICE_ICONS, QUICK_SELECT_DAYS } from "@/lib/constants"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface SubscriptionModalProps {
  open: boolean
  onClose: () => void
  type: "create" | "extend"
  userId: string
  serviceType?: string
  subscriptionId?: string
  currentEndDate?: Date
}

export function SubscriptionModal({
  open,
  onClose,
  type,
  userId,
  serviceType: initialServiceType,
  subscriptionId,
  currentEndDate,
}: SubscriptionModalProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [selectedServiceType, setSelectedServiceType] = useState(initialServiceType || "STOCK")
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(() => {
    const d = new Date()
    d.setDate(d.getDate() + 29)
    return d
  })
  const [isFreeTest, setIsFreeTest] = useState(false)

  const userRole = session?.user?.role
  const isMaster = userRole === "MASTER"

  const handleQuickSelect = (days: number) => {
    if (type === "extend" && currentEndDate) {
      const newEndDate = new Date(currentEndDate)
      newEndDate.setDate(newEndDate.getDate() + days)
      setEndDate(newEndDate)
    } else {
      const newEndDate = new Date(startDate)
      newEndDate.setDate(startDate.getDate() + days - 1)
      setEndDate(newEndDate)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      if (type === "create") {
        const res = await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            serviceType: selectedServiceType,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            isFreeTest,
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "구독 생성에 실패했습니다.")
        }

        toast({ title: "성공", description: "구독이 생성되었습니다.", variant: "success" })
      } else {
        // Extend subscription
        const res = await fetch(`/api/subscriptions/${subscriptionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endDate: endDate.toISOString() }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "구독 연장에 실패했습니다.")
        }

        toast({ title: "성공", description: "구독이 연장되었습니다.", variant: "success" })
      }

      router.refresh()
      onClose()
    } catch (error) {
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "처리에 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const days = Math.ceil((endDate.getTime() - (type === "extend" && currentEndDate ? new Date(currentEndDate).getTime() : startDate.getTime())) / (1000 * 60 * 60 * 24)) + (type === "extend" ? 0 : 1)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === "create" ? "➕ 구독 추가" : "📅 구독 연장"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Type Selection - Only for create */}
          {type === "create" && !initialServiceType && (
            <div className="space-y-2">
              <Label>서비스 선택</Label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(SERVICE_LABELS).map(([sType, label]) => (
                  <Button
                    key={sType}
                    type="button"
                    variant={selectedServiceType === sType ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setSelectedServiceType(sType)}
                  >
                    {SERVICE_ICONS[sType]} {label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Date Selection */}
          <div className="space-y-4">
            {type === "create" && (
              <div className="space-y-2">
                <Label>시작일</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDate(startDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="space-y-2">
              <Label>
                {type === "extend" ? "연장 후 종료일" : "종료일"}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate(endDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    disabled={(date) => date < (type === "extend" && currentEndDate ? new Date(currentEndDate) : startDate)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>빠른 선택</Label>
              <div className="flex gap-2">
                {QUICK_SELECT_DAYS.map((d) => (
                  <Button
                    key={d}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSelect(d)}
                  >
                    {d}일
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Free Test Checkbox - Only for master on create */}
          {type === "create" && isMaster && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="freeTest"
                checked={isFreeTest}
                onCheckedChange={(checked) => setIsFreeTest(checked as boolean)}
              />
              <Label htmlFor="freeTest" className="cursor-pointer">
                무료 테스트로 발급 (정산 제외)
              </Label>
            </div>
          )}

          {/* Summary */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="font-medium">📋 요약</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                • 서비스: {SERVICE_LABELS[selectedServiceType]}
              </li>
              <li>
                • {type === "extend" ? `연장 일수: ${days}일` : `기간: ${days}일`}
              </li>
              {type === "extend" && currentEndDate && (
                <li>
                  • 기존 종료일: {formatDate(currentEndDate)}
                </li>
              )}
              <li>
                • {type === "extend" ? "연장 후 종료일" : "종료일"}: {formatDate(endDate)}
              </li>
              {isFreeTest && (
                <li className="text-violet-500">• 무료 테스트 (정산 제외)</li>
              )}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : (
              "확인"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


