"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useSettings, UserSettings } from "@/lib/settings-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle, CheckCircle, SettingsIcon, ShieldAlert } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Settings() {
  const { user, isAuthenticated } = useAuth()
  const { settings, updateSettings, resetSettings } = useSettings()
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  if (!isAuthenticated || !user) {
    return (
      <Card className="w-full max-w-3xl mx-auto mt-4">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Please log in to view your settings
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // For each setting, create a handler that updates both the local state and marks as unsaved
  const handleSettingChange = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    updateSettings({ [key]: value })
    setUnsavedChanges(true)
  }

  // Reset all settings to defaults
  const handleReset = () => {
    resetSettings()
    setUnsavedChanges(false)
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-4">
      <CardHeader>
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          <CardTitle>Settings</CardTitle>
        </div>
        <CardDescription>
          Manage your QR scanner preferences and account settings
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          {/* General Settings */}
          <TabsContent value="general" className="space-y-6 pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Interface Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="defaultScanMode" className="flex-1">Default Scan Mode</Label>
                  <Select 
                    value={settings.defaultScanMode} 
                    onValueChange={(value) => handleSettingChange('defaultScanMode', value as UserSettings['defaultScanMode'])}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="camera">Camera</SelectItem>
                      <SelectItem value="upload">Upload</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="language" className="flex-1">Language</Label>
                  <Select 
                    value={settings.language} 
                    onValueChange={(value) => handleSettingChange('language', value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoAnalyze"
                    checked={settings.autoAnalyze}
                    onCheckedChange={(checked) => handleSettingChange('autoAnalyze', checked)}
                  />
                  <Label htmlFor="autoAnalyze">Automatically analyze QR codes for security</Label>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Account</h3>
              <p className="text-sm text-muted-foreground">
                You are signed in as {user.email}
              </p>
              
              <div className="flex gap-4">
                <Button variant="outline" asChild>
                  <a href="#profile">View Profile</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="#scan-history">View Scan History</a>
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6 pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Scan Privacy</h3>
              <p className="text-sm text-muted-foreground">
                Control how your QR code scans are saved and managed
              </p>
              
              <RadioGroup 
                value={settings.scanPrivacy}
                onValueChange={(value) => handleSettingChange('scanPrivacy', value as UserSettings['scanPrivacy'])}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="save-all" id="save-all" />
                  <Label htmlFor="save-all" className="flex items-center gap-2">
                    Save all scans
                    <span className="text-xs text-muted-foreground">
                      (All QR codes you scan will be saved to your history)
                    </span>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="save-safe-only" id="save-safe-only" />
                  <Label htmlFor="save-safe-only" className="flex items-center gap-2">
                    Save only safe scans
                    <span className="text-xs text-muted-foreground">
                      (Only QR codes marked as safe will be saved)
                    </span>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="save-none" id="save-none" />
                  <Label htmlFor="save-none" className="flex items-center gap-2">
                    Don't save any scans
                    <span className="text-xs text-muted-foreground">
                      (Your scan history will be empty)
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Data Management</h3>
              
              <div className="flex flex-col gap-2">
                <Button variant="outline" asChild>
                  <a href="#scan-history">Manage Scan History</a>
                </Button>
                <Button variant="destructive">Clear All Data</Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6 pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notification Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="notificationsEnabled"
                    checked={settings.notificationsEnabled}
                    onCheckedChange={(checked) => handleSettingChange('notificationsEnabled', checked)}
                  />
                  <Label htmlFor="notificationsEnabled">Enable notifications</Label>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  When enabled, you'll receive notifications about:
                </p>
                
                <ul className="space-y-2 text-sm pl-5">
                  <li className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-red-500" />
                    <span>Dangerous QR codes detected</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span>QR codes with potential warnings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Confirmation of safe QR codes</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleReset}>Reset to Defaults</Button>
        <div className="flex items-center gap-2">
          {unsavedChanges && (
            <span className="text-xs text-muted-foreground">Settings saved automatically</span>
          )}
        </div>
      </CardFooter>
    </Card>
  )
} 