// 已移除HTTP请求方案，只保留浏览器API

export interface VideoMetadata {
  duration: number // 时长（秒）
  format: string // 格式
  size: number // 文件大小（字节）
  bitrate: number // 比特率
}

/**
 * 获取视频文件的时长和元数据（已弃用，请使用getVideoDurationFromUrl）
 * @param filePath 视频文件路径
 * @returns 视频元数据
 */
export async function getVideoDuration(filePath: string): Promise<VideoMetadata> {
  console.warn('getVideoDuration已弃用，请使用getVideoDurationFromUrl')
  throw new Error('FFmpeg已移除，请使用getVideoDurationFromUrl方法')
}

/**
 * 格式化视频时长为可读字符串
 * @param duration 时长（秒）
 * @returns 格式化的时长字符串，如 "01:23" 或 "1:23:45"
 */
export function formatVideoDuration(duration: number): string {
  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)
  const seconds = Math.floor(duration % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
}

/**
 * 使用浏览器API获取视频时长（备用方案）
 * @param videoUrl 视频URL
 * @returns 视频元数据
 */
export async function getVideoDurationFromUrlBrowser(videoUrl: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    
    video.addEventListener('loadedmetadata', () => {
      const duration = video.duration || 0
      const format = video.videoWidth > 0 ? 'video' : 'unknown'
      
      resolve({
        duration: Math.round(duration * 100) / 100,
        format,
        size: 0, // 浏览器API无法获取文件大小
        bitrate: 0 // 浏览器API无法获取比特率
      })
    })
    
    video.addEventListener('error', (e) => {
      reject(new Error(`无法加载视频: ${e}`))
    })
    
    video.src = videoUrl
    video.load()
  })
}

/**
 * 从URL获取视频时长（仅支持浏览器API）
 * @param videoUrl 视频URL
 * @returns 视频元数据
 */
export async function getVideoDurationFromUrl(videoUrl: string): Promise<VideoMetadata> {
  // 只支持浏览器API（客户端环境）
  if (typeof window !== 'undefined') {
    try {
      console.log('使用浏览器API获取视频时长...')
      const metadata = await getVideoDurationFromUrlBrowser(videoUrl)
      if (metadata.duration > 0) {
        console.log('浏览器API成功获取视频时长:', metadata.duration, '秒')
        return metadata
      }
    } catch (error) {
      console.warn('浏览器API获取视频时长失败:', error)
    }
  }

  // 服务器环境不支持，返回默认值
  console.warn('服务器环境不支持视频时长获取，使用默认时长5秒')
  return {
    duration: 5, // 默认5秒，避免免费使用
    format: 'unknown',
    size: 0,
    bitrate: 0
  }
}
