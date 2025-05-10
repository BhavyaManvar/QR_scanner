"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import QrUploader from "@/components/qr-scanner/qr-uploader"
import QrCamera from "@/components/qr-scanner/qr-camera"
import QrResults from "@/components/qr-scanner/qr-results"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import PermissionHelper from "@/components/qr-scanner/permission-helper"
import { useAuth } from "@/lib/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

export type ScanResult = {
  url: string
  isMalicious: boolean
  riskLevel: "low" | "medium" | "high"
  details: string[]
  rawData: string
  timestamp: string
} | null

export default function QrScannerSection() {
  const [activeTab, setActiveTab] = useState<string>("camera")
  const [scanResult, setScanResult] = useState<ScanResult>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const { isAuthenticated, setShowAuthPopup } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const mountCountRef = useRef(0)

  // Prevent hydration mismatch by tracking component mounting
  useEffect(() => {
    setIsMounted(true)
    mountCountRef.current += 1
  }, [])

  // Reset state when tab changes
  useEffect(() => {
    if (!isMounted) return
    
    if (mountCountRef.current > 1) {
      setScanResult(null)
      setError(null)
    }
  }, [activeTab, isMounted])

  const handlePermissionDenied = () => {
    setPermissionDenied(true)
    // Auto-switch to upload tab when camera permission is denied
    setActiveTab("upload")
  }

  const analyzeSecurity = async (url: string, rawData: string): Promise<ScanResult> => {
    // This is a mock implementation. In a real app, you would call an API
    // that analyzes the QR code for security threats
    return new Promise((resolve) => {
      setTimeout(() => {
        // Example security check implementation
        const isSuspicious = url.includes("suspicious") || 
                             url.includes("malware") || 
                             url.includes("unknown") ||
                             Math.random() < 0.1 // 10% chance of random detection for demo

        const isMalicious = url.includes("malicious") || 
                           url.includes("phishing") ||
                           Math.random() < 0.05 // 5% chance of random detection for demo
        
        const details = []

        if (url.includes("http:") || !url.includes("https")) {
          details.push("Non-secure connection (HTTP instead of HTTPS)")
        }
        
        if (url.includes("suspicious") || url.includes("unknown")) {
          details.push("Suspicious domain detected")
        }
        
        if (url.includes("malicious") || url.includes("phishing")) {
          details.push("Known malicious domain")
          details.push("Potential phishing attempt")
        }
        
        if (details.length === 0) {
          details.push("No security issues detected")
        }

        let riskLevel: "low" | "medium" | "high" = "low"
        if (isMalicious) {
          riskLevel = "high"
        } else if (isSuspicious) {
          riskLevel = "medium"
        }

        resolve({
          url,
          isMalicious: isSuspicious || isMalicious,
          riskLevel,
          details,
          rawData,
          timestamp: new Date().toISOString()
        })
      }, 1500) // Simulate API delay
    })
  }

  const handleScan = async (qrData: any) => {
    console.log("Received QR Data:", qrData); // Debugging log
  
    if (!qrData || typeof qrData !== "object" || !qrData.decoded_text) {
      console.error("Invalid QR Data received:", qrData);
      setError("Invalid QR data. Please try again.");
      return;
    }
  
    setIsLoading(true);
    setError(null);
    setScanResult(null);
  
    try {
      // Use the `decoded_text` from the backend response
      const url = qrData.decoded_text;
      const result = {
        url: url,
        riskLevel: qrData.riskLevel,
        message: qrData.message,
        timestamp: new Date().toISOString(),
      };
  
      console.log("Setting Scan Result:", result);
      setScanResult(result);
    } catch (err) {
      setError("An error occurred while analyzing the QR code. Please try again.");
      console.error("QR scan error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleReset = () => {
    setScanResult(null)
    setError(null)
  }

  const viewScanHistory = () => {
    if (!isAuthenticated) {
      setShowAuthPopup(true)
      return
    }
    
    // Navigate to dashboard with history tab using router
    router.push("/dashboard?tab=history", { scroll: true })
  }

  return (
    <section id="scanner" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          {/* Scanner Content */}
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Scan QR Codes Safely
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our secure scanner checks for malicious content and provides instant security analysis. Use your camera or upload an image.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row flex-wrap">
              <Button onClick={() => setActiveTab("camera")} variant="outline" className="transition-all duration-300 hover:shadow-md">
                Use Camera
              </Button>
              <Button onClick={() => setActiveTab("upload")} variant="outline" className="transition-all duration-300 hover:shadow-md">
                Upload Image
              </Button>
              <Button onClick={viewScanHistory} variant="outline" className="transition-all duration-300 hover:shadow-md">
                View Scan History
              </Button>
            </div>
          </div>

          {/* Scanner Component */}
          {isMounted && (
            <div className="mx-auto w-full max-w-[500px]">
              <Card className="transition-all duration-300 hover:shadow-md">
                <CardHeader>
                  <CardTitle>QR Code Scanner</CardTitle>
                  <CardDescription>
                    Scan a QR code to check for security threats
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {permissionDenied && activeTab === "camera" && (
                    <Alert className="m-4">
                      <AlertTitle>Camera permission required</AlertTitle>
                      <AlertDescription>
                        Please grant camera permission to use this feature, or upload an image instead.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Loading State */}
                  {isLoading && (
                    <div className="flex flex-col items-center justify-center p-12 space-y-4">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <p className="text-center text-muted-foreground">Analyzing QR code security...</p>
                    </div>
                  )}
                  
                  {/* Error State */}
                  {error && !isLoading && (
                    <div className="p-6">
                      <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                      <Button onClick={handleReset} className="mt-4 w-full transition-all duration-200">
                        Try Again
                      </Button>
                    </div>
                  )}

                  {/* Result State */}
                  {scanResult && !isLoading && (
                    <div className="p-6">
                      <QrResults 
                        result={scanResult} 
                        onScanAgain={handleReset} 
                      />
                    </div>
                  )}

                  {/* Scanner UI */}
                  {!scanResult && !isLoading && !error && (
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="camera" className="transition-all duration-200">Camera</TabsTrigger>
                        <TabsTrigger value="upload" className="transition-all duration-200">Upload</TabsTrigger>
                      </TabsList>
                      <TabsContent value="camera" className="p-4">
                        {!permissionDenied ? (
                          <QrCamera 
                            onScan={handleScan} 
                            onPermissionDenied={handlePermissionDenied}
                            isLoading={isLoading} 
                          />
                        ) : (
                          <PermissionHelper />
                        )}
                      </TabsContent>
                      <TabsContent value="upload" className="p-4">
                        <QrUploader onScan={handleScan} isLoading={isLoading} />
                      </TabsContent>
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

