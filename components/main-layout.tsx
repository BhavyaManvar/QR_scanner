"use client"

import { useAuth } from "@/lib/auth-context"
import AuthPopup from "@/components/auth/auth-popup"
import { useEffect, useState, useCallback } from "react"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { 
    isAuthenticated, 
    showAuthPopup, 
    setShowAuthPopup, 
    login, 
    signup, 
    isLoading 
  } = useAuth()
  
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isOnScannerSection, setIsOnScannerSection] = useState(false)
  
  // Check if we're on the scanner section
  useEffect(() => {
    const checkLocation = () => {
      const isScanner = window.location.hash === '#scanner'
      setIsOnScannerSection(isScanner)
      
      // Auto-hide auth popup on scanner section
      if (isScanner && showAuthPopup) {
        setShowAuthPopup(false)
      }
    }
    
    // Check on initial load and hash changes
    checkLocation()
    window.addEventListener('hashchange', checkLocation)
    
    return () => {
      window.removeEventListener('hashchange', checkLocation)
    }
  }, [showAuthPopup, setShowAuthPopup])
  
  // Detect camera usage to prevent auth popup from interfering
  const checkForCameraUsage = useCallback(() => {
    // Check if any video elements are active
    const videoElements = document.querySelectorAll('video')
    const hasActiveVideo = Array.from(videoElements).some(video => {
      try {
        return video.srcObject !== null && !video.paused
      } catch (e) {
        console.error("Error checking video element:", e)
        return false
      }
    })
    
    setIsCameraActive(hasActiveVideo)
    
    // If camera is active, temporarily hide auth popup
    if (hasActiveVideo && showAuthPopup) {
      console.log("Camera active, hiding auth popup")
      setShowAuthPopup(false)
    }
  }, [showAuthPopup, setShowAuthPopup])
  
  useEffect(() => {
    // Check periodically
    const intervalId = setInterval(checkForCameraUsage, 2000)
    
    // Also check when visibility changes (tab focus)
    document.addEventListener('visibilitychange', checkForCameraUsage)
    
    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', checkForCameraUsage)
    }
  }, [checkForCameraUsage])

  const handleCloseAuthPopup = () => {
    // Only allow closing if user is authenticated or camera is active
    if (isAuthenticated || isCameraActive || isOnScannerSection) {
      setShowAuthPopup(false)
    }
  }

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password)
    } catch (error) {
      console.error("Login failed:", error)
      // In a real app, you would handle errors and show error messages
    }
  }

  const handleSignup = async (email: string, password: string, name: string) => {
    try {
      await signup(email, password, name)
    } catch (error) {
      console.error("Signup failed:", error)
      // In a real app, you would handle errors and show error messages
    }
  }

  // Determine if auth popup should be shown
  const shouldShowAuthPopup = showAuthPopup && !isCameraActive && !isOnScannerSection

  return (
    <>
      <div 
        className={`transition-all duration-300 w-full ${shouldShowAuthPopup ? 'filter blur-sm pointer-events-none' : ''}`}
      >
        {children}
      </div>

      <AuthPopup 
        isOpen={shouldShowAuthPopup}
        onClose={handleCloseAuthPopup}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
    </>
  )
} 