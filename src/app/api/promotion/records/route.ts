import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getPromotionRecordsPageData } from "@/actions/dashboard-promotion"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.userId !== process.env.APP_ROLE_ADMIN) {
      return NextResponse.json({ error: "无权访问" }, { status: 403 })
    }
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get("page") ?? "1", 10)
    const pageSize = parseInt(searchParams.get("pageSize") ?? "10", 10)
    const platformIdParam = searchParams.get("platformId")
    const platformId = platformIdParam ? parseInt(platformIdParam, 10) : undefined
    const startDate = searchParams.get("startDate") ?? undefined
    const endDate = searchParams.get("endDate") ?? undefined

    const res = await getPromotionRecordsPageData(page, pageSize, {
      platformId: Number.isNaN(platformId ?? 0) ? undefined : platformId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })

    if (res.success) {
      return NextResponse.json({
        success: true,
        platforms: res.platforms ?? [],
        records: res.records ?? [],
        total: res.total ?? 0,
        totalPages: res.totalPages ?? 1,
      })
    }
    return NextResponse.json({ success: false, error: res.error }, { status: 500 })
  } catch (e) {
    console.error("promotion records API error:", e)
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 })
  }
}

