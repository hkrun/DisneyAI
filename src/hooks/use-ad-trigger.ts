'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

type AdTriggerConfig = {
  /** 首次触发需要的点击次数 */
  initialClickCount?: number
  /** 后续触发需要的点击次数范围 [min, max] */
  clickCountRange?: [number, number]
  /** 时间间隔（毫秒） */
  timeInterval?: number
  /** 存储键前缀 */
  storageKey?: string
}

type AdTriggerState = {
  /** 总点击次数 */
  totalClicks: number
  /** 上次显示广告后的点击次数 */
  clicksSinceLastAd: number
  /** 上次显示广告的时间 */
  lastAdShownAt: number | null
  /** 是否已经完成首次触发 */
  hasCompletedInitial: boolean
  /** 下次触发需要的点击次数 */
  nextTriggerClicks: number
}

const DEFAULT_CONFIG: Required<AdTriggerConfig> = {
  initialClickCount: 2,
  clickCountRange: [6, 9],
  timeInterval: 3 * 60 * 1000, // 3分钟
  storageKey: 'ad-trigger',
}

/**
 * 广告触发 Hook
 * - 跟踪用户点击次数
 * - 管理广告显示逻辑
 * - 支持首次触发、点击触发、时间触发
 */
export function useAdTrigger(config: AdTriggerConfig = {}) {
  const {
    initialClickCount = DEFAULT_CONFIG.initialClickCount,
    clickCountRange = DEFAULT_CONFIG.clickCountRange,
    timeInterval = DEFAULT_CONFIG.timeInterval,
    storageKey = DEFAULT_CONFIG.storageKey,
  } = config

  const [shouldShowAd, setShouldShowAd] = useState(false)
  // 记录广告触发原因：'click' | 'time' | null
  const triggerReasonRef = useRef<'click' | 'time' | null>(null)
  const [state, setState] = useState<AdTriggerState>(() => {
    if (typeof window === 'undefined') {
      return {
        totalClicks: 0,
        clicksSinceLastAd: 0,
        lastAdShownAt: null,
        hasCompletedInitial: false,
        nextTriggerClicks: initialClickCount,
      }
    }

    // 从 localStorage 恢复状态
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return {
          totalClicks: parsed.totalClicks || 0,
          clicksSinceLastAd: parsed.clicksSinceLastAd || 0,
          lastAdShownAt: parsed.lastAdShownAt || null,
          hasCompletedInitial: parsed.hasCompletedInitial || false,
          nextTriggerClicks: parsed.nextTriggerClicks || initialClickCount,
        }
      } catch {
        // 解析失败，使用默认值
      }
    }

    return {
      totalClicks: 0,
      clicksSinceLastAd: 0,
      lastAdShownAt: null,
      hasCompletedInitial: false,
      nextTriggerClicks: initialClickCount,
    }
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const shouldShowAdRef = useRef(false)

  // 保存状态到 localStorage
  const saveState = useCallback(
    (newState: AdTriggerState) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(newState))
      }
      setState(newState)
    },
    [storageKey]
  )

  // 生成随机点击次数
  const generateRandomClicks = useCallback(() => {
    const [min, max] = clickCountRange
    return Math.floor(Math.random() * (max - min + 1)) + min
  }, [clickCountRange])

  // 检查是否应该显示广告
  const checkShouldShowAd = useCallback(
    (currentState: AdTriggerState) => {
      // 首次触发
      if (!currentState.hasCompletedInitial) {
        if (currentState.clicksSinceLastAd >= currentState.nextTriggerClicks) {
          return true
        }
      } else {
        // 后续触发：检查点击次数
        if (currentState.clicksSinceLastAd >= currentState.nextTriggerClicks) {
          return true
        }

        // 检查时间间隔
        if (currentState.lastAdShownAt) {
          const timeSinceLastAd = Date.now() - currentState.lastAdShownAt
          if (timeSinceLastAd >= timeInterval) {
            return true
          }
        }
      }

      return false
    },
    [timeInterval]
  )

  // 记录点击
  const recordClick = useCallback(() => {
    setState((prev) => {
      const newState: AdTriggerState = {
        ...prev,
        totalClicks: prev.totalClicks + 1,
        clicksSinceLastAd: prev.clicksSinceLastAd + 1,
      }

      // 检查是否应该显示广告
      if (checkShouldShowAd(newState)) {
        shouldShowAdRef.current = true
        setShouldShowAd(true)
        triggerReasonRef.current = 'click'
        // 重置状态
        newState.clicksSinceLastAd = 0
        newState.lastAdShownAt = Date.now()
        newState.hasCompletedInitial = true
        newState.nextTriggerClicks = generateRandomClicks()
      }

      saveState(newState)
      return newState
    })
  }, [checkShouldShowAd, generateRandomClicks, saveState])

  // 处理广告关闭
  const handleAdClosed = useCallback(() => {
    shouldShowAdRef.current = false
    setShouldShowAd(false)

    setState((prev) => {
      const newState: AdTriggerState = {
        ...prev,
        lastAdShownAt: Date.now(),
        clicksSinceLastAd: 0,
      }
      saveState(newState)
      return newState
    })

    triggerReasonRef.current = null
  }, [saveState])

  // 更新 ref
  useEffect(() => {
    shouldShowAdRef.current = shouldShowAd
  }, [shouldShowAd])

  // 设置时间间隔检查
  useEffect(() => {
    if (!state.hasCompletedInitial || !state.lastAdShownAt) {
      return
    }

    if (shouldShowAdRef.current) {
      return
    }

    intervalRef.current = setInterval(() => {
      if (shouldShowAdRef.current) {
        return
      }

      setState((prev) => {
        const timeSinceLastAd = Date.now() - (prev.lastAdShownAt || 0)
        if (timeSinceLastAd >= timeInterval) {
          shouldShowAdRef.current = true
          setShouldShowAd(true)
          triggerReasonRef.current = 'time'
          const newState: AdTriggerState = {
            ...prev,
            clicksSinceLastAd: 0,
            lastAdShownAt: Date.now(),
            nextTriggerClicks: generateRandomClicks(),
          }
          saveState(newState)
          return newState
        }
        return prev
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [state.hasCompletedInitial, state.lastAdShownAt, timeInterval, generateRandomClicks, saveState])

  return {
    shouldShowAd,
    recordClick,
    handleAdClosed,
    state,
  }
}
