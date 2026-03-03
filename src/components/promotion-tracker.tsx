"use client"

import { useEffect } from "react"

function getUtmSource(): string | null {
  if (typeof window === "undefined") return null
  const params = new URLSearchParams(window.location.search)
  return params.get("utm_source")
}

function reportClick(utmSource: string) {
  const send = () => {
    fetch("/api/promotion/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utm_source: utmSource }),
      keepalive: true,
    }).catch(() => {})
  }
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(send, { timeout: 2000 })
  } else {
    setTimeout(send, 0)
  }
}

export function PromotionTracker() {
  useEffect(() => {
    const utmSource = getUtmSource()
    if (!utmSource?.trim()) return
    reportClick(utmSource)
  }, [])

  return null
}

