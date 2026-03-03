import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getPromotionStatsByDateRange } from "@/actions/dashboard-promotion"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.userId !== process.env.APP_ROLE_ADMIN) {
      return NextResponse.json({ error: "无权访问" }, { status: 403 })
    }
    const { searchParams } = request.nextUrl
    const start = searchParams.get("start") ?? ""
    const end = searchParams.get("end") ?? ""
    const res = await getPromotionStatsByDateRange(start, end)
    if (res.success) {
      return NextResponse.json({
        success: true,
        data: res.data ?? [],
        totalClicks: res.totalClicks ?? 0,
      })
    }
    return NextResponse.json({ success: false, error: res.error }, { status: 500 })
  } catch (e) {
    console.error("promotion stats API error:", e)
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 })
  }
}

