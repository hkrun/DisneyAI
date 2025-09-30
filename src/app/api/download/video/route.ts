import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const videoUrl = searchParams.get('url')
    
    console.log('Download request for URL:', videoUrl)
    
    if (!videoUrl) {
      console.log('No video URL provided')
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 })
    }

    // 验证URL是否来自我们的OSS
    if (!videoUrl.includes('oss-cn-shanghai.aliyuncs.com')) {
      console.log('Invalid video URL domain:', videoUrl)
      return NextResponse.json({ error: 'Invalid video URL' }, { status: 400 })
    }

    console.log('Fetching video from:', videoUrl)
    
    // 获取视频文件
    const response = await fetch(videoUrl)
    
    console.log('Fetch response status:', response.status)
    
    if (!response.ok) {
      console.log('Failed to fetch video, status:', response.status)
      return NextResponse.json({ error: 'Failed to fetch video' }, { status: response.status })
    }

    // 获取Content-Length用于进度显示
    const contentLength = response.headers.get('content-length')
    console.log('Video content length:', contentLength)

    // 使用流式传输，避免将整个文件加载到内存
    const readable = new ReadableStream({
      start(controller) {
        const reader = response.body?.getReader()
        
        if (!reader) {
          controller.close()
          return
        }

        function pump(): Promise<void> {
          return reader.read().then(({ done, value }) => {
            if (done) {
              controller.close()
              return
            }
            controller.enqueue(value)
            return pump()
          })
        }

        return pump()
      }
    })
    
    // 返回视频文件流
    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment',
        'Cache-Control': 'no-cache',
        'Content-Length': contentLength || '',
      },
    })
  } catch (error) {
    console.error('Download video error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
