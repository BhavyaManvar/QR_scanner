"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera, CameraOff, Loader2, RefreshCw, Smartphone, Upload, ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import jsQR from "jsqr"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface QrCameraProps {
  onScan: (data: string) => void
  isLoading?: boolean
  onPermissionDenied?: () => void
}

export default function QrCamera({ onScan, isLoading = false, onPermissionDenied }: QrCameraProps) {
  // State
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [isLoading2, setIsLoading2] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [browserInfo, setBrowserInfo] = useState<string>("")
  const [isScanning, setIsScanning] = useState(false)
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Debug helper
  const addDebugInfo = (info: string) => {
    console.log(info)
    setDebugInfo(prev => `${info}\n${prev}`.slice(0, 500))
  }
  
  // Detect browser and device information
  useEffect(() => {
    try {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isIOSDevice = /iphone|ipad|ipod/i.test(userAgent.toLowerCase()) || 
                         (navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform));
      
      // Detect browser
      const isChrome = /chrome/i.test(userAgent) && !/edge|edg/i.test(userAgent);
      const isFirefox = /firefox/i.test(userAgent);
      const isSafari = /safari/i.test(userAgent) && !/chrome|chromium/i.test(userAgent);
      const isEdge = /edge|edg/i.test(userAgent);
      
      let browserName = "Unknown";
      if (isChrome) browserName = "Chrome";
      else if (isFirefox) browserName = "Firefox";
      else if (isSafari) browserName = "Safari";
      else if (isEdge) browserName = "Edge";
      
      setBrowserInfo(browserName);
      setIsMobile(isMobileDevice);
      setIsIOS(!!isIOSDevice);
      
      addDebugInfo(`Device: Mobile=${isMobileDevice}, iOS=${isIOSDevice}, Browser=${browserName}`);
    } catch (err) {
      addDebugInfo(`Error during device detection: ${err}`);
    }
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])
  
  // Start camera function
  const startCamera = async () => {
    try {
      setError(null)
      setIsLoading2(true)
      addDebugInfo("Starting camera...")
      
      // Check if camera API is available
      if (!navigator?.mediaDevices?.getUserMedia) {
        addDebugInfo("Camera API not available");
        throw new Error("Camera API not available on this device or browser");
      }
      
      // Stop any existing camera
      stopCamera()
      
      // Different constraints for iOS vs other devices
      let constraints: MediaStreamConstraints;
      
      if (isIOS) {
        // iOS often works better with simpler constraints
        addDebugInfo("Using iOS-specific constraints");
        constraints = {
          video: true,
          audio: false
        };
      } else if (isMobile) {
        // Mobile devices often prefer rear camera
        addDebugInfo("Using mobile-specific constraints");
        constraints = {
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 640 },
            height: { ideal: 480 }
          } as any,
          audio: false
        };
      } else {
        // Desktop devices - use simple constraints
        addDebugInfo("Using desktop constraints");
        constraints = {
          video: true,
          audio: false
        };
      }
      
      addDebugInfo(`Requesting camera with constraints: ${JSON.stringify(constraints)}`);
      
      // Get user media with error handling
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        addDebugInfo("Camera stream obtained successfully");
      } catch (err) {
        addDebugInfo(`First attempt failed: ${err}`);
        // Fallback to basic constraints
        constraints = { video: true, audio: false };
        addDebugInfo("Trying fallback constraints");
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          addDebugInfo("Camera stream obtained with fallback constraints");
        } catch (error) {
          addDebugInfo(`All attempts failed: ${error}`);
          throw error;
        }
      }
      
      // Store stream reference
      streamRef.current = stream
      
      // Log camera info
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        const settings = videoTrack.getSettings()
        addDebugInfo(`Camera: ${videoTrack.label}`)
        addDebugInfo(`Resolution: ${settings.width}x${settings.height}`)
      }
      
      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          addDebugInfo("Video metadata loaded")
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                addDebugInfo("Video started playing")
                setIsCameraActive(true)
                setIsLoading2(false)
                startScanning()
              })
              .catch(err => {
                addDebugInfo(`Error playing video: ${err}`)
                setError("Could not play video stream. Please try again.")
                setIsLoading2(false)
              })
          }
        }
      } else {
        addDebugInfo("Video element not found")
        setError("Video element not found. Please refresh the page.")
        setIsLoading2(false)
      }
    } catch (err: any) {
      addDebugInfo(`Camera error: ${err.message || err}`)
      
      if (!navigator?.mediaDevices?.getUserMedia) {
        setError("Your browser doesn't support camera access. Please try using a different browser or the upload option.")
      } else if (isIOS) {
        setError("Camera access on iOS may require using Safari and granting camera permissions in Settings. Please check your browser settings.")
      } else if (isMobile) {
        setError("Could not access your camera. Please check your permissions and try again.")
      } else {
        setError(`Camera error: ${err.name || "Unknown error"}. ${err.message || ""}`)
      }
      
      setIsLoading2(false)
      
      if (err.name === "NotAllowedError") {
        setError("Camera access denied. Please grant permission to use your camera.")
      } else if (err.name === "NotFoundError") {
        setError("No camera found on your device.")
      }
    }
  }
  
  // Stop camera function
  const stopCamera = () => {
    // Stop scanning
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
        addDebugInfo(`Stopped track: ${track.label}`)
      })
      streamRef.current = null
    }
    
    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setIsCameraActive(false)
  }
  
  // Start scanning for QR codes
  const startScanning = () => {
    if (!videoRef.current || !canvasRef.current) {
      addDebugInfo("Cannot start scanning: video or canvas not available")
      return
    }
    
    // Set up canvas
    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    
    if (!ctx) {
      addDebugInfo("Cannot get canvas context")
      return
    }
    
    // Set canvas size
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    
    addDebugInfo(`Canvas size: ${canvas.width}x${canvas.height}`)
    
    // Start scanning interval
    scanIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current || !ctx) return
      
      try {
        // Draw current video frame to canvas
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        
        // Scan for QR code
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        
        // If QR code found
        if (code) {
          addDebugInfo(`QR code found: ${code.data}`)
          stopCamera()
          onScan(code.data)
        }
      } catch (err) {
        addDebugInfo(`Scan error: ${err}`)
      }
    }, 200) // Scan every 200ms
  }
  
  // Force restart camera
  const restartCamera = async () => {
    try {
      setHasCameraAccess(null)
      setCameraError(null)
      
      // Stop current stream if any
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }
      
      // Request camera access again
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      })
      
      setHasCameraAccess(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          setIsScanning(true)
        }
      }
    } catch (err) {
      console.error("Error restarting camera:", err)
      setHasCameraAccess(false)
      setCameraError("Failed to restart camera")
      
      if (onPermissionDenied) {
        onPermissionDenied()
      }
    }
  }
  
  // Render device-specific instructions
  const renderDeviceInstructions = () => {
    if (isIOS) {
      return (
        <Alert className="mt-4">
          <Smartphone className="h-4 w-4" />
          <AlertTitle>iOS Device Detected</AlertTitle>
          <AlertDescription>
            <p>For best results on iOS devices:</p>
            <ol className="list-decimal pl-5 mt-2 text-sm space-y-1">
              <li>Use Safari browser (recommended for iOS)</li>
              <li>Ensure camera permissions are enabled in Settings</li>
              <li>Allow camera access when prompted</li>
              <li>If camera still doesn't work, try the upload option</li>
            </ol>
          </AlertDescription>
        </Alert>
      );
    }
    
    return null;
  };
  
  return (
    <div className="w-full">
      {renderDeviceInstructions()}
      
      {/* Camera view */}
      <div className={cn(
        "relative w-full h-64 bg-black rounded-lg overflow-hidden",
        (isLoading || !hasCameraAccess) && "opacity-50",
      )}>
        {/* Video element */}
        <video 
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />
        
        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Camera inactive state */}
        {!isCameraActive && !isLoading2 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
            <Camera className="w-10 h-10 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Camera is not active</p>
            {isMobile && (
              <p className="text-xs text-muted-foreground mt-1 max-w-xs text-center px-4">
                Tap the Start Camera button below and allow camera access when prompted
              </p>
            )}
          </div>
        )}
        
        {/* Loading state */}
        {(isLoading || isLoading2) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 font-medium text-white">
              {isLoading ? "Analyzing QR code..." : "Starting camera..."}
            </span>
          </div>
        )}
        
        {/* Border when camera is active */}
        {isCameraActive && (
          <div className="absolute inset-0 border-4 border-primary/50 rounded-lg pointer-events-none" />
        )}
      </div>
      
      {/* Error message */}
      {cameraError && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Camera Error</AlertTitle>
          <AlertDescription>
            <p>{cameraError}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={restartCamera}>
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Debug info */}
      {debugInfo && (
        <div className="mt-4 p-2 bg-muted rounded-md text-xs font-mono overflow-auto max-h-32">
          <p className="font-semibold mb-1">Debug Info:</p>
          <pre className="whitespace-pre-wrap">{debugInfo}</pre>
        </div>
      )}
      
      {/* Controls */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button
          onClick={isCameraActive ? stopCamera : startCamera}
          disabled={isLoading || isLoading2}
          variant={isCameraActive ? "destructive" : "default"}
          className="flex items-center gap-2"
        >
          {isCameraActive ? (
            <>
              <CameraOff className="w-4 h-4" />
              Stop Camera
            </>
          ) : isLoading2 ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              Start Camera
            </>
          )}
        </Button>
        
        {isCameraActive && (
          <Button 
            onClick={restartCamera}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Restart Camera
          </Button>
        )}
      </div>
    </div>
  )
}

