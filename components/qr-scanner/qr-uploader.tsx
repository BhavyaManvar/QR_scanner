"use client"

import type React from "react"

import { useState, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Upload, File, Image as ImageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import jsQR from "jsqr"

export interface QrUploaderProps {
  onScan: (qrData: string) => void
  isLoading?: boolean
}

export default function QrUploader({ onScan, isLoading = false }: QrUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [fileProcessing, setFileProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    setFileProcessing(true)
    setError(null)

    try {
      // Create a FileReader to read the image file
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        if (!e.target?.result) {
          setError('Failed to read image file')
          setFileProcessing(false)
          return
        }

        // Create an image element from the file data
        const img = new Image()
        
        img.onload = () => {
          // Create a canvas and draw the image on it
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          
          if (!context) {
            setError('Failed to process image')
            setFileProcessing(false)
            return
          }
          
          // Set canvas dimensions to match the image
          canvas.width = img.width
          canvas.height = img.height
          
          // Draw the image onto the canvas
          context.drawImage(img, 0, 0)
          
          // Get the image data from the canvas
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
          
          // Use jsQR to detect and decode QR code
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height)
          
          if (qrCode) {
            // Successfully detected QR code
            onScan(qrCode.data)
          } else {
            setError('No QR code found in the image')
          }
          
          setFileProcessing(false)
        }
        
        img.onerror = () => {
          setError('Failed to load image')
          setFileProcessing(false)
        }
        
        img.src = e.target.result as string
      }
      
      reader.onerror = () => {
        setError('Error reading file')
        setFileProcessing(false)
      }
      
      // Read the file as a data URL
      reader.readAsDataURL(file)
    } catch (err) {
      console.error('Error processing image:', err)
      setError('An error occurred while processing the image')
      setFileProcessing(false)
    }
  }

  const handleFile = (file: File | null) => {
    if (!file) return
    processImage(file)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    handleFile(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0] || null
    handleFile(file)
  }

  return (
    <div className="w-full space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors duration-200",
          dragActive ? "border-primary bg-primary/5" : "border-input",
          (isLoading || fileProcessing) && "opacity-50 pointer-events-none"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            {fileProcessing ? (
              <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Upload className="h-6 w-6 text-primary" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Drag an image with a QR code or click to upload
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        </div>
        <div className="mt-4 w-full max-w-xs">
          <Label htmlFor="file-upload" className="sr-only">Choose file</Label>
          <Input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleChange}
            disabled={isLoading || fileProcessing}
            className="cursor-pointer"
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive text-center">
          {error}
        </div>
      )}
    </div>
  )
}


