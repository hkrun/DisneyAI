/**
 * 客户端视频时长获取工具
 */

export interface VideoMetadata {
  duration: number // 时长（秒）
  format: string // 格式
  size: number // 文件大小（字节）
  bitrate: number // 比特率
}

/**
 * 使用浏览器API获取视频时长
 * @param videoUrl 视频URL
 * @returns 视频元数据
 */
export async function getVideoDurationFromUrl(videoUrl: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    
    video.addEventListener('loadedmetadata', () => {
      const duration = video.duration || 0
      const format = video.videoWidth > 0 ? 'video' : 'unknown'
      
      console.log('客户端获取视频时长成功:', {
        url: videoUrl.substring(0, 50) + '...',
        duration: duration,
        format: format,
        width: video.videoWidth,
        height: video.videoHeight
      })
      
      resolve({
        duration: Math.round(duration * 100) / 100,
        format,
        size: 0, // 浏览器API无法获取文件大小
        bitrate: 0 // 浏览器API无法获取比特率
      })
    })
    
    video.addEventListener('error', (e) => {
      console.error('客户端获取视频时长失败:', e)
      reject(new Error(`无法加载视频: ${e}`))
    })
    
    // 设置超时
    const timeout = setTimeout(() => {
      video.remove()
      reject(new Error('获取视频时长超时'))
    }, 10000) // 10秒超时
    
    video.addEventListener('loadedmetadata', () => {
      clearTimeout(timeout)
    })
    
    video.addEventListener('error', () => {
      clearTimeout(timeout)
    })
    
    video.src = videoUrl
    video.load()
  })
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
