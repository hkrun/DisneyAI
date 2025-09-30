'use client'

import { useState, useRef, useEffect } from 'react'
import { DISNEY_STYLE_TEMPLATES, type DisneyStyleTemplate } from '@/lib/disney-prompts'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useStyleTranslations } from '@/hooks/use-style-translations'
import { type Locale } from '@/i18n-config'
import { useAuthTranslation } from '@/hooks/use-auth-translation'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { LoginDialog } from '@/components/auth/LoginDialog'
import { type ConverterPanelLocal } from '@/types/locales/converter-panel'

interface ConversionState {
  predictionId?: string
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed'
  error?: string
  resultUrl?: string
  progress?: number
  step?: string // 新增：当前步骤描述
}

interface ConverterPanelProps {
  mode: 'image' | 'video'
  i18n: ConverterPanelLocal
}

export default function ConverterPanel({ mode, i18n }: ConverterPanelProps) {
  const { data: session } = useSession()
  const isLoggedIn = Boolean(session?.user)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const router = useRouter()
  // 读取当前语言参数
  const params = useParams() as { lang?: string }
  const lang = (params?.lang || 'zh') as Locale
  const { dict: styleI18n } = useStyleTranslations(lang)
  const { translations: authI18n } = useAuthTranslation(lang)
  const [step, setStep] = useState(1)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedImageDataUrl, setSelectedImageDataUrl] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<DisneyStyleTemplate | null>(null)
  const [conversion, setConversion] = useState<ConversionState>({ status: 'idle' })
  const [loadingExample, setLoadingExample] = useState(false)
  const [previewVideo, setPreviewVideo] = useState<string | null>(null)
  // 新增：视频转换的自定义提示词状态
  const [customPrompt, setCustomPrompt] = useState<string>('')
  const [selectedCharacterPrompt, setSelectedCharacterPrompt] = useState<string | null>(null)
  const [selectedScenePrompt, setSelectedScenePrompt] = useState<string | null>(null)
  // 图片转换完成后，是否展开视频第3步界面
  const [showVideoFromImage, setShowVideoFromImage] = useState<boolean>(false)
  // 是否已经开始视频转换
  const [videoConversionStarted, setVideoConversionStarted] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // 积分不足对话框状态
  const [showInsufficientCreditsDialog, setShowInsufficientCreditsDialog] = useState<boolean>(false)
  const [insufficientCreditsMessage, setInsufficientCreditsMessage] = useState<string>('')

  // 跳转到价格页面
  const handleGoToPricing = () => {
    setShowInsufficientCreditsDialog(false)
    router.push('/pricing')
  }

  // 获取用户积分
  const getUserCredits = async (): Promise<number> => {
    try {
      const response = await fetch('/api/user', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json() as any
        const credits = typeof data === 'number' ? data : (typeof data?.credits === 'number' ? data.credits : Number(data?.credits))
        return Number.isFinite(credits) ? credits : 0
      }
      return 0
    } catch (error) {
      console.error('获取积分失败:', error)
      return 0
    }
  }

  const STORAGE_KEY = 'disney-converter-state'

  // 监听模式变化，重置状态
  useEffect(() => {
    setStep(1)
    setSelectedImage(null)
    setSelectedImageDataUrl(null)
    setSelectedVideo(null)
    setSelectedStyle(null)
    setConversion({ status: 'idle' })
    setLoadingExample(false)
    setPreviewVideo(null)
    setCustomPrompt('') // 重置自定义提示词
    setSelectedCharacterPrompt(null) // 重置选中人物提示词
    setSelectedScenePrompt(null) // 重置选中场景提示词
    setShowVideoFromImage(false)
    setVideoConversionStarted(false) // 重置视频转换开始状态
  }, [mode])

  // 挂载时尝试恢复本地缓存的转换界面状态
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw)
      if (saved.mode && saved.mode !== mode) return

      if (typeof saved.step === 'number') setStep(saved.step)
      if (typeof saved.customPrompt === 'string') setCustomPrompt(saved.customPrompt)
      if (typeof saved.selectedCharacterPrompt !== 'undefined') setSelectedCharacterPrompt(saved.selectedCharacterPrompt)
      if (typeof saved.selectedScenePrompt !== 'undefined') setSelectedScenePrompt(saved.selectedScenePrompt)

      if (saved.selectedStyleId) {
        const found = DISNEY_STYLE_TEMPLATES.find(s => s.id === saved.selectedStyleId) || null
        setSelectedStyle(found)
      }

      if (saved.selectedImageDataUrl) {
        setSelectedImageDataUrl(saved.selectedImageDataUrl)
        // 恢复为 File 用于现有逻辑显示与提交
        const file = dataUrlToFile(saved.selectedImageDataUrl, 'uploaded.png')
        setSelectedImage(file)
      }

      if (saved.conversion) {
        setConversion(saved.conversion)
        // 若上次刷新时还在处理中，继续轮询
        if (saved.conversion.status === 'processing' && saved.conversion.predictionId) {
          if (mode === 'image') {
            pollConversionStatus(saved.conversion.predictionId)
          } else {
            pollVideoConversionStatus(saved.conversion.predictionId)
          }
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 将当前界面状态保存到本地
  useEffect(() => {
    const persist = async () => {
      let imageDataUrl = selectedImageDataUrl
      if (!imageDataUrl && selectedImage) {
        imageDataUrl = await fileToDataUrl(selectedImage)
        setSelectedImageDataUrl(imageDataUrl)
      }
      const payload = {
        mode,
        step,
        selectedStyleId: selectedStyle?.id || null,
        selectedImageDataUrl: imageDataUrl,
        customPrompt,
        selectedCharacterPrompt,
        selectedScenePrompt,
        conversion
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      } catch {}
    }
    persist()
  }, [mode, step, selectedStyle, selectedImage, selectedImageDataUrl, customPrompt, selectedCharacterPrompt, selectedScenePrompt, conversion])

  // 处理图片上传
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件')
        return
      }
      
      // 验证文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB')
        return
      }
      
      setSelectedImage(file)
      fileToDataUrl(file).then(setSelectedImageDataUrl).catch(() => {})
      setStep(2)
    }
  }

  // 处理视频转换的图片上传
  const handleVideoImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件')
        return
      }
      
      // 验证文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB')
        return
      }
      
      setSelectedImage(file)
      fileToDataUrl(file).then(setSelectedImageDataUrl).catch(() => {})
      setStep(2)
    }
  }

  // 处理示例图片选择
  const handleSelectExampleImage = async (imageUrl: string) => {
    setLoadingExample(true)
    try {
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`)
      }
      const blob = await response.blob()
      // 从URL中提取文件名，并创建File对象
      const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1)
      const file = new File([blob], filename, { type: blob.type })
      setSelectedImage(file)
      fileToDataUrl(file).then(setSelectedImageDataUrl).catch(() => {})
      setStep(2) // 跳转到风格选择步骤
    } catch (error) {
      console.error('Failed to load example image:', error)
      alert('加载示例图片失败，请重试')
    } finally {
      setLoadingExample(false)
    }
  }

  // 处理示例图片选择（用于视频转换）
  const handleSelectExampleImageForVideo = async (imageUrl: string) => {
    setLoadingExample(true)
    try {
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`)
      }
      const blob = await response.blob()
      // 从URL中提取文件名，并创建File对象
      const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1)
      const file = new File([blob], filename, { type: blob.type })
      setSelectedImage(file)
      fileToDataUrl(file).then(setSelectedImageDataUrl).catch(() => {})
      setStep(2) // 跳转到风格选择步骤
    } catch (error) {
      console.error('Failed to load example image:', error)
      alert('加载示例图片失败，请重试')
    } finally {
      setLoadingExample(false)
    }
  }

  // 处理拖拽上传
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const files = event.dataTransfer.files
    if (files.length > 0) {
      if (mode === 'image') {
        handleImageUpload({ target: { files } } as any)
      } else {
        handleVideoImageUpload({ target: { files } } as any)
      }
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  // 将图片转换为Base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // 移除data:image/...;base64,前缀
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // File -> dataURL
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // dataURL -> File
  const dataUrlToFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',')
    const mimeMatch = arr[0].match(/:(.*?);/)
    const mime = mimeMatch ? mimeMatch[1] : 'image/png'
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  // 将远程图片URL转为base64（去掉data前缀）
  const urlImageToBase64 = async (url: string): Promise<string> => {
    const resp = await fetch(url)
    if (!resp.ok) throw new Error(`获取图片失败: ${resp.status}`)
    const blob = await resp.blob()
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  // 通过URL直接下载文件（不跳转第三方页面）
  const downloadByUrl = async (fileUrl: string | undefined | null, preferredName?: string) => {
    try {
      if (!fileUrl) return
      const response = await fetch(fileUrl)
      if (!response.ok) throw new Error('下载失败')
      const blob = await response.blob()
      const ext = (blob.type?.split('/')?.[1] || 'bin').split(';')[0]
      const fileName = preferredName || `disney-${Date.now()}.${ext}`
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch (e) {
      console.error('下载出错:', e)
    }
  }

  // 在图片转换完成后，直接用结果图发起"视频生成"（等同视频模式第3步）
  const startVideoFromImageResult = async () => {
    if (!conversion.resultUrl || !selectedStyle) return

    try {
      // 先检查积分
      const userCredits = await getUserCredits()
      if (userCredits < 5) {
        setInsufficientCreditsMessage('积分不足，视频转换需要5积分。请购买积分后再试。')
        setShowInsufficientCreditsDialog(true)
        return
      }
      
      // 标记视频转换已开始
      setVideoConversionStarted(true)
      // 直接使用现有结果图 URL，跳过再次生成与上传
      setConversion({ status: 'uploading' })
      const response = await fetch('/api/transform-video-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          existingImageUrl: conversion.resultUrl,
          styleId: selectedStyle.id,
          prompt: customPrompt.trim(),
        }),
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || `转换失败 (状态码: ${response.status})`)
      }

      setConversion({
        status: 'processing',
        predictionId: result.predictionId,
        progress: 0,
        step: '正在生成视频...'
      })
      pollVideoConversionStatus(result.predictionId)
    } catch (error) {
      console.error('视频生成错误:', error)
      setConversion({ status: 'failed', error: error instanceof Error ? error.message : '视频生成失败' })
    }
  }

  // 模版映射 - 简短名称到完整描述
  const characterTemplates = {
    "开怀大笑": "一个人开怀大笑,露出灿烂的笑容,充满活力和快乐",
    "默默流泪": "一个人默默流泪,眼中含着晶莹的泪珠,表情悲伤而深情",
    "惊讶张嘴": "一个人因震惊而张嘴,露出不可思议的表情,眼睛瞪得很大",
    "陶醉闭眼": "一个人陶醉地闭着眼睛,表情安详而满足,沉浸在美好中"
  }

  const sceneTemplates = {
    "暴雨倾盆": "暴雨倾盆而下,雨滴密集地敲打着大地,天空阴沉昏暗",
    "雪花飘落": "雪花轻柔地飘落,覆盖着大地,营造出宁静的冬日氛围",
    "雷电交加": "雷电交加,闪电划破天空,雷声轰鸣,充满戏剧性",
    "落叶纷飞": "秋日里落叶纷飞,随风翩翩起舞,金黄色的叶子在空中旋转"
  }

  // 更新组合提示词
  const updateCombinedPrompt = (charPrompt: string | null, scenePrompt: string | null) => {
    const parts = []
    if (charPrompt) parts.push(characterTemplates[charPrompt as keyof typeof characterTemplates])
    if (scenePrompt) parts.push(sceneTemplates[scenePrompt as keyof typeof sceneTemplates])
    setCustomPrompt(parts.join(', '))
  }

  // 开始转换
  const startConversion = async () => {
    if (!selectedImage || !selectedStyle) return

    try {
      // 检查用户登录状态
      if (!session) {
        throw new Error('请先登录后再进行转换')
      }

      if (mode === 'image') {
        // 图片转换逻辑
        // 先检查积分
        const userCredits = await getUserCredits()
        if (userCredits < 10) {
          setInsufficientCreditsMessage('积分不足，图片转换需要10积分。请购买积分后再试。')
          setShowInsufficientCreditsDialog(true)
          return
        }
        
        const base64Image = await convertToBase64(selectedImage!)
        
        // 调用图片转换API
        setConversion({ status: 'uploading' })
        const response = await fetch('/api/transform-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            image: base64Image,
            styleId: selectedStyle.id,
          }),
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || `转换失败 (状态码: ${response.status})`)
        }

        // 开始轮询状态
        setConversion({ 
          status: 'processing', 
          predictionId: result.predictionId,
          progress: 0 
        })
        
        pollConversionStatus(result.predictionId)
      } else {
        // 视频转换逻辑
        if (step === 2) {
          // 第2步：选择风格后，进入第3步
          setStep(3)
          return
        } else if (step === 3) {
          // 第3步：生成视频（提示词可选）
          // 先检查积分
          const userCredits = await getUserCredits()
          if (userCredits < 125) {
            setInsufficientCreditsMessage('积分不足，视频转换需要125积分。请购买积分后再试。')
            setShowInsufficientCreditsDialog(true)
            return
          }
          
          const base64Image = await convertToBase64(selectedImage!)
          
          // 调用增强视频转换API，提示词可选
          setConversion({ status: 'uploading' })
          const response = await fetch('/api/transform-video-enhanced', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              image: base64Image,
              styleId: selectedStyle.id, // 用于生成迪士尼风格图片
              prompt: customPrompt.trim() || undefined, // 用于生成视频，可选
            }),
          })

          const result = await response.json()

          if (!result.success) {
            throw new Error(result.error || `转换失败 (状态码: ${response.status})`)
          }

          // 开始轮询状态
        setConversion({ 
          status: 'processing', 
            predictionId: result.predictionId,
            progress: 0,
            step: '正在生成视频...'
        })
        
          pollVideoConversionStatus(result.predictionId)
        }
      }

    } catch (error) {
      console.error('转换错误:', error)
      setConversion({ 
        status: 'failed', 
        error: error instanceof Error ? error.message : '转换失败' 
      })
    }
  }

  // 轮询转换状态（图片转换）
  const pollConversionStatus = async (predictionId: string) => {
    const maxAttempts = 60 // 最多轮询2分钟
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`/api/transform-image?predictionId=${predictionId}`, {
          credentials: 'include'
        })
        const result = await response.json()

        if (result.success && result.status === 'completed') {
          setConversion({
            status: 'completed',
            resultUrl: result.resultUrl,
            progress: 100
          })
        } else if (result.success && result.status === 'processing') {
          // 更新进度
          const progress = Math.min(90, (attempts / maxAttempts) * 90)
          setConversion(prev => ({ ...prev, progress }))
          
          attempts++
          if (attempts < maxAttempts) {
            setTimeout(poll, 2000) // 每2秒轮询一次
          } else {
            setConversion({ status: 'failed', error: '转换超时' })
          }
        } else {
          setConversion({ status: 'failed', error: result.error || '转换失败' })
        }
      } catch (error) {
        console.error('轮询错误:', error)
        setConversion({ status: 'failed', error: '网络错误' })
      }
    }

    poll()
  }

  // 模拟视频转换进度
  const simulateVideoConversion = () => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 8 // 视频转换比图片慢一些
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        // 模拟转换完成，使用示例视频URL
        setConversion({
          status: 'completed',
          resultUrl: 'https://scmh-shanghai.oss-cn-shanghai.aliyuncs.com/dsn/videos/example-result.mp4',
          progress: 100
        })
      } else {
        setConversion(prev => ({ ...prev, progress }))
      }
    }, 1000)
  }

  // 轮询视频转换状态（真实API实现时使用）
  const pollVideoConversionStatus = async (predictionId: string) => {
    const maxAttempts = 120 // 视频转换需要更长时间，最多轮询4分钟
    const maxRetries = 3 // 每次轮询失败时的重试次数
    let attempts = 0

    const poll = async () => {
      let retryCount = 0
      
      const pollWithRetry = async (): Promise<void> => {
        try {
          const response = await fetch(`/api/transform-video-enhanced?predictionId=${predictionId}`, {
            credentials: 'include'
          })
          const result = await response.json()

          if (result.success && result.status === 'completed') {
            setConversion({
              status: 'completed',
              resultUrl: result.resultUrl,
              progress: 100
            })
            // 视频转换完成后，不隐藏提示词表单，让视频结果界面显示
          } else if (result.success && result.status === 'processing') {
            // 更新进度和步骤描述
            const progress = Math.min(90, (attempts / maxAttempts) * 90)
            const stepMessages = [
              i18n.status.processing,
              i18n.status.uploadingToCloud,
              i18n.status.generatingVideo,
              i18n.status.processingVideo
            ]
            const stepIndex = Math.min(Math.floor(progress / 25), stepMessages.length - 1)
            
            setConversion(prev => ({ 
              ...prev, 
              progress,
              step: stepMessages[stepIndex]
            }))
            
            attempts++
            if (attempts < maxAttempts) {
              setTimeout(poll, 2000) // 每2秒轮询一次
            } else {
              setConversion({ status: 'failed', error: '视频转换超时' })
            }
          } else {
            setConversion({ status: 'failed', error: result.error || '视频转换失败' })
          }
        } catch (error) {
          console.error(`轮询错误 (重试 ${retryCount + 1}/${maxRetries + 1}):`, error)
          
          if (retryCount < maxRetries) {
            retryCount++
            // 指数退避重试
            const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000)
            console.log(`等待 ${delay}ms 后重试轮询...`)
            setTimeout(pollWithRetry, delay)
          } else {
            setConversion({ status: 'failed', error: '网络连接失败，请稍后重试' })
          }
        }
      }
      
      await pollWithRetry()
    }

    poll()
  }

  // 重置转换
  const resetConversion = () => {
    setStep(1)
    setSelectedImage(null)
    setSelectedImageDataUrl(null)
    setSelectedStyle(null)
    setConversion({ status: 'idle' })
    setLoadingExample(false)
    setCustomPrompt('') // 重置自定义提示词
    setSelectedCharacterPrompt(null) // 重置选中人物提示词
    setSelectedScenePrompt(null) // 重置选中场景提示词
    setShowVideoFromImage(false) // 重置视频转换界面
    setVideoConversionStarted(false) // 重置视频转换开始状态
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  // 下载结果
  const downloadResult = () => {
    if (conversion.resultUrl) {
      const link = document.createElement('a')
      link.href = conversion.resultUrl
      const extension = mode === 'image' ? 'png' : 'mp4'
      link.download = `disney-${selectedStyle?.id}-${Date.now()}.${extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <>
      <section className="container mx-auto px-4">
        <div className="flex flex-col items-stretch gap-8">
          <div className="w-full bg-white rounded-2xl shadow-lg p-6">
          
          {/* 转换中状态 */}
          {(conversion.status === 'uploading' || conversion.status === 'processing') && (
            <div className="text-center">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {showVideoFromImage ? i18n.status.videoPreview : (mode === 'image' ? i18n.status.imagePreview : i18n.status.videoPreview)}
                </h3>
                <button 
                  className="text-disney-accent hover:text-disney-red transition-colors flex items-center"
                  onClick={() => downloadByUrl(conversion.resultUrl, `${showVideoFromImage ? 'video' : (mode === 'image' ? 'image' : 'video')}-${Date.now()}.${showVideoFromImage ? 'mp4' : (mode === 'image' ? 'png' : 'mp4')}`)}
                  disabled={!conversion.resultUrl}
                >
                  <i className="fa fa-download mr-1" />
                  <span className="text-sm">{showVideoFromImage ? i18n.buttons.downloadVideo : (mode === 'image' ? i18n.buttons.downloadImage : i18n.buttons.downloadVideo)}</span>
                </button>
              </div>
              
              <div className="w-20 h-20 mx-auto rounded-full bg-disney-light flex items-center justify-center mb-4">
                <i className="fa fa-magic text-3xl text-disney-red animate-spin" />
              </div>
              
              <h4 className="text-lg font-bold mb-2 text-disney-blue">{i18n.status.magic}</h4>
              <p className="text-gray-600 mb-6">
                {showVideoFromImage ? i18n.messages.videoGeneration : (mode === 'image' ? i18n.messages.imageConversion : i18n.messages.videoGeneration)}
              </p>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-disney-red h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${conversion.progress || 0}%` }} 
                />
              </div>
              
              <p className="text-xs text-gray-500">
                {conversion.status === 'uploading' 
                  ? (showVideoFromImage ? i18n.status.generatingVideo : (mode === 'video' ? i18n.status.processing : i18n.status.uploading))
                  : conversion.step || (showVideoFromImage ? i18n.messages.estimatedTime.video : (mode === 'image' ? i18n.messages.estimatedTime.image : i18n.messages.estimatedTime.video))
                }
              </p>
              
              <div className="text-center text-sm text-gray-500 italic mt-6">
                {i18n.messages.hint}
              </div>
            </div>
          )}

          {/* 图片转换完成状态 */}
          {conversion.status === 'completed' && conversion.resultUrl && mode === 'image' && !showVideoFromImage && !videoConversionStarted && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{i18n.results.imageCompleted}</h3>
                <div className="flex gap-2">
                  <button 
                    className="text-disney-accent hover:text-disney-red transition-colors flex items-center"
                    onClick={() => downloadByUrl(conversion.resultUrl, `image-${Date.now()}.png`)}
                  >
                    <i className="fa fa-download mr-1" />
                  <span className="text-sm">{i18n.buttons.downloadImage}</span>
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-2 divide-x divide-gray-200">
                    <div>
                        <img 
                          src={selectedImage ? URL.createObjectURL(selectedImage) : ''} 
                          className="w-full h-full object-cover aspect-square cursor-zoom-in" 
                          alt={i18n.results.originalImage}
                          onClick={() => {
                            if (selectedImage) {
                              const url = URL.createObjectURL(selectedImage)
                              window.open(url, '_blank')
                            }
                          }}
                        />
                      <div className="p-2 bg-gray-50 text-center text-sm font-medium">
                        {i18n.results.originalImage}
                      </div>
                    </div>
                    <div>
                        <img 
                          src={conversion.resultUrl} 
                          className="w-full h-full object-cover aspect-square cursor-zoom-in" 
                          alt={i18n.results.styleImage}
                          onClick={() => window.open(conversion.resultUrl!, '_blank')}
                        />
                      <div className="p-2 bg-gray-50 text-center text-sm font-medium">
                        {i18n.results.styleImage}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={resetConversion}
                  className="flex-1 bg-disney-red hover:bg-disney-red/90 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  {i18n.buttons.continue}
                </button>
                <button 
                  onClick={() => setShowVideoFromImage(true)}
                  className="flex-1 bg-disney-blue hover:bg-disney-blue/90 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  {i18n.buttons.generateVideo}
                </button>
              </div>
            </div>
          )}

          {/* 视频转换表单 - 当点击"转换视频"后显示，但视频转换开始后隐藏 */}
          {showVideoFromImage && !videoConversionStarted && conversion.status === 'completed' && conversion.resultUrl && mode === 'image' && (
            <div className="mt-8">
              <div className="max-h-[400px] overflow-y-auto md:max-h-none md:overflow-visible mb-6 pr-2">
                {/* 提示词输入框（可选） */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{i18n.steps.video.promptLabel}</label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder={i18n.steps.video.promptPlaceholder}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-disney-red focus:border-transparent resize-none"
                    rows={6}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowVideoFromImage(false)} 
                  className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl transition-colors"
                >
                  {i18n.buttons.back}
                </button>
                <button 
                  onClick={startVideoFromImageResult} 
                  className="flex-1 bg-disney-red hover:bg-disney-red/90 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {i18n.buttons.generateVideo}
                </button>
              </div>
            </div>
          )}

          {/* 视频转换完成状态 */}
          {conversion.status === 'completed' && conversion.resultUrl && (videoConversionStarted || mode === 'video') && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{i18n.results.videoCompleted}</h3>
                <div className="flex gap-2">
                  <button 
                    className="text-disney-accent hover:text-disney-red transition-colors flex items-center"
                    onClick={() => downloadByUrl(conversion.resultUrl, `video-${Date.now()}.mp4`)}
                  >
                    <i className="fa fa-download mr-1" />
                  <span className="text-sm">{i18n.buttons.downloadVideo}</span>
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-2 divide-x divide-gray-200">
                    <div>
                      <img 
                        src={selectedImage ? URL.createObjectURL(selectedImage) : ''} 
                        className="w-full h-full object-cover aspect-square cursor-zoom-in" 
                        alt={i18n.results.originalImage}
                        onClick={() => {
                          if (selectedImage) {
                            const url = URL.createObjectURL(selectedImage)
                            window.open(url, '_blank')
                          }
                        }}
                      />
                      <div className="p-2 bg-gray-50 text-center text-sm font-medium">
                        {i18n.results.originalImage}
                      </div>
                    </div>
                    <div>
                      <video 
                        src={conversion.resultUrl} 
                        className="w-full h-full object-cover aspect-square" 
                        controls
                        preload="metadata"
                        onError={(e) => {
                          console.error('视频加载失败:', e);
                          console.log('视频URL:', conversion.resultUrl);
                        }}
                      />
                      <div className="p-2 bg-gray-50 text-center text-sm font-medium">
                        {i18n.results.styleVideo}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={resetConversion}
                  className="flex-1 bg-disney-red hover:bg-disney-red/90 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  {i18n.buttons.continue}
                </button>
                <button 
                  onClick={() => setShowVideoFromImage(false)}
                  className="flex-1 bg-disney-blue hover:bg-disney-blue/90 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  {i18n.buttons.back}
                </button>
              </div>
            </div>
          )}

          {/* 转换失败状态 */}
          {conversion.status === 'failed' && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
                <i className="fa fa-exclamation-triangle text-3xl text-red-500" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-red-600">转换失败</h4>
              <p className="text-gray-600 mb-6">{conversion.error}</p>
              <button 
                onClick={resetConversion}
                className="bg-disney-red hover:bg-disney-red/90 text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                重新尝试
              </button>
            </div>
          )}

          {/* 正常流程 */}
          {conversion.status === 'idle' && (
            <>
              {/* 进度条 */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">{i18n.progress.title}</span>
                  <span className="text-disney-red font-medium">
                    {step}/{mode === 'video' ? '3' : '2'} {i18n.progress.step}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-disney-red rounded-full transition-all duration-300" 
                    style={{ width: `${(step/(mode === 'video' ? 3 : 2))*100}%` }} 
                  />
                </div>
              </div>

              {/* 步骤1：上传文件 */}
              {step === 1 && (
                <div className="h-[500px] md:h-auto flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-disney-red text-white border-2 flex items-center justify-center mr-3">1</div>
                    <h3 className="text-xl font-bold">
                      {i18n.steps.upload.title}
                    </h3>
                    <span className="ml-2 text-sm text-gray-500">
                      {i18n.steps.upload.subtitle}
                    </span>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-disney-red transition-colors cursor-pointer mb-6 bg-gray-50 flex-1 flex items-center justify-center"
                onClick={() => {
                    if (!isLoggedIn) { setShowLoginDialog(true); return }
                    fileInputRef.current?.click()
                }}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-disney-light flex items-center justify-center mb-4">
                          <i className="fa fa-camera text-2xl text-disney-accent" />
                        </div>
                        <p className="text-gray-600 mb-2">
                          {i18n.steps.upload.placeholder}
                        </p>
                        <p className="text-xs text-gray-400">
                          {i18n.steps.upload.supportedFormats}
                        </p>
                      </div>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={mode === 'image' ? handleImageUpload : handleVideoImageUpload}
                      className="hidden"
                    />
                    
                    {/* 示例素材 */}
                    <div className="mb-6">
                      <p className="text-sm font-medium mb-3">{i18n.steps.upload.exampleImages}</p>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          'https://scmh-shanghai.oss-cn-shanghai.aliyuncs.com/dsn/images/d558df1d7d8f642c524c7a5af1d4f613.jpeg',
                          'https://scmh-shanghai.oss-cn-shanghai.aliyuncs.com/dsn/images/c1f0b3fbb832ad271dcd59281672a04a.jpeg',
                          'https://scmh-shanghai.oss-cn-shanghai.aliyuncs.com/dsn/images/7dcb96839cad12bfca9659c77a7c1ffc.jpeg'
                        ].map((imageUrl, index) => (
                    <button 
                      key={index} 
                    onClick={() => {
                      if (!isLoggedIn) { setShowLoginDialog(true); return }
                      return mode === 'image' ? handleSelectExampleImage(imageUrl) : handleSelectExampleImageForVideo(imageUrl)
                    }} 
                            disabled={loadingExample}
                            className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 hover:border-disney-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loadingExample ? (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <i className="fa fa-spinner fa-spin text-disney-red text-xl" />
                              </div>
                            ) : (
                              <img 
                                src={imageUrl} 
                                className="w-full h-full object-cover" 
                                alt={`示例图片 ${index + 1}`}
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* 步骤2：选择风格 */}
              {step === 2 && (
                <div className="h-[500px] md:h-auto flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-disney-red text-white border-2 flex items-center justify-center mr-3">2</div>
                    {selectedStyle ? (
                      <div>
                        <h3 className="text-xl font-bold text-disney-red">{styleI18n?.[selectedStyle.id]?.name || selectedStyle.name}</h3>
                        <span className="text-sm text-gray-500">{i18n.steps.style.selected}</span>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-xl font-bold">{i18n.steps.style.title}</h3>
                        <span className="ml-2 text-sm text-gray-500">{i18n.steps.style.subtitle}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto mb-6 md:max-h-[680px]">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {DISNEY_STYLE_TEMPLATES.map((style, i) => (
                      <div 
                        key={style.id} 
                        className={`border rounded-xl overflow-hidden relative cursor-pointer transition-all ${
                          selectedStyle?.id === style.id 
                            ? 'border-disney-red ring-2 ring-disney-red/20' 
                            : 'border-gray-200 hover:border-disney-red'
                        }`}
                        onClick={() => setSelectedStyle(style)}
                      >
                        <div className="aspect-[4/3] bg-gradient-to-br from-disney-light to-disney-accent flex items-center justify-center overflow-hidden relative">
                            <img 
                              src={style.image} 
                              alt={styleI18n?.[style.id]?.name || style.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // 如果图片加载失败，隐藏图片显示占位符
                              const target = e.currentTarget as HTMLImageElement
                              const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement
                              if (target) target.style.display = 'none'
                              if (fallback) fallback.style.display = 'flex'
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center fallback-icon" style={{display: 'none'}}>
                            <i className="fa fa-magic text-2xl text-disney-red" />
                          </div>
                        </div>
                          <div className="p-2 text-center text-sm font-medium">{styleI18n?.[style.id]?.name || style.name}</div>
                          <div className="px-2 pb-2 text-center text-xs text-gray-500">{styleI18n?.[style.id]?.description || style.description}</div>
                      </div>
                    ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStep(1)} 
                      className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl transition-colors"
                    >
                      {i18n.buttons.previous}
                    </button>
                    <button 
                      onClick={startConversion} 
                      disabled={!selectedStyle}
                      className="flex-1 bg-disney-red hover:bg-disney-red/90 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {mode === 'video' ? i18n.buttons.next : i18n.buttons.startConversion}
                    </button>
                  </div>
                </div>
              )}

              {/* 步骤3：输入视频提示词（仅视频模式） */}
              {mode === 'video' && step === 3 && (
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-disney-red text-white border-2 flex items-center justify-center mr-3">3</div>
                    <div>
                      <h3 className="text-xl font-bold">{i18n.steps.video.title}</h3>
                      <span className="ml-2 text-sm text-gray-500">{i18n.steps.video.subtitle}</span>
                    </div>
                  </div>
                  
                  {/* 可滚动主体：与第2步相同高度 */}
                  <div className="max-h-[400px] overflow-y-auto md:max-h-none md:overflow-visible mb-6 pr-2">
                    {/* 已选择的图片预览 */}
                    {selectedImage && (
                      <div className="mb-6">
                        <div className="w-64 h-64 md:w-80 md:h-80 mx-auto rounded-xl overflow-hidden border border-gray-200">
                          <img 
                            src={URL.createObjectURL(selectedImage)} 
                            alt={i18n.results.originalImage} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    {/* 已选择的风格预览 */}
                    {selectedStyle && (
                      <div className="mb-6">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-16 h-16 rounded-lg overflow-hidden">
                            <img 
                              src={selectedStyle.image} 
                              alt={selectedStyle.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{styleI18n?.[selectedStyle.id]?.name || selectedStyle.name}</p>
                            <p className="text-sm text-gray-500">{styleI18n?.[selectedStyle.id]?.description || selectedStyle.description}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 提示词输入框（可选） */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{i18n.steps.video.promptLabel}</label>
                      <textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder={i18n.steps.video.promptPlaceholder}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-disney-red focus:border-transparent resize-none"
                        rows={6}
                      />
                    </div>

                    {/* 示例提示词区域已移除 */}
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStep(2)} 
                      className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl transition-colors"
                    >
                      {i18n.buttons.previous}
                    </button>
                      <button 
                        onClick={startConversion} 
                      className="flex-1 bg-disney-red hover:bg-disney-red/90 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {i18n.buttons.generateVideo}
                    </button>
                  </div>
                </div>
              )}

            </>
          )}
        </div>
      </div>

      {/* 积分不足对话框 */}
      <ConfirmDialog
        isOpen={showInsufficientCreditsDialog}
        onClose={() => setShowInsufficientCreditsDialog(false)}
        onConfirm={handleGoToPricing}
        title={i18n.creditsDialog?.title || '积分不足'}
        description={insufficientCreditsMessage}
        confirmText={i18n.creditsDialog?.subscribe || '去订阅'}
        cancelText={i18n.creditsDialog?.cancel || '取消'}
        isDestructive={true}
      />
      {showLoginDialog && authI18n ? (
        <LoginDialog
          isOpen={true}
          onClose={() => setShowLoginDialog(false)}
          defaultMode='login'
          lang={lang}
          i18n={authI18n as any}
        />
      ) : null}
    </section>
    </>
  )
}
