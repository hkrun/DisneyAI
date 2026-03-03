import { PromotionRecordsForm } from "./promotion-records-form"
import { getPromotionRecordsPageData } from "@/actions/dashboard-promotion"

export default async function Page() {
  const res = await getPromotionRecordsPageData(1, 10, {})
  const initialPlatforms = res.success ? res.platforms ?? [] : []
  const initialRecords = res.success ? res.records ?? [] : []
  const initialTotal = res.success ? res.total ?? 0 : 0
  const initialTotalPages = res.success ? res.totalPages ?? 1 : 1

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">平台记录</h1>
        <p className="text-muted-foreground">查看各推广来源的点击记录，可按平台筛选。</p>
      </div>
      <PromotionRecordsForm
        initialPlatforms={initialPlatforms}
        initialRecords={initialRecords}
        initialTotal={initialTotal}
        initialTotalPages={initialTotalPages}
      />
    </div>
  )
}

