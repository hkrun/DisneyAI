"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, Eye, RotateCcw, Calendar, Clock, FileText, Image, Play } from "lucide-react"
// import { HoverVideoPreview } from "@/components/hover-video-preview"
import { TransformHistoryLocal } from "@/types/locales/transform-history"
import { formatDistanceToNow } from "date-fns"
import type { Locale } from "date-fns"
import { zhCN, enUS, fr, de, es, ja, ko } from "date-fns/locale"
import { getStyleTemplate } from "@/lib/disney-prompts"

interface TransformTask {
  id: number
  userId: string
  type: 'image' | 'video'
  styleId: string
  predictionId?: string
  originalImageUrl?: string
  resultUrl?: string
  creditsUsed: number
  status: 'processing' | 'completed' | 'failed'
  errorMessage?: string
  customPrompt?: string
  processingTime?: number
  createdAt: string
  updatedAt: string
  taskId?: string
  generatedImageUrl?: string
}

interface TransformHistoryDialogProps {
  open: boolean
  onClose: () => void
  i18n: TransformHistoryLocal
  lang: string
}

export function TransformHistoryDialog({ open, onClose, i18n, lang }: TransformHistoryDialogProps) {
  const [tasks, setTasks] = useState<TransformTask[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const limit = 10

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      // 按当前标签筛选任务类型（all/image/video）
      if (activeTab !== 'all') {
        params.append('type', activeTab)
      }

      const response = await fetch(`/api/transform-history?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }

      const result = await response.json()
      if (result.success) {
        setTasks(result.data.tasks)
        setTotalPages(result.data.pagination.totalPages)
        setTotal(result.data.pagination.total)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Failed to fetch transform history:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchTasks()
    }
  }, [open, page, statusFilter, activeTab])

  // 切换标签时重置到第1页
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setPage(1)
  }

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'all') return true
    return task.type === activeTab
  })

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const localeMap: Record<string, Locale> = {
      zh: zhCN,
      en: enUS,
      fr,
      de,
      es,
      ja,
      ko
    }
    const locale = localeMap[lang] || enUS
    return formatDistanceToNow(date, { addSuffix: true, locale })
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      processing: 'default',
      completed: 'success',
      failed: 'destructive'
    } as const
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {i18n.status[status.toUpperCase() as keyof typeof i18n.status] || status}
      </Badge>
    )
  }

  const handleDownload = async (task: TransformTask) => {
    if (!task.resultUrl) return
    
    try {
      console.log('Starting download for task:', task.id, 'URL:', task.resultUrl)
      
      // 直接下载文件
      const response = await fetch(task.resultUrl)
      
      console.log('Download response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`)
      }
      
      // 获取文件大小用于进度显示
      const contentLength = response.headers.get('content-length')
      const total = contentLength ? parseInt(contentLength, 10) : 0
      
      if (total > 0) {
        console.log('Downloading file size:', total, 'bytes')
      }
      
      // 使用流式读取，显示下载进度
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body reader available')
      }
      
      const chunks: Uint8Array[] = []
      let receivedLength = 0
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        chunks.push(value)
        receivedLength += value.length
        
        if (total > 0) {
          const progress = Math.round((receivedLength / total) * 100)
          console.log(`Download progress: ${progress}% (${receivedLength}/${total} bytes)`)
        }
      }
      
      // 合并所有chunks
      const blob = new Blob(chunks as BlobPart[], { type: task.type === 'image' ? 'image/jpeg' : 'video/mp4' })
      console.log('Downloaded blob size:', blob.size)
      
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty')
      }
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transform-${task.id}.${task.type === 'image' ? 'jpg' : 'mp4'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      console.log('Download completed successfully')
    } catch (error) {
      console.error('Download failed:', error)
      alert(`下载失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[90vw] h-[85vh] flex flex-col px-2">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{i18n.title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0">
          {/* 筛选器 */}
          <div className="flex items-center gap-4 mb-4 flex-shrink-0">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={i18n.filters.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{i18n.filters.all}</SelectItem>
                <SelectItem value="processing">{i18n.status.PROCESSING}</SelectItem>
                <SelectItem value="completed">{i18n.status.COMPLETED}</SelectItem>
                <SelectItem value="failed">{i18n.status.FAILED}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 标签页 */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
              <TabsTrigger value="all" className="truncate whitespace-nowrap px-2" title={i18n.tabs.all}>
                {i18n.tabs.all}
              </TabsTrigger>
              <TabsTrigger value="image" className="truncate whitespace-nowrap px-2" title={i18n.tabs.image}>
                {i18n.tabs.image}
              </TabsTrigger>
              <TabsTrigger value="video" className="truncate whitespace-nowrap px-2" title={i18n.tabs.video}>
                {i18n.tabs.video}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="flex-1 mt-4 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                  <span className="ml-2">{i18n.loading}</span>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{i18n.empty.title}</h3>
                  <p className="text-gray-500">{i18n.empty.description}</p>
                </div>
              ) : (
                <ScrollArea className="flex-1 h-[calc(85vh-200px)]">
                  <div className="space-y-4 px-0">
                  {filteredTasks.map((task, index) => {
                    const styleTemplate = getStyleTemplate(task.styleId)
                    return (
                    <div key={`${task.id}-${index}-${page}`} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors mx-3 sm:mx-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                          {/* 类型和风格模板 */}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">
                                {i18n.taskType[task.type]}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium truncate" title={styleTemplate?.name || task.styleId}>
                              {styleTemplate?.name || task.styleId}
                            </p>
                            {styleTemplate?.description && (
                              <p className="text-xs text-gray-500 truncate" title={styleTemplate.description}>
                                {styleTemplate.description}
                              </p>
                            )}
                          </div>

                          {/* 结果预览 */}
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <Eye className="h-3 w-3" />
                              {i18n.details.preview}
                            </div>
                            {task.status === 'completed' && task.resultUrl ? (
                              task.type === 'video' ? (
                                <div className="w-full h-40 sm:w-48 sm:h-32 bg-gray-200 rounded border overflow-hidden">
                                  <video 
                                    src={task.resultUrl}
                                    className="w-full h-full object-cover"
                                    controls
                                    preload="metadata"
                                    onError={(e) => {
                                      const target = e.target as HTMLVideoElement
                                      target.style.display = 'none'
                                      target.nextElementSibling?.classList.remove('hidden')
                                    }}
                                  >
                                    <source src={task.resultUrl} type="video/mp4" />
                                    {i18n.details.videoLoadError}
                                  </video>
                                  <div className="hidden w-full h-full flex items-center justify-center">
                                    <span className="text-sm text-gray-400">{i18n.details.videoLoadError}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-40 sm:w-48 sm:h-32 bg-gray-200 rounded border overflow-hidden">
                                  <img 
                                    src={task.resultUrl} 
                                    alt="转换结果" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.style.display = 'none'
                                      target.nextElementSibling?.classList.remove('hidden')
                                    }}
                                  />
                                  <div className="hidden w-full h-full flex items-center justify-center">
                                    <span className="text-sm text-gray-400">图片加载失败</span>
                                  </div>
                                </div>
                              )
                            ) : (
                              <div className="w-full h-40 sm:w-48 sm:h-32 bg-gray-200 rounded border flex items-center justify-center">
                                <span className="text-sm text-gray-400">
                                  {task.status === 'processing' ? i18n.status.PROCESSING : i18n.empty.title}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* 状态和时间 */}
                          <div>
                            <div className="mb-2">
                              {getStatusBadge(task.status)}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {formatDate(task.createdAt)}
                            </div>
                          </div>

                          {/* 详细信息 */}
                          <div className="text-xs text-gray-500 space-y-1">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {task.creditsUsed} 积分
                            </div>
                            {task.processingTime && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {task.processingTime} {i18n.details.seconds}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 操作按钮（移动端置底，桌面端右侧固定宽度） */}
                        <div className="flex items-center gap-2 md:ml-4 mt-3 md:mt-0 w-full md:w-[112px] justify-end">
                          {task.status === 'completed' && task.resultUrl ? (
                            <Button
                              size="sm"
                              onClick={() => handleDownload(task)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              {i18n.actions.download}
                            </Button>
                          ) : task.status === 'failed' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // TODO: 实现重试功能
                                console.log('Retry task:', task.id)
                              }}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              {i18n.actions.retry}
                            </Button>
                          ) : (
                            // 占位元素，保持布局在无按钮时也对齐
                            <span className="inline-block h-9 w-[96px] md:w-[96px]" />
                          )}
                        </div>
                      </div>

                      {/* 错误信息 */}
                      {task.status === 'failed' && task.errorMessage && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          {task.errorMessage}
                        </div>
                      )}
                    </div>
                    )
                  })}

                  {/* 分页 */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-gray-500">
                        {i18n.pagination.showing} {(page - 1) * limit + 1}-{Math.min(page * limit, total)} {i18n.pagination.of} {total} {i18n.pagination.results}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          {i18n.pagination.previous}
                        </Button>
                        <span className="text-sm">
                          {page} / {totalPages}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                        >
                          {i18n.pagination.next}
                        </Button>
                      </div>
                    </div>
                  )}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
