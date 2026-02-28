`use client`

import { MoreVertical } from 'lucide-react'
import { useEffect, useState } from 'react'

type ModalAdProps = {
  /** 广告标题 */
  title: string
  /** 广告描述 */
  description: string
  /** 关闭按钮文本 */
  closeText?: string
  /** 广告标签文本 */
  adText?: string
  /** 打开按钮文本 */
  openText?: string
  /** 打开按钮文案前半段（多语言） */
  openButtonBefore?: string
  /** 打开按钮文案高亮词（多语言，红色） */
  openButtonHighlight?: string
  /** 打开按钮文案后半段（多语言） */
  openButtonAfter?: string
  /** 打开按钮点击时打开的链接（新标签页） */
  openUrl?: string
  /** 打开按钮自定义点击回调（未提供 openUrl 时使用） */
  onOpen?: () => void
  /** 关闭按钮点击事件 */
  onClose: () => void
  /** 是否显示 */
  isOpen: boolean
  /** 自定义内容 */
  children?: React.ReactNode
}

/**
 * 广告弹窗组件
 * - 居中显示，带遮罩层（点击遮罩不关闭，仅关闭按钮可关闭）
 * - 底部提示文案支持多语言：openButtonBefore + 红色 openButtonHighlight + openButtonAfter
 * - 始终挂载、关闭时仅隐藏，iframe 预加载，打开时更快
 */
export function ModalAd({
  title,
  description,
  closeText = 'Close',
  adText = 'Ad',
  openText = '打开',
  openButtonBefore = '点击图片',
  openButtonHighlight = '打开',
  openButtonAfter = '链接',
  openUrl,
  onOpen,
  onClose,
  isOpen,
  children,
}: ModalAdProps) {
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    if (typeof window === 'undefined') return

    const body = document.body
    const docEl = document.documentElement

    const originalOverflow = body.style.overflow
    const originalPosition = body.style.position
    const originalTop = body.style.top
    const originalWidth = body.style.width
    const originalPaddingRight = body.style.paddingRight

    const scrollY = window.scrollY
    const scrollBarWidth = window.innerWidth - docEl.clientWidth

    // 锁定滚动（iOS 兼容：使用 position fixed + top）
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    if (scrollBarWidth > 0) body.style.paddingRight = `${scrollBarWidth}px`

    const preventDefault = (e: Event) => {
      e.preventDefault()
    }

    // 额外兜底：阻止滚轮/触摸拖动导致的页面滚动
    document.addEventListener('wheel', preventDefault, { passive: false })
    document.addEventListener('touchmove', preventDefault, { passive: false })

    return () => {
      document.removeEventListener('wheel', preventDefault)
      document.removeEventListener('touchmove', preventDefault)

      body.style.overflow = originalOverflow
      body.style.position = originalPosition
      body.style.top = originalTop
      body.style.width = originalWidth
      body.style.paddingRight = originalPaddingRight

      window.scrollTo(0, scrollY)
    }
  }, [isOpen])

  // 始终挂载 iframe（关闭时仅隐藏），让广告在后台提前加载，打开弹窗时更快
  const hidden = !isOpen

  const handleOpenClick = () => {
    if (openUrl) {
      window.open(openUrl, '_blank', 'noopener,noreferrer')
    } else if (onOpen) {
      onOpen()
    }
  }

  return (
    <>
      {/* 遮罩层（无 onClick，仅通过关闭按钮关闭）；关闭时仅隐藏以保留 iframe 预加载 */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-md z-[9998] transition-opacity duration-300 overscroll-contain touch-none ${hidden ? 'opacity-0 pointer-events-none' : ''}`}
        aria-hidden="true"
      />

      <div
        className={`
          fixed inset-0 z-[9999]
          flex items-center justify-center
          p-4
          transition-opacity duration-300
          ${hidden ? 'invisible pointer-events-none opacity-0' : 'pointer-events-none'}
        `}
        role="dialog"
        aria-modal="true"
        aria-hidden={hidden}
        aria-label="广告"
      >
        <div
          className="
            bg-white dark:bg-gray-800
            shadow-lg
            rounded-xl
            max-w-[330px] w-full
            p-2
            relative
            pointer-events-auto
            transform transition-all duration-300 ease-out
            scale-100 opacity-100
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* 顶部：右上三点菜单 */}
          <div className="flex items-center justify-end mb-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="
                  p-1 rounded
                  text-gray-600 hover:text-gray-800
                  dark:text-gray-400 dark:hover:text-gray-200
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  transition-colors
                "
                aria-label="更多选项"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 中间：iframe 广告（与底部固定广告移动端同源，始终挂载以预加载） */}
          <div className="mb-0 flex flex-col items-center justify-center gap-0">
            <iframe
              id="modal-ad-c934864e48cfd6133fda14666a004518"
              className="border-0"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              referrerPolicy="no-referrer"
              style={{ width: '300px', height: '250px', display: 'block' }}
              srcDoc={`
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                      body { margin: 0; padding: 0; overflow: hidden; }
                    </style>
                  </head>
                  <body>
                   <script>
      atOptions = {
        'key' : 'c934864e48cfd6133fda14666a004518',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    </script>
    <script src="https://controlslaverystuffing.com/c934864e48cfd6133fda14666a004518/invoke.js"></script>
                  </body>
                </html>
              `}
              title="广告"
              scrolling="no"
            />
          </div>

          {children && <div className="mb-6">{children}</div>}

          {/* 底部：左下「广告」+ 居中提示（前半+红色高亮+后半）+ 关闭按钮 */}
          <div className="flex items-center justify-between gap-2 pt-2">
            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{adText}</span>
            <button
              type="button"
              onClick={handleOpenClick}
              className="flex-1 flex justify-center"
            >
              <span className="text-sm text-gray-600 dark:text-gray-300 text-center">
                {openButtonBefore}
                <span className="text-red-500 dark:text-red-400">
                  {openButtonHighlight}
                </span>
                {openButtonAfter}
              </span>
            </button>
            <div className="shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1 bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 shadow-sm transition-all duration-200 font-medium"
              >
                {closeText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
