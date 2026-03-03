"use client"

import { useState, useEffect } from "react"
import { Copy, Pencil, Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  getPromotionPlatformsListPaginated,
  createPromotionPlatform,
  updatePromotionPlatform,
  deletePromotionPlatform,
  type PromotionPlatformWithClicks,
} from "@/actions/dashboard-promotion"
import { host } from "@/config/config"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { languages, type Locale } from "@/i18n-config"

const PAGE_SIZE_OPTIONS = [10, 20, 50]

interface PromotionFormProps {
  initialList?: PromotionPlatformWithClicks[]
  initialTotal?: number
  initialTotalPages?: number
}

export function PromotionForm({
  initialList,
  initialTotal = 0,
  initialTotalPages = 1,
}: PromotionFormProps) {
  const { toast } = useToast()
  const [list, setList] = useState<PromotionPlatformWithClicks[]>(initialList ?? [])
  const [loading, setLoading] = useState(initialList == null)
  const [actionLoading, setActionLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(initialTotal)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PromotionPlatformWithClicks | null>(null)
  const [form, setForm] = useState({
    platform_key: "",
    name: "",
    utm_source_value: "",
    is_active: true,
  })

  const loadList = async (page: number, size: number) => {
    setLoading(true)
    try {
      const res = await getPromotionPlatformsListPaginated(page, size)
      if (res.success && res.data != null) {
        setList(res.data)
        setTotal(res.total ?? 0)
        setTotalPages(res.totalPages ?? 1)
      } else {
        toast({ title: "加载失败", description: res.error, variant: "destructive" })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialList != null && currentPage === 1 && pageSize === 10) return
    loadList(currentPage, pageSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize])

  const openCreate = () => {
    setEditingId(null)
    setForm({
      platform_key: "",
      name: "",
      utm_source_value: "",
      is_active: true,
    })
    setDialogOpen(true)
  }

  const openEdit = (row: PromotionPlatformWithClicks) => {
    setEditingId(row.id)
    setForm({
      platform_key: row.platform_key,
      name: row.name ?? "",
      utm_source_value: row.utm_source_value,
      is_active: row.is_active,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.platform_key.trim() || !form.utm_source_value.trim()) {
      toast({ title: "请填写", description: "平台标识与 utm_source 值必填", variant: "destructive" })
      return
    }
    setActionLoading(true)
    try {
      if (editingId !== null) {
        const res = await updatePromotionPlatform(editingId, {
          platform_key: form.platform_key.trim(),
          name: form.name.trim() || null,
          utm_source_value: form.utm_source_value.trim(),
          is_active: form.is_active,
        })
        if (res.success) {
          toast({ title: "已更新", description: res.message })
          setDialogOpen(false)
          loadList(currentPage, pageSize)
        } else {
          toast({ title: "更新失败", description: res.error, variant: "destructive" })
        }
      } else {
        const res = await createPromotionPlatform({
          platform_key: form.platform_key.trim(),
          name: form.name.trim() || null,
          utm_source_value: form.utm_source_value.trim(),
          is_active: form.is_active,
        })
        if (res.success) {
          toast({ title: "已添加", description: res.message })
          setDialogOpen(false)
          loadList(currentPage, pageSize)
        } else {
          toast({ title: "添加失败", description: res.error, variant: "destructive" })
        }
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setActionLoading(true)
    try {
      const res = await deletePromotionPlatform(deleteTarget.id)
      if (res.success) {
        toast({ title: "已删除", description: res.message })
        setDeleteDialogOpen(false)
        setDeleteTarget(null)
        loadList(currentPage, pageSize)
      } else {
        toast({ title: "删除失败", description: res.error, variant: "destructive" })
      }
    } finally {
      setActionLoading(false)
    }
  }

  const base = host.endsWith("/") ? host.slice(0, -1) : host

  const getPromotionUrl = (row: PromotionPlatformWithClicks, locale: Locale) =>
    `${base}/${locale}?utm_source=${row.utm_source_value}`

  const getDisplayUrl = (row: PromotionPlatformWithClicks) => getPromotionUrl(row, "en")

  const copyUrlForLocale = (row: PromotionPlatformWithClicks, locale: Locale) => {
    const url = getPromotionUrl(row, locale)
    navigator.clipboard.writeText(url).then(
      () => toast({ title: "已复制", description: `${languages[locale]} 推广链接已复制到剪贴板` }),
      () => toast({ title: "复制失败", variant: "destructive" })
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>推广平台</CardTitle>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            添加平台
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>平台标识</TableHead>
                <TableHead>utm_source</TableHead>
                <TableHead>推广链接</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    暂无推广平台，点击「添加平台」创建
                  </TableCell>
                </TableRow>
              ) : (
                list.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name || "—"}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{row.platform_key}</code>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{row.utm_source_value}</code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 max-w-[280px]">
                        <span className="truncate text-sm text-muted-foreground" title={getDisplayUrl(row)}>
                          {getDisplayUrl(row)}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {(Object.keys(languages) as Locale[]).map((locale) => (
                              <DropdownMenuItem
                                key={locale}
                                onClick={() => copyUrlForLocale(row, locale)}
                              >
                                {languages[locale]}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={row.is_active ? "default" : "secondary"}>
                        {row.is_active ? "启用" : "停用"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="mr-2" onClick={() => openEdit(row)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDeleteTarget(row)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              共 {total} 条
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">每页</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} 条
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                第 {currentPage} / {totalPages} 页
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || loading}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || loading}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId !== null ? "编辑推广平台URL" : "添加推广平台URL"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>平台标识 (platform_key)</Label>
              <Input
                className="border-border"
                value={form.platform_key}
                onChange={(e) => setForm((f) => ({ ...f, platform_key: e.target.value }))}
                placeholder="如 wechat"
                disabled={editingId !== null}
              />
            </div>
            <div className="grid gap-2">
              <Label>显示名称</Label>
              <Input
                className="border-border"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="如 微信公众号"
              />
            </div>
            <div className="grid gap-2">
              <Label>utm_source 值（即链接参数，只填 xxx，对应 ?utm_source=xxx）</Label>
              <Input
                className="border-border"
                value={form.utm_source_value}
                onChange={(e) => setForm((f) => ({ ...f, utm_source_value: e.target.value }))}
                placeholder="如 weixin、douyin"
              />
            </div>
            <div className="grid gap-2">
              <Label>启用</Label>
              <RadioGroup
                value={form.is_active ? "是" : "否"}
                onValueChange={(v) => setForm((f) => ({ ...f, is_active: v === "是" }))}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="是" id="enable-yes" />
                  <Label htmlFor="enable-yes" className="font-normal cursor-pointer">是</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="否" id="enable-no" />
                  <Label htmlFor="enable-no" className="font-normal cursor-pointer">否</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={actionLoading}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={actionLoading}>
              {actionLoading ? "提交中..." : editingId !== null ? "保存" : "添加"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除？</AlertDialogTitle>
            <AlertDialogDescription>
              将删除推广平台「{deleteTarget?.name || deleteTarget?.platform_key}」及其所有点击记录，此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

