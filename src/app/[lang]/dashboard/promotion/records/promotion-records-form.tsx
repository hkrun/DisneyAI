"use client"

import { useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type PromotionClickRecord, type PromotionPlatformWithClicks } from "@/actions/dashboard-promotion"

const TIMEZONE = "Asia/Shanghai"

function getTodayShanghai(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE })
}

function addDays(dateStr: string, delta: number): string {
  const d = new Date(dateStr + "T12:00:00Z")
  d.setUTCDate(d.getUTCDate() + delta)
  return d.toISOString().slice(0, 10)
}

type DatePreset = "all" | "today" | "3d" | "7d" | "30d" | "custom"

function getRangeForPreset(preset: DatePreset): { start: string; end: string } {
  if (preset === "all") return { start: "", end: "" }
  const end = getTodayShanghai()
  switch (preset) {
    case "today": return { start: end, end }
    case "3d": return { start: addDays(end, -2), end }
    case "7d": return { start: addDays(end, -6), end }
    case "30d": return { start: addDays(end, -29), end }
    default: return { start: end, end }
  }
}

interface PromotionRecordsFormProps {
  initialPlatforms?: PromotionPlatformWithClicks[]
  initialRecords?: PromotionClickRecord[]
  initialTotal?: number
  initialTotalPages?: number
}

const PAGE_SIZE_OPTIONS = [10, 20, 50]

export function PromotionRecordsForm({
  initialPlatforms,
  initialRecords,
  initialTotal = 0,
  initialTotalPages = 1,
}: PromotionRecordsFormProps) {
  const { toast } = useToast()
  const [records, setRecords] = useState<PromotionClickRecord[]>(initialRecords ?? [])
  const [platforms, setPlatforms] = useState<PromotionPlatformWithClicks[]>(initialPlatforms ?? [])
  const [loading, setLoading] = useState(initialRecords == null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(initialTotal)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [platformIdFilter, setPlatformIdFilter] = useState<string>("all")
  const [datePreset, setDatePreset] = useState<DatePreset>("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const hasSkippedInitial = useRef(false)

  const loadPage = async (page: number, size: number, opts?: { platformId?: number; startDate?: string; endDate?: string }) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(size) })
      if (opts?.platformId != null) params.set("platformId", String(opts.platformId))
      if (opts?.startDate) params.set("startDate", opts.startDate)
      if (opts?.endDate) params.set("endDate", opts.endDate)
      const res = await fetch(`/api/promotion/records?${params}`)
      const json = await res.json()
      if (res.ok && json.success) {
        if (json.platforms) setPlatforms(json.platforms)
        if (json.records != null) {
          setRecords(json.records)
          setTotal(json.total ?? 0)
          setTotalPages(json.totalPages ?? 1)
        }
      } else {
        toast({ title: "加载失败", description: json.error ?? "请求失败", variant: "destructive" })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const isInitialState =
      currentPage === 1 && pageSize === 10 && platformIdFilter === "all" && !startDate && !endDate
    if (initialRecords != null && isInitialState && !hasSkippedInitial.current) {
      hasSkippedInitial.current = true
      return
    }
    const platformId = platformIdFilter === "all" ? undefined : parseInt(platformIdFilter, 10)
    loadPage(currentPage, pageSize, {
      platformId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, platformIdFilter, startDate, endDate])

  const handleDatePreset = (preset: DatePreset) => {
    setLoading(true)
    setDatePreset(preset)
    const { start, end } = getRangeForPreset(preset)
    setStartDate(start)
    setEndDate(end)
    setCurrentPage(1)
  }

  const handleFilterChange = (value: string) => {
    setLoading(true)
    setPlatformIdFilter(value)
    setCurrentPage(1)
  }

  const handlePageSizeChange = (value: string) => {
    setLoading(true)
    setPageSize(Number(value))
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setLoading(true)
    setCurrentPage(page)
  }

  const handleQuery = () => {
    const platformId = platformIdFilter === "all" ? undefined : parseInt(platformIdFilter, 10)
    loadPage(currentPage, pageSize, {
      platformId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
          <CardTitle>点击记录</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">日期：</span>
              <Button
                variant={datePreset === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDatePreset("all")}
              >
                全部
              </Button>
              <Button
                variant={datePreset === "today" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDatePreset("today")}
              >
                今日
              </Button>
              <Button
                variant={datePreset === "3d" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDatePreset("3d")}
              >
                三天
              </Button>
              <Button
                variant={datePreset === "7d" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDatePreset("7d")}
              >
                一周
              </Button>
              <Button
                variant={datePreset === "30d" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDatePreset("30d")}
              >
                一月
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Label className="text-sm whitespace-nowrap">开始日期</Label>
              <Input
                type="date"
                className="w-[140px] border-border"
                value={startDate}
                onChange={(e) => {
                  setLoading(true)
                  setDatePreset("custom")
                  setStartDate(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
            <div className="flex items-center gap-1">
              <Label className="text-sm whitespace-nowrap">结束日期</Label>
              <Input
                type="date"
                className="w-[140px] border-border"
                value={endDate}
                onChange={(e) => {
                  setLoading(true)
                  setDatePreset("custom")
                  setEndDate(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
            <Select value={platformIdFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="全部平台" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部平台</SelectItem>
                {platforms.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name || p.platform_key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleQuery} disabled={loading}>
              查询
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded" />
              <div className="h-64 bg-muted rounded" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>平台</TableHead>
                    <TableHead>utm_source</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        暂无记录
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.platform_name ?? "—"}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {r.utm_source_value}
                          </code>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{r.ip ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(r.created_at).toLocaleString("zh-CN")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">共 {total} 条</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">每页</span>
                  <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
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
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || loading}
                  >
                    上一页
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || loading}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

