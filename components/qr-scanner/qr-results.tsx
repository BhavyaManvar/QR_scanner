"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface ScanResult {
  url: string
  riskLevel: string
  message: string
  timestamp: string
}

export default function QrResults({ result }: { result: ScanResult | null }) {
  if (!result) return null;

  console.log("Displaying Scan Result:", result); // Debugging log

  const riskDetails = {
    high: { icon: ShieldAlert, label: "🚨 Malicious", color: "bg-red-500 text-white" },
    medium: { icon: AlertTriangle, label: "⚠️ Suspicious", color: "bg-yellow-500 text-black" },
    low: { icon: ShieldCheck, label: "✅ Safe", color: "bg-green-500 text-white" },
  }[result.riskLevel] || { icon: ShieldCheck, label: "Unknown", color: "bg-gray-500 text-white" };

  return (
    <div className="space-y-4">
      <Alert variant={result.riskLevel === "high" ? "destructive" : "default"}>
        <riskDetails.icon className="h-5 w-5" />
        <AlertTitle>{riskDetails.label}</AlertTitle>
        <AlertDescription>{result.message}</AlertDescription>
      </Alert>

      <Badge className={riskDetails.color}>{riskDetails.label}</Badge>

      <div className="border p-4 rounded">
        <p><strong>Scanned URL:</strong> {result.url}</p>
        <p><strong>Security Message:</strong> {result.message}</p>
      </div>

      <Button onClick={() => window.open(result.url, "_blank")}>Open URL</Button>
    </div>
  );
}
