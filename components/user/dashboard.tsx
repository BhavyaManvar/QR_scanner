"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useScanHistory } from "@/lib/scan-history-context"
import { useSettings } from "@/lib/settings-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart3, 
  Clock, 
  History, 
  QrCode, 
  Settings as SettingsIcon, 
  User as UserIcon 
} from "lucide-react"
import Profile from "./profile"
import ScanHistory from "./scan-history"
import Settings from "./settings"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface DashboardProps {
  initialTab?: string
}

export default function Dashboard({ initialTab = "overview" }: DashboardProps) {
  const { user, isAuthenticated } = useAuth()
  const { scanHistory } = useScanHistory()
  const { settings } = useSettings()
  const [activeTab, setActiveTab] = useState(initialTab)
  const [isChangingTab, setIsChangingTab] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration mismatch by only rendering after component is mounted
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Sync tab state with URL params when URL changes
  useEffect(() => {
    if (!isMounted) return
    
    const tabParam = searchParams.get('tab')
    if (tabParam && ['overview', 'history', 'profile', 'settings'].includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
  }, [searchParams, activeTab, isMounted])

  // Calculate statistics
  const totalScans = scanHistory.length
  const safeScans = scanHistory.filter(scan => scan.securityStatus === 'safe').length
  const warningScans = scanHistory.filter(scan => scan.securityStatus === 'warning').length
  const dangerousScans = scanHistory.filter(scan => scan.securityStatus === 'dangerous').length
  const recentScans = scanHistory.slice(0, 5)

  const navigateToTab = (tab: string) => {
    if (tab === activeTab) return
    
    // Set changing state for animation
    setIsChangingTab(true)
    
    // Update the URL with the new tab parameter
    router.push(`/dashboard?tab=${tab}`, { scroll: false })
    
    // Update the local state
    setActiveTab(tab)
    
    // Reset animation state after transition
    setTimeout(() => {
      setIsChangingTab(false)
    }, 300)
  }

  if (!isAuthenticated || !user) {
    return (
      <Card className="w-full mx-auto mt-4">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>
            Please log in to view your dashboard
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="container py-6 space-y-6 px-4 md:px-6">
      {isMounted && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold">User Dashboard</h1>
            <Button variant="outline" asChild className="transition-all duration-200">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
          
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-300">
            <Card className="transition-all duration-300 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalScans}</div>
                <p className="text-xs text-muted-foreground">
                  Lifetime QR code scans
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Safe Scans</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeScans}</div>
                <p className="text-xs text-muted-foreground">
                  {totalScans > 0 ? `${Math.round((safeScans / totalScans) * 100)}% of total scans` : 'No scans yet'}
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentScans.length}</div>
                <p className="text-xs text-muted-foreground">
                  Scans in the last 24 hours
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{warningScans + dangerousScans}</div>
                <p className="text-xs text-muted-foreground">
                  {totalScans > 0 ? `${Math.round(((warningScans + dangerousScans) / totalScans) * 100)}% require attention` : 'No alerts'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card className="mt-6 transition-all duration-300 hover:shadow-sm">
            <CardContent className="p-0">
              <div className="w-full">
                <div className="flex flex-wrap border-b rounded-none p-1 md:p-2 overflow-x-auto">
                  <Button 
                    variant="ghost"
                    className={cn(
                      "flex items-center gap-2 transition-all duration-200 rounded-md border-b-2 border-transparent relative px-3 py-1.5",
                      activeTab === "overview" && "border-primary bg-muted font-medium"
                    )}
                    onClick={() => navigateToTab("overview")}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span className="whitespace-nowrap">Overview</span>
                  </Button>
                  <Button 
                    variant="ghost"
                    className={cn(
                      "flex items-center gap-2 transition-all duration-200 rounded-md border-b-2 border-transparent relative px-3 py-1.5",
                      activeTab === "history" && "border-primary bg-muted font-medium"
                    )}
                    onClick={() => navigateToTab("history")}
                  >
                    <History className="h-4 w-4" />
                    <span className="whitespace-nowrap">Scan History</span>
                  </Button>
                  <Button 
                    variant="ghost"
                    className={cn(
                      "flex items-center gap-2 transition-all duration-200 rounded-md border-b-2 border-transparent relative px-3 py-1.5",
                      activeTab === "profile" && "border-primary bg-muted font-medium"
                    )}
                    onClick={() => navigateToTab("profile")}
                  >
                    <UserIcon className="h-4 w-4" />
                    <span className="whitespace-nowrap">Profile</span>
                  </Button>
                  <Button 
                    variant="ghost"
                    className={cn(
                      "flex items-center gap-2 transition-all duration-200 rounded-md border-b-2 border-transparent relative px-3 py-1.5",
                      activeTab === "settings" && "border-primary bg-muted font-medium"
                    )}
                    onClick={() => navigateToTab("settings")}
                  >
                    <SettingsIcon className="h-4 w-4" />
                    <span className="whitespace-nowrap">Settings</span>
                  </Button>
                </div>

                <div className="p-4">
                  {/* Overview Tab */}
                  {activeTab === "overview" && (
                    <div className={cn(
                      "space-y-4 transition-all duration-300 ease-in-out",
                      isChangingTab ? "opacity-0" : "opacity-100"
                    )}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <h3 className="text-lg font-medium">Recent Scans</h3>
                        <Button 
                          variant="outline" 
                          onClick={() => navigateToTab("history")} 
                          className="transition-all duration-200"
                        >
                          View All
                        </Button>
                      </div>
                      
                      {recentScans.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No recent scans</p>
                      ) : (
                        <div className="space-y-2">
                          {recentScans.map(scan => (
                            <div key={scan.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 border rounded hover:bg-muted/50 transition-all duration-200 gap-2">
                              <div className="flex-1">
                                <p className="text-sm font-medium truncate">{scan.title || scan.url}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(scan.timestamp).toLocaleString()}
                                </p>
                              </div>
                              <Button variant="ghost" size="sm" asChild className="transition-all duration-200 self-end sm:self-auto">
                                <a href={scan.url} target="_blank" rel="noopener noreferrer">View</a>
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* History Tab */}
                  {activeTab === "history" && (
                    <div className={cn(
                      "transition-all duration-300 ease-in-out",
                      isChangingTab ? "opacity-0" : "opacity-100"
                    )}>
                      <ScanHistory />
                    </div>
                  )}

                  {/* Profile Tab */}
                  {activeTab === "profile" && (
                    <div className={cn(
                      "transition-all duration-300 ease-in-out",
                      isChangingTab ? "opacity-0" : "opacity-100"
                    )}>
                      <Profile />
                    </div>
                  )}

                  {/* Settings Tab */}
                  {activeTab === "settings" && (
                    <div className={cn(
                      "transition-all duration-300 ease-in-out",
                      isChangingTab ? "opacity-0" : "opacity-100"
                    )}>
                      <Settings />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
