"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { User, Mail, Settings, History, LogOut } from "lucide-react"
import { TransformHistoryDialog } from "@/components/transform-history-dialog"
import { TransformHistoryLocal } from "@/types/locales/transform-history"

// 示例翻译数据
const transformHistoryTranslations: TransformHistoryLocal = {
  title: "转换记录",
  loading: "加载中...",
  filters: {
    status: "状态筛选",
    all: "全部"
  },
  tabs: {
    all: "全部",
    image: "图片转换",
    video: "视频转换"
  },
  taskType: {
    image: "图片转换",
    video: "视频转换"
  },
  status: {
    PROCESSING: "处理中",
    COMPLETED: "已完成",
    FAILED: "失败"
  },
  details: {
    preview: "预览",
    hoverToPreview: "悬停预览",
    videoLoadError: "视频加载失败",
    seconds: "秒",
    fileSize: "文件大小"
  },
  actions: {
    download: "下载",
    retry: "重试"
  },
  empty: {
    title: "暂无记录",
    description: "您还没有进行过任何转换，快去试试吧！"
  },
  pagination: {
    showing: "显示",
    of: "共",
    results: "条记录",
    previous: "上一页",
    next: "下一页"
  }
}

interface UserMenuProps {
  user: {
    name: string
    email: string
  }
  onLogout: () => void
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [showHistory, setShowHistory] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
            <User className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium">{user.name}</p>
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowHistory(true)}>
            <History className="mr-2 h-4 w-4" />
            <span>转换记录</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Mail className="mr-2 h-4 w-4" />
            <span>联系我们</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>管理订阅</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>退出</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TransformHistoryDialog
        open={showHistory}
        onClose={() => setShowHistory(false)}
        i18n={transformHistoryTranslations}
        lang="zh"
      />
    </>
  )
}
