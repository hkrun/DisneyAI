import { PromotionStatsForm } from "./promotion-stats-form"
import { getPromotionStatsByDateRange } from "@/actions/dashboard-promotion"

export default async function Page() {
  const res = await getPromotionStatsByDateRange("", "")
  const initialData = res.success ? res.data ?? [] : []
  const initialTotalClicks = res.success ? res.totalClicks ?? 0 : 0

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">推广统计</h1>
        <p className="text-muted-foreground">
          按时间范围查看各平台点击数量，默认显示全部，支持快捷区间（北京时区）。
        </p>
      </div>
      <PromotionStatsForm initialData={initialData} initialTotalClicks={initialTotalClicks} />
    </div>
  )
}

