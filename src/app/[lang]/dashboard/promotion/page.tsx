import { PromotionForm } from "./promotion-form"
import { getPromotionPlatformsListPaginated } from "@/actions/dashboard-promotion"

export default async function Page() {
  const res = await getPromotionPlatformsListPaginated(1, 10)
  const initialList = res.success ? res.data ?? [] : []
  const initialTotal = res.success ? res.total ?? 0 : 0
  const initialTotalPages = res.success ? res.totalPages ?? 1 : 1

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">平台设置</h1>
        <p className="text-muted-foreground">
          管理推广平台与对应链接，使用 utm_source 追踪来源；用户通过推广链接访问时记录一次点击。
        </p>
      </div>
      <PromotionForm
        initialList={initialList}
        initialTotal={initialTotal}
        initialTotalPages={initialTotalPages}
      />
    </div>
  )
}

