import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const videoUrl = searchParams.get('url')
    
    console.log('Download request for URL:', videoUrl)
    
    if (!videoUrl) {
      console.log('No video URL provided')
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 })
    }

    // 验证URL是否来自我们的OSS（支持多种endpoint格式）
    const bucket = process.env.ALIYUN_OSS_BUCKET || ''
    const endpoint = process.env.ALIYUN_OSS_ENDPOINT || ''
    
    if (!videoUrl.includes(endpoint) && !videoUrl.includes('oss-accelerate.aliyuncs.com') && !videoUrl.includes('oss-cn-shanghai.aliyuncs.com')) {
      console.log('Invalid video URL domain:', videoUrl)
      return NextResponse.json({ error: 'Invalid video URL' }, { status: 400 })
    }

    // 🔧 优化：不再通过服务器代理下载，而是生成预签名URL让浏览器直接下载
    // 这样可以避免双重流量消耗（服务器从OSS下载 + 返回给用户）
    // 同时也能利用OSS的CDN加速能力
    
    // 从URL中提取objectKey
    const urlObj = new URL(videoUrl)
    const objectKey = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname
    
    // 生成预签名下载URL（1小时有效）
    const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID || ''
    const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET || ''
    const expires = Math.floor(Date.now() / 1000) + 3600 // 1小时
    
    const canonicalizedResource = `/${bucket}/${objectKey}`
    const stringToSign = `GET\n\n\n${expires}\n${canonicalizedResource}`
    
    const signature = crypto
      .createHmac('sha1', accessKeySecret)
      .update(stringToSign)
      .digest('base64')
    
    const signedUrl = new URL(videoUrl)
    signedUrl.searchParams.set('OSSAccessKeyId', accessKeyId)
    signedUrl.searchParams.set('Expires', String(expires))
    signedUrl.searchParams.set('Signature', signature)
    signedUrl.searchParams.set('response-content-disposition', 'attachment')
    
    // 重定向到预签名URL，让浏览器直接下载
    return NextResponse.redirect(signedUrl.toString(), 302)
    
  } catch (error) {
    console.error('Download video error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
