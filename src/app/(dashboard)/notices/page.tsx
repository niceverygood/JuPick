"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Plus, Pin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Notice {
  id: string
  title: string
  content: string
  isPinned: boolean
  isPublished: boolean
  createdAt: string
  author: {
    id: string
    loginId: string
    name: string
  }
}

export default function NoticesPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  
  const [notices, setNotices] = useState<Notice[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null)
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isPinned: false,
  })
  const [isSaving, setIsSaving] = useState(false)

  const isMaster = session?.user?.role === "MASTER"

  useEffect(() => {
    fetchNotices()
  }, [page])

  const fetchNotices = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/notices?page=${page}&limit=10`)
      const data = await res.json()
      setNotices(data.notices)
      setTotal(data.total)
    } catch (error) {
      console.error("Failed to fetch notices:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.title || !formData.content) {
      toast({ title: "오류", description: "제목과 내용을 입력해주세요.", variant: "destructive" })
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to create notice")

      toast({ title: "성공", description: "공지사항이 등록되었습니다.", variant: "success" })
      setCreateModalOpen(false)
      setFormData({ title: "", content: "", isPinned: false })
      fetchNotices()
    } catch {
      toast({ title: "오류", description: "공지사항 등록에 실패했습니다.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return

    try {
      const res = await fetch(`/api/notices/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete notice")

      toast({ title: "성공", description: "공지사항이 삭제되었습니다.", variant: "success" })
      setSelectedNotice(null)
      fetchNotices()
    } catch {
      toast({ title: "오류", description: "공지사항 삭제에 실패했습니다.", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">📢 공지사항</h1>
          <p className="text-muted-foreground">
            플랫폼 공지사항을 확인하세요.
          </p>
        </div>
        {isMaster && (
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            새 공지 작성
          </Button>
        )}
      </div>

      {/* Notices List */}
      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : notices.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              등록된 공지사항이 없습니다.
            </div>
          ) : (
            <div className="divide-y">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className="flex cursor-pointer items-start gap-4 p-4 hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedNotice(notice)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {notice.isPinned && (
                        <Pin className="h-4 w-4 text-primary" />
                      )}
                      <h3 className="font-medium">{notice.title}</h3>
                      {notice.isPinned && (
                        <Badge variant="default" className="text-xs">
                          고정
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {notice.content}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{notice.author?.name || notice.author?.loginId}</span>
                      <span>•</span>
                      <span>{formatDate(notice.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 10 && (
            <div className="flex items-center justify-center gap-2 border-t p-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                이전
              </Button>
              <span className="text-sm text-muted-foreground">
                페이지 {page} / {Math.ceil(total / 10)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / 10)}
              >
                다음
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>📝 새 공지 작성</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="공지사항 제목을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="공지사항 내용을 입력하세요"
                className="min-h-[200px] w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isPinned"
                checked={formData.isPinned}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isPinned: checked as boolean }))
                }
              />
              <Label htmlFor="isPinned" className="cursor-pointer">
                상단 고정
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreate} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  등록 중...
                </>
              ) : (
                "등록"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={!!selectedNotice} onOpenChange={() => setSelectedNotice(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNotice?.isPinned && <Pin className="h-4 w-4 text-primary" />}
              {selectedNotice?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <span>{selectedNotice?.author?.name || selectedNotice?.author?.loginId}</span>
              <span className="mx-2">•</span>
              <span>{selectedNotice && formatDate(selectedNotice.createdAt)}</span>
            </div>
            <div className="whitespace-pre-wrap text-sm">
              {selectedNotice?.content}
            </div>
          </div>
          <DialogFooter>
            {isMaster && selectedNotice && (
              <Button
                variant="destructive"
                onClick={() => handleDelete(selectedNotice.id)}
              >
                삭제
              </Button>
            )}
            <Button variant="outline" onClick={() => setSelectedNotice(null)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


