"use client"

import { useState, ChangeEvent } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface QrUploaderProps {
  onScan: (qrData: any) => void
  isLoading?: boolean
}

export default function QrUploader({ onScan, isLoading = false }: QrUploaderProps) {
  const [error, setError] = useState<string | null>(null)

  const sendToBackend = async (qrData: string) => {
    if (!qrData || typeof qrData !== "string") {
      console.error("Invalid QR data received:", qrData);
      setError("Invalid QR data detected. Please try again.");
      return;
    }
  
    try {
      const response = await fetch("http://127.0.0.1:5000/process_qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrData: qrData.trim() }),
      });
  
      const data = await response.json();
  
      if (data.status === "success" && data.results.length > 0) {
        console.log("Backend Response:", data.results[0]);
        onScan(data.results[0]);  // Pass the entire result object
      } else {
        setError("Failed to analyze QR code.");
      }
    } catch (err) {
      setError("Error connecting to backend.");
    }
  };
  
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sendToBackend(file.name);
    }
  };

  return (
    <div className="w-full space-y-4">
      <Label htmlFor="file-upload">Upload QR Code</Label>
      <Input id="file-upload" type="file" accept="image/*" onChange={handleFileUpload} />
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
