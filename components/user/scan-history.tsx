"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useScanHistory, ScanResult } from "@/lib/scan-history-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  AlertCircle, 
  Calendar, 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  LinkIcon, 
  PenIcon, 
  RotateCcw, 
  Search, 
  ShieldAlert, 
  Trash2, 
  XCircle 
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Textarea } from "@/components/ui/textarea"

export default function ScanHistory() {
  const { user, isAuthenticated } = useAuth()
  const { scanHistory, removeScan, clearHistory, updateScanNotes } = useScanHistory()
  const [searchTerm, setSearchTerm] = useState("")
  const [editingNotes, setEditingNotes] = useState<{ id: string; notes: string } | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  
  const openNotesDialog = (scan: ScanResult) => {
    setEditingNotes({ id: scan.id, notes: scan.notes || "" })
    setDialogOpen(true)
  }
  
  const saveNotes = () => {
    if (editingNotes) {
      updateScanNotes(editingNotes.id, editingNotes.notes)
      setDialogOpen(false)
      setEditingNotes(null)
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <Card className="w-full mx-auto mt-4">
        <CardHeader>
          <CardTitle>Scan History</CardTitle>
          <CardDescription>
            Please log in to view your scan history
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Filter the scan history based on search term
  const filteredHistory = scanHistory.filter(scan => 
    scan.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (scan.title && scan.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (scan.notes && scan.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Group scans by date
  const groupedScans: { [key: string]: ScanResult[] } = {}
  
  filteredHistory.forEach(scan => {
    const date = new Date(scan.timestamp).toLocaleDateString()
    if (!groupedScans[date]) {
      groupedScans[date] = []
    }
    groupedScans[date].push(scan)
  })

  // Get status badge
  const getStatusBadge = (status: ScanResult['securityStatus']) => {
    switch (status) {
      case 'safe':
        return (
          <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Safe
          </Badge>
        )
      case 'warning':
        return (
          <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300">
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            Warning
          </Badge>
        )
      case 'dangerous':
        return (
          <Badge variant="outline" className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300">
            <ShieldAlert className="h-3.5 w-3.5 mr-1" />
            Dangerous
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300">
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Unknown
          </Badge>
        )
    }
  }

  return (
    <Card className="w-full mx-auto mt-4">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Scan History</CardTitle>
            <CardDescription>
              View and manage your QR code scan history
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search scans..."
                className="w-full md:w-auto pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => setSearchTerm("")} disabled={!searchTerm}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear search</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {scanHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You haven't scanned any QR codes yet</p>
            <Button asChild variant="outline">
              <a href="#scanner">Start Scanning</a>
            </Button>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No results found for "{searchTerm}"</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedScans).map(([date, scans]) => (
              <div key={date} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">{date}</h3>
                </div>
                
                <div className="space-y-3">
                  {scans.map(scan => (
                    <div key={scan.id} className="flex flex-col p-3 border rounded-lg">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-start gap-2">
                            <LinkIcon className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                            <div>
                              <h4 className="text-sm font-medium break-all">
                                {scan.title || scan.url}
                              </h4>
                              <p className="text-xs text-muted-foreground break-all">
                                {scan.url}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 self-end md:self-auto">
                          {getStatusBadge(scan.securityStatus)}
                          <div className="flex text-xs text-muted-foreground items-center">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {new Date(scan.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      
                      {scan.notes && (
                        <div className="mt-2 ml-6 pl-2 text-sm border-l-2 border-muted">
                          {scan.notes}
                        </div>
                      )}
                      
                      <div className="mt-2 ml-6 flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" asChild>
                          <a href={scan.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
                            Open
                          </a>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openNotesDialog(scan)}>
                          <PenIcon className="h-3.5 w-3.5 mr-1" />
                          {scan.notes ? "Edit Notes" : "Add Notes"}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => removeScan(scan.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {scanHistory.length > 0 && (
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredHistory.length} of {scanHistory.length} scans
          </p>
          <Button variant="outline" size="sm" onClick={clearHistory}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear History
          </Button>
        </CardFooter>
      )}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingNotes?.notes ? "Edit Notes" : "Add Notes"}</DialogTitle>
            <DialogDescription>
              Add your personal notes about this QR code scan
            </DialogDescription>
          </DialogHeader>
          
          {editingNotes && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add your notes here..."
                  rows={5}
                  value={editingNotes.notes}
                  onChange={(e) => setEditingNotes({ ...editingNotes, notes: e.target.value })}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveNotes}>Save Notes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 