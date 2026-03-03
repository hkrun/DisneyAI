import { NextRequest, NextResponse } from "next/server"
import { recordPromotionClick } from "@/actions/dashboard-promotion"

function getIpFromRequest(request: NextRequest): string {
  const cfIp = request.headers.get("cf-connecting-ip")
  if (cfIp) return cfIp
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) return forwardedFor.split(",")[0].trim()
  const realIp = request.headers.get("x-real-ip")
  if (realIp) return realIp
  return "unknown"
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const value = (body?.utm_source ?? body?.utm_source_value ?? "").toString().trim()
    if (!value) {
      return NextResponse.json({ success: true, recorded: false }, { status: 200 })
    }
    const ip = getIpFromRequest(request)
    const res = await recordPromotionClick({ utm_source_value: value, ip })
    return NextResponse.json({ success: res.success, recorded: res.recorded ?? false }, { status: 200 })
  } catch (e) {
    console.error("promotion click error:", e)
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 })
  }
}

