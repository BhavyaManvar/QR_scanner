"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Dashboard from "@/components/user/dashboard"

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tab = searchParams.get("tab")

  useEffect(() => {
    // If no tab is specified, default to overview
    if (!tab) {
      router.replace("/dashboard?tab=overview")
    }
  }, [tab, router])

  return <Dashboard initialTab={tab || "overview"} />
} 