import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { findUserCreditsByUserId } from '@/actions/user'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const preferredRegion = ['hkg1','sin1']

// 允许的图片/视频类型与大小
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
const ALLOWED_VIDEO_TYPES = ['video/mp4','video/avi','video/mov','video/wmv','video/flv','video/webm','video/mkv','video/ts','video/mpg']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_VIDEO_SIZE = 120 * 1024 * 1024 // 120MB

function getExtFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return ext
}

function getDatePath(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}/${mm}/${dd}`
}

export async function POST(request: NextRequest) {
  try {
    // 检查用户认证状态
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { 
          success: false,
          error: '请先登录后再上传文件' 
        },
        { status: 401 }
      )
    }

    // 检查用户积分
    const userCredits = await findUserCreditsByUserId(session.user.id)
    if (userCredits < 1) {
      return NextResponse.json(
        { 
          success: false,
          error: '积分不足，需要至少1积分才能上传文件。请购买积分或升级订阅计划。' 
        },
        { status: 402 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const filename = (body.filename as string) || ''
    const contentType = (body.contentType as string) || ''
    const fileSize = Number(body.fileSize || 0)

    if (!filename || !contentType) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数：filename 或 contentType' },
        { status: 400 }
      )
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(contentType)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(contentType)
    if (!isImage && !isVideo) {
      return NextResponse.json(
        { success: false, error: '不支持的文件类型（仅支持 JPG/PNG 或常见视频格式）' },
        { status: 400 }
      )
    }

    if (fileSize > 0) {
      if (isImage && fileSize > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { success: false, error: '图片大小不能超过5MB' },
          { status: 400 }
        )
      }
      if (isVideo && fileSize > MAX_VIDEO_SIZE) {
        return NextResponse.json(
          { success: false, error: '视频大小不能超过120MB' },
          { status: 400 }
        )
      }
    }

    const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID || ''
    const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET || ''
    const bucket = process.env.ALIYUN_OSS_BUCKET || ''
    const endpoint = process.env.ALIYUN_OSS_ENDPOINT || 'oss-cn-shanghai.aliyuncs.com'

    if (!accessKeyId || !accessKeySecret || !bucket) {
      return NextResponse.json(
        { success: false, error: '阿里云OSS配置缺失' },
        { status: 500 }
      )
    }

    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 15)
    const ext = getExtFromFilename(filename) || (isVideo ? 'mp4' : 'jpg')
    const baseDir = isVideo ? 'probface/custom-videos' : 'probface/face-images'
    const datePath = getDatePath()
    const objectKey = `${baseDir}/${datePath}/${timestamp}-${randomStr}.${ext}`

    // 过期时间（秒级 UNIX 时间戳）
    const expires = Math.floor(Date.now() / 1000) + 60 * 5 // 5分钟有效

    // 构造 stringToSign（Signed URL）
    // VERB + "\n" + Content-MD5 + "\n" + Content-Type + "\n" + Expires + "\n" + CanonicalizedOSSHeaders + CanonicalizedResource
    const canonicalizedResource = `/${bucket}/${objectKey}`
    const stringToSign = [
      'PUT',
      '',
      contentType,
      String(expires),
      canonicalizedResource
    ].join('\n')

    const signature = crypto
      .createHmac('sha1', accessKeySecret)
      .update(stringToSign)
      .digest('base64')

    const uploadUrl = new URL(`https://${bucket}.${endpoint}/${objectKey}`)
    uploadUrl.searchParams.set('OSSAccessKeyId', accessKeyId)
    uploadUrl.searchParams.set('Expires', String(expires))
    uploadUrl.searchParams.set('Signature', signature)

    const publicUrl = `https://${bucket}.${endpoint}/${objectKey}`

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl: uploadUrl.toString(),
        publicUrl,
        key: objectKey,
        expiresAt: expires,
        requiredHeaders: {
          'Content-Type': contentType
        }
      }
    })
  } catch (error) {
    console.error('生成OSS预签名URL失败:', error)
    return NextResponse.json(
      { success: false, error: '生成预签名失败' },
      { status: 500 }
    )
  }
}


