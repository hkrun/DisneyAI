"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { type PromotionStatItem } from "@/actions/dashboard-promotion"

const TIMEZONE = "Asia/Shanghai"

function getTodayShanghai(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE })
}

function addDays(dateStr: string, delta: number): string {
  const d = new Date(dateStr + "T12:00:00Z")
  d.setUTCDate(d.getUTCDate() + delta)
  return d.toISOString().slice(0, 10)
}

type Preset = "all" | "today" | "3d" | "7d" | "30d" | "custom"

function getRangeForPreset(preset: Preset): { start: string; end: string } {
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

interface PromotionStatsFormProps {
  initialData?: PromotionStatItem[]
  initialTotalClicks?: number
}

export function PromotionStatsForm({
  initialData: initialDataProp,
  initialTotalClicks = 0,
}: PromotionStatsFormProps = {}) {
  const { toast } = useToast()
  const [preset, setPreset] = useState<Preset>("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [data, setData] = useState<PromotionStatItem[]>(initialDataProp ?? [])
  const [totalClicks, setTotalClicks] = useState(initialTotalClicks)
  const [loading, setLoading] = useState(initialDataProp == null)

  const loadStats = useCallback(
    async (start?: string, end?: string) => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (start) params.set("start", start)
        if (end) params.set("end", end)
        const res = await fetch(`/api/promotion/stats?${params}`)
        const json = await res.json()
        if (res.ok && json.success && json.data != null) {
          setData(json.data)
          setTotalClicks(json.totalClicks ?? 0)
        } else {
          toast({ title: "加载失败", description: json.error ?? "请求失败", variant: "destructive" })
        }
      } finally {
        setLoading(false)
      }
    },
    [toast]
  )

  useEffect(() => {
    if (preset === "all") {
      if (initialDataProp != null) {
        setData(initialDataProp)
        setTotalClicks(initialTotalClicks)
        setLoading(false)
        return
      }
      loadStats()
    } else if (preset === "custom") {
      if (startDate && endDate) {
        loadStats(startDate, endDate)
      } else {
        setData([])
        setTotalClicks(0)
      }
    } else {
      const { start, end } = getRangeForPreset(preset)
      loadStats(start, end)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, startDate, endDate, loadStats])

  const handlePreset = (p: Preset) => {
    if (p !== "all" || initialDataProp == null) setLoading(true)
    setPreset(p)
    if (p !== "custom") {
      const { start, end } = getRangeForPreset(p)
      setStartDate(start)
      setEndDate(end)
    }
  }

  const rangeLabel =
    preset === "all"
      ? "全部"
      : preset === "custom"
        ? `${startDate} ～ ${endDate}`
        : startDate === endDate
          ? startDate
          : `${startDate} ～ ${endDate}`

  const handleCustomQuery = () => {
    if (startDate && endDate && startDate <= endDate) {
      setLoading(true)
      setPreset("custom")
      loadStats(startDate, endDate)
    } else {
      toast({ title: "请选择有效日期范围", variant: "destructive" })
    }
  }

  const handleQuery = () => {
    setLoading(true)
    if (preset === "all") {
      loadStats("", "")
    } else if (preset === "custom") {
      if (startDate && endDate && startDate <= endDate) {
        loadStats(startDate, endDate)
      } else {
        toast({ title: "请选择有效日期范围", variant: "destructive" })
      }
    } else {
      const { start, end } = getRangeForPreset(preset)
      loadStats(start, end)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>统计区间</CardTitle>
          <p className="text-sm text-muted-foreground">按北京时区（Asia/Shanghai）统计</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">快捷：</span>
            <Button
              variant={preset === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => handlePreset("all")}
            >
              全部
            </Button>
            <Button
              variant={preset === "today" ? "default" : "outline"}
              size="sm"
              onClick={() => handlePreset("today")}
            >
              今日
            </Button>
            <Button
              variant={preset === "3d" ? "default" : "outline"}
              size="sm"
              onClick={() => handlePreset("3d")}
            >
              三天
            </Button>
            <Button
              variant={preset === "7d" ? "default" : "outline"}
              size="sm"
              onClick={() => handlePreset("7d")}
            >
              一周
            </Button>
            <Button
              variant={preset === "30d" ? "default" : "outline"}
              size="sm"
              onClick={() => handlePreset("30d")}
            >
              一个月
            </Button>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div className="grid gap-1">
              <Label className="text-sm">开始日期</Label>
              <Input
                type="date"
                className="w-[140px] border-border"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-sm">结束日期</Label>
              <Input
                type="date"
                className="w-[140px] border-border"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button size="sm" variant="secondary" onClick={handleCustomQuery}>
              自定义查询
            </Button>
            <Button size="sm" onClick={handleQuery} disabled={loading}>
              查询
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">当前区间：{rangeLabel}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>各平台点击统计</CardTitle>
          <p className="text-sm text-muted-foreground">
            总点击次数：
            <span className="font-semibold text-foreground">{totalClicks}</span>
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <div className="h-10 bg-muted rounded animate-pulse" />
              <div className="h-64 bg-muted rounded animate-pulse" />
            </div>
          ) : data.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8">该时间范围内暂无点击记录</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>平台名称</TableHead>
                  <TableHead>utm_source</TableHead>
                  <TableHead>点击次数</TableHead>
                  <TableHead>占比</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.platform_id}>
                    <TableCell className="font-medium">
                      {row.platform_name ?? row.platform_key}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {row.utm_source_value}
                      </code>
                    </TableCell>
                    <TableCell>{row.click_count}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {totalClicks > 0 ? ((row.click_count / totalClicks) * 100).toFixed(1) : "0"}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

