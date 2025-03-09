"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { HelpCircle } from "lucide-react"

export default function PermissionHelper() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <HelpCircle className="h-4 w-4" />
          <span>Camera Help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Camera Permissions</DialogTitle>
          <DialogDescription>How to enable camera access for QR code scanning</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="font-medium">Chrome / Edge</h3>
            <ol className="text-sm list-decimal pl-5 space-y-1">
              <li>Click the camera/lock icon in the address bar</li>
              <li>Select "Allow" for camera access</li>
              <li>Refresh the page</li>
            </ol>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Safari</h3>
            <ol className="text-sm list-decimal pl-5 space-y-1">
              <li>Open Safari Preferences</li>
              <li>Go to Websites tab &gt; Camera</li>
              <li>Find this website and select "Allow"</li>
              <li>Refresh the page</li>
            </ol>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Firefox</h3>
            <ol className="text-sm list-decimal pl-5 space-y-1">
              <li>Click the camera icon in the address bar</li>
              <li>Select "Allow" for camera access</li>
              <li>Refresh the page</li>
            </ol>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Mobile Devices</h3>
            <ol className="text-sm list-decimal pl-5 space-y-1">
              <li>Check your browser settings</li>
              <li>Go to site settings or permissions</li>
              <li>Enable camera access for this site</li>
              <li>Refresh the page</li>
            </ol>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

