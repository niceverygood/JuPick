'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  AlertTriangle,
  DollarSign,
  History,
  RefreshCw
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { toast } from 'sonner'

// 확인 다이얼로그 컴포넌트
function ConfirmDialog({
  trigger,
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
}: {
  trigger: React.ReactNode
  title: React.ReactNode
  description: React.ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
}) {
  const [open, setOpen] = useState(false)

  const handleConfirm = () => {
    onConfirm()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription asChild>
            <div>{description}</div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{cancelText}</Button>
          </DialogClose>
          <Button onClick={handleConfirm} className="bg-emerald-500 hover:bg-emerald-600">
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ConfirmedSettlement {
  id: string
  distributorId: string
  periodStart: string
  periodEnd: string
  totalDays: number
  dailyRate: number
  totalAmount: number
  isPaid: boolean
  paidAt: string | null
  createdAt: string
}

interface SettlementConfirmationProps {
  periodStart: Date
  periodEnd: Date
  totalAmount: number
  totalDays: number
  settlementsCount: number
  onConfirm?: () => void
}

export function SettlementConfirmation({
  periodStart,
  periodEnd,
  totalAmount,
  totalDays,
  settlementsCount,
  onConfirm
}: SettlementConfirmationProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      const res = await fetch('/api/settlements/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodStart: periodStart.toISOString(),
          periodEnd: periodEnd.toISOString(),
        }),
      })

      const data = await res.json()

      if (data.success) {
        setIsConfirmed(true)
        toast.success(`정산 확정 완료: ${data.settlementsCreated}건`)
        onConfirm?.()
      } else {
        toast.error(data.error || '정산 확정에 실패했습니다.')
      }
    } catch (error) {
      toast.error('정산 확정 중 오류가 발생했습니다.')
    } finally {
      setIsConfirming(false)
    }
  }

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
  }

  return (
    <Card className="border-emerald-500/30 bg-emerald-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <CardTitle className="text-lg">정산 확정</CardTitle>
          </div>
          {isConfirmed && (
            <Badge className="bg-emerald-500">확정 완료</Badge>
          )}
        </div>
        <CardDescription>
          해당 기간의 정산을 확정하면 더 이상 수정할 수 없습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 정산 요약 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-background/50 rounded-lg">
              <p className="text-xs text-muted-foreground">정산 기간</p>
              <p className="font-medium text-sm">
                {formatDate(periodStart)} ~ {formatDate(periodEnd)}
              </p>
            </div>
            <div className="p-3 bg-background/50 rounded-lg">
              <p className="text-xs text-muted-foreground">총판 수</p>
              <p className="font-medium">{settlementsCount}개</p>
            </div>
            <div className="p-3 bg-background/50 rounded-lg">
              <p className="text-xs text-muted-foreground">총 이용일</p>
              <p className="font-medium">{totalDays}일</p>
            </div>
            <div className="p-3 bg-background/50 rounded-lg">
              <p className="text-xs text-muted-foreground">총 정산액</p>
              <p className="font-bold text-emerald-400">{formatCurrency(totalAmount)}</p>
            </div>
          </div>

          {/* 확정 버튼 */}
          <div className="flex justify-end">
            <ConfirmDialog
              trigger={
                <Button 
                  className="bg-emerald-500 hover:bg-emerald-600"
                  disabled={isConfirming || isConfirmed || totalAmount === 0}
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      확정 중...
                    </>
                  ) : isConfirmed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      확정됨
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      정산 확정
                    </>
                  )}
                </Button>
              }
              title={
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  정산 확정 확인
                </span>
              }
              description={
                <>
                  <span className="font-semibold text-white">
                    {formatDate(periodStart)} ~ {formatDate(periodEnd)}
                  </span>
                  {' '}기간의 정산을 확정하시겠습니까?
                  <br /><br />
                  <span className="text-emerald-400 font-bold">
                    총 {formatCurrency(totalAmount)}
                  </span>
                  {' '}({settlementsCount}개 총판)
                  <br /><br />
                  <span className="text-amber-400 text-sm">
                    ⚠️ 확정 후에는 수정할 수 없습니다.
                  </span>
                </>
              }
              confirmText="확정하기"
              onConfirm={handleConfirm}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * 확정된 정산 내역 컴포넌트
 */
export function ConfirmedSettlementsHistory() {
  const [settlements, setSettlements] = useState<ConfirmedSettlement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all')

  useEffect(() => {
    fetchSettlements()
  }, [filter])

  const fetchSettlements = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.set('isPaid', filter === 'paid' ? 'true' : 'false')
      }
      params.set('limit', '20')

      const res = await fetch(`/api/settlements/confirm?${params}`)
      const data = await res.json()
      setSettlements(data.settlements || [])
    } catch (error) {
      console.error('Failed to fetch settlements:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsPaid = async (settlementId: string) => {
    try {
      const res = await fetch('/api/settlements/confirm', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settlementId }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('지급 완료 처리되었습니다.')
        fetchSettlements()
      } else {
        toast.error(data.error || '지급 처리에 실패했습니다.')
      }
    } catch (error) {
      toast.error('지급 처리 중 오류가 발생했습니다.')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
  }

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">확정된 정산 내역</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchSettlements}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <select 
              className="px-3 py-1 text-sm bg-background border border-border rounded-md"
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'unpaid' | 'paid')}
            >
              <option value="all">전체</option>
              <option value="unpaid">미지급</option>
              <option value="paid">지급완료</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            로딩 중...
          </div>
        ) : settlements.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            확정된 정산 내역이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="py-3 text-left font-medium text-muted-foreground">정산 기간</th>
                  <th className="py-3 text-right font-medium text-muted-foreground">이용일수</th>
                  <th className="py-3 text-right font-medium text-muted-foreground">단가</th>
                  <th className="py-3 text-right font-medium text-muted-foreground">정산액</th>
                  <th className="py-3 text-center font-medium text-muted-foreground">상태</th>
                  <th className="py-3 text-center font-medium text-muted-foreground">확정일</th>
                  <th className="py-3 text-center font-medium text-muted-foreground">액션</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((settlement) => (
                  <tr key={settlement.id} className="border-b border-border/30 hover:bg-muted/30">
                    <td className="py-3">
                      <span className="font-medium">
                        {formatDate(settlement.periodStart)} ~ {formatDate(settlement.periodEnd)}
                      </span>
                    </td>
                    <td className="py-3 text-right">{settlement.totalDays}일</td>
                    <td className="py-3 text-right text-muted-foreground">
                      {formatCurrency(settlement.dailyRate)}/일
                    </td>
                    <td className="py-3 text-right">
                      <span className="font-bold text-emerald-400">
                        {formatCurrency(settlement.totalAmount)}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      {settlement.isPaid ? (
                        <Badge className="bg-emerald-500">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          지급완료
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-400 border-amber-400">
                          <Clock className="w-3 h-3 mr-1" />
                          미지급
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 text-center text-sm text-muted-foreground">
                      {formatDate(settlement.createdAt)}
                    </td>
                    <td className="py-3 text-center">
                      {!settlement.isPaid && (
                        <ConfirmDialog
                          trigger={
                            <Button variant="outline" size="sm">
                              <DollarSign className="w-4 h-4 mr-1" />
                              지급
                            </Button>
                          }
                          title="지급 완료 처리"
                          description={`${formatCurrency(settlement.totalAmount)}을 지급 완료 처리하시겠습니까?`}
                          confirmText="지급 완료"
                          onConfirm={() => handleMarkAsPaid(settlement.id)}
                        />
                      )}
                      {settlement.isPaid && settlement.paidAt && (
                        <span className="text-xs text-muted-foreground">
                          {formatDate(settlement.paidAt)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

