import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/postgres-client'

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp
  // @ts-ignore
  return (req as any).ip || '0.0.0.0'
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const action: string = body?.action || 'unknown'
    const params = body?.params ?? {}
    const result = body?.result ?? {}
    const ip = getClientIp(request)

    await sql`
      INSERT INTO nf_naming_tasks (user_id, action, params, result, ip)
      VALUES (${userId}, ${action}, ${JSON.stringify(params)}, ${JSON.stringify(result)}, ${ip})
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('record naming task error:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}


