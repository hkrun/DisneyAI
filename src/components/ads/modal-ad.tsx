'use client'

import { MoreVertical } from 'lucide-react'
import { useState } from 'react'

type ModalAdProps = {
  /** 广告标题 */
  title: string
  /** 广告描述 */
  description: string
  /** 关闭按钮文本 */
  closeText?: string
  /** 打开按钮文本（已废弃，保留用于兼容性） */
  openText?: string
  /** 广告标签文本 */
  adText?: string
  /** 打开按钮点击事件（已废弃，保留用于兼容性） */
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
 * - 居中显示
 * - 带遮罩层
 * - 支持关闭操作
 */
export function ModalAd({
  title,
  description,
  closeText = 'Close',
  openText = 'Open',
  adText = 'Ad',
  onOpen,
  onClose,
  isOpen,
  children,
}: ModalAdProps) {
  const [showMenu, setShowMenu] = useState(false)

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9998] transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="
          fixed inset-0 z-[9999]
          flex items-center justify-center
          p-4
          pointer-events-none
        "
        role="dialog"
        aria-modal="true"
        aria-label="广告"
      >
        <div
          className="
            bg-white dark:bg-gray-800
            shadow-2xl
            max-w-md w-full
            p-6
            relative
            pointer-events-auto
            transform transition-all duration-300 ease-out
            scale-100 opacity-100
          "
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">
                Ad
              </div>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="
                  p-1 rounded
                  text-gray-400 hover:text-gray-600
                  dark:hover:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  transition-colors
                "
                aria-label="更多选项"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-center">
            <iframe
              id="9cbe390b3e6ed4135196de4eea8accf1"
              className="border-0"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              referrerPolicy="no-referrer"
              style={{
                width: '300px',
                height: '250px',
                display: 'block'
              }}
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
                        'key' : '9cbe390b3e6ed4135196de4eea8accf1',
                        'format' : 'iframe',
                        'height' : 250,
                        'width' : 300,
                        'params' : {}
                      };
                    </script>
                    <script src="https://www.highperformanceformat.com/9cbe390b3e6ed4135196de4eea8accf1/invoke.js"></script>
                  </body>
                </html>
              `}
              title="广告"
              scrolling="no"
            />
          </div>

          {children && (
            <div className="mb-6">
              {children}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {adText}
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="
                  px-5 py-2.5
                  bg-purple-600 dark:bg-purple-500
                  text-white
                  rounded-full
                  hover:bg-purple-700 dark:hover:bg-purple-600
                  shadow-md
                  transition-all duration-200
                  font-medium
                "
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
