"use client"

import type { ScanResult } from "@/components/qr-scanner-section"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ShieldAlert, ExternalLink, AlertTriangle, AlertCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface QrResultsProps {
  result: ScanResult
  className?: string
  onScanAgain?: () => void
}

export default function QrResults({ result, className, onScanAgain }: QrResultsProps) {
  if (!result) return null

  const { url, isMalicious, riskLevel, details, rawData, timestamp } = result

  // Determine status indicator based on risk level
  const getRiskDetails = () => {
    switch (riskLevel) {
      case "high":
        return {
          icon: AlertCircle,
          label: "High Risk",
          color: "bg-destructive text-destructive-foreground",
          message: "This QR code has been identified as potentially malicious."
        }
      case "medium":
        return {
          icon: AlertTriangle,
          label: "Caution",
          color: "bg-warning text-warning-foreground",
          message: "This QR code might pose some security risks."
        }
      case "low":
        return {
          icon: Check,
          label: "Safe",
          color: "bg-success text-success-foreground",
          message: "This QR code appears to be safe."
        }
      default:
        return {
          icon: Check,
          label: "Unknown",
          color: "bg-muted text-muted-foreground",
          message: "Unable to determine risk level."
        }
    }
  }

  const risk = getRiskDetails()
  const RiskIcon = risk.icon

  // Check if this is a mock result (frontend only) or a real backend result
  const isMockResult = details.includes("Security analysis unavailable") || 
                      !timestamp || 
                      details.length <= 4;

  return (
    <div className={cn("space-y-4 animate-in fade-in-50", className)}>
      <Alert variant={isMalicious ? "destructive" : "default"}>
        <div className="flex items-start gap-4">
          {isMalicious ? <ShieldAlert className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          <div>
            <AlertTitle>{isMalicious ? "Potential security threat detected!" : "QR code appears safe"}</AlertTitle>
            <AlertDescription>
              {isMalicious
                ? "This QR code may lead to a malicious website or contain harmful content."
                : "Our scan did not detect any obvious security threats."}
            </AlertDescription>
          </div>
        </div>
      </Alert>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Risk Level</div>
          <Badge className={cn("text-xs", risk.color)}>
            <RiskIcon className="mr-1 h-3 w-3" />
            {risk.label}
            {isMockResult && " (Demo)"}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">QR Code Content</div>
          <div className="p-2 bg-muted rounded text-sm font-mono break-all">{url}</div>
          <div className="text-xs text-muted-foreground">Raw data: {rawData}</div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Analysis Details
            {isMockResult && <span className="text-xs ml-2 text-muted-foreground">(To be implemented by backend)</span>}
          </div>
          <ul className="text-sm space-y-1">
            {details.map((detail, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>

        {!isMalicious && (
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center gap-2"
            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="h-4 w-4" />
            Open URL
          </Button>
        )}
        
        {timestamp && (
          <div className="text-xs text-muted-foreground text-right">
            Scanned: {new Date(timestamp).toLocaleString()}
          </div>
        )}
      </div>
      
      <div className="border-t pt-2">
        <h4 className="text-xs text-muted-foreground mb-2">Scanned at {new Date(timestamp).toLocaleString()}</h4>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="default" 
            size="sm" 
            className="flex items-center" 
            asChild
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
              Visit Link <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
          
          {onScanAgain && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onScanAgain}
            >
              Scan Another Code
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

