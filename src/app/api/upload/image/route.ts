import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { findUserCreditsByUserId } from '@/actions/user'

// POST /api/upload/image - 上传图片到OSS
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
    if (userCredits <= 1) {
      return NextResponse.json(
        { 
          success: false,
          error: '积分不足，需要至少2积分才能上传文件。请购买积分或升级订阅计划。' 
        },
        { status: 402 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { 
          success: false,
          error: '没有找到上传的文件' 
        },
        { status: 400 }
      )
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false,
          error: '不支持的文件格式，请上传 JPEG、JPG 或 PNG 格式的图片' 
        },
        { status: 400 }
      )
    }

    // 验证文件大小 (20MB)
    const maxSize = 20 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          success: false,
          error: '文件大小不能超过20MB' 
        },
        { status: 400 }
      )
    }

    console.log('开始上传图片到OSS:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    })

    // OSS配置
    const ossConfig = {
      accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID || '',
      accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET || '',
      bucket: process.env.ALIYUN_OSS_BUCKET || 'your-bucket-name',
      endpoint: process.env.ALIYUN_OSS_ENDPOINT || 'oss-cn-shanghai.aliyuncs.com'
    }

    if (!ossConfig.accessKeyId || !ossConfig.accessKeySecret) {
      return NextResponse.json(
        {
          success: false,
          error: '阿里云OSS配置缺失'
        },
        { status: 500 }
      )
    }

    // 生成文件名
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const objectKey = `probface/face-images/${timestamp}-${randomStr}.${fileExtension}`

    // 准备上传参数
    const date = new Date().toUTCString()
    const contentType = file.type || 'application/octet-stream'

    // 生成签名
    const stringToSign = [
      'PUT',
      '', // Content-MD5 (可选)
      contentType,
      date,
      `/${ossConfig.bucket}/${objectKey}`
    ].join('\n')

    const signature = crypto
      .createHmac('sha1', ossConfig.accessKeySecret)
      .update(stringToSign)
      .digest('base64')

    // 构建上传URL
    const uploadUrl = `https://${ossConfig.bucket}.${ossConfig.endpoint}/${objectKey}`

    // 执行上传
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `OSS ${ossConfig.accessKeyId}:${signature}`,
        'Date': date,
        'Content-Type': contentType
      },
      body: fileBuffer
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OSS上传失败:', response.status, response.statusText, errorText)
      return NextResponse.json(
        {
          success: false,
          error: `OSS上传失败: ${response.status} ${response.statusText}`
        },
        { status: 500 }
      )
    }

    // 返回公开访问URL
    const publicUrl = `https://${ossConfig.bucket}.${ossConfig.endpoint}/${objectKey}`

    console.log('图片上传成功:', publicUrl)

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        fileName: file.name,
        fileSize: file.size
      }
    })

  } catch (error) {
    console.error('图片上传API错误:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '图片上传失败'
      },
      { status: 500 }
    )
  }
}
