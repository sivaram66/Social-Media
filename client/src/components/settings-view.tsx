"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Check, AlertCircle, Bell } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SettingsView() {
  const { user, token } = useAuth()
  const queryClient = useQueryClient()
  
  // --- STATE: EDIT PROFILE ---
  const [fullName, setFullName] = useState(user?.full_name || "")
  const [username, setUsername] = useState(user?.username || "")
  const [email, setEmail] = useState(user?.email || "")
  // Default to true if undefined, otherwise use user's preference
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notifications_enabled ?? true)
  const [profileSuccess, setProfileSuccess] = useState(false)

  // --- STATE: CHANGE PASSWORD ---
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // 1. MUTATION: Update Profile
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
            full_name: fullName, 
            username, 
            email, 
            notifications_enabled: notificationsEnabled 
        }),
      })
      if (!res.ok) throw new Error("Failed to update profile")
      return res.json()
    },
    onSuccess: (data) => {
      // Update local storage user data
      localStorage.setItem("auth_user", JSON.stringify(data.user))
      // Force refresh data
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] })
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    }
  })

  // 2. MUTATION: Change Password
  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("http://localhost:5000/api/users/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update password")
      return data
    },
    onSuccess: () => {
      setPasswordSuccess(true)
      setPasswordError("")
      setOldPassword("")
      setNewPassword("")
      setTimeout(() => setPasswordSuccess(false), 3000)
    },
    onError: (err) => {
      setPasswordError(err.message)
      setPasswordSuccess(false)
    }
  })

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Edit Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: PROFILE --- */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your public profile details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              {/* Notification Toggle */}
              <div className="flex items-center justify-between p-3 border rounded-lg bg-secondary/20 mt-4">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <div>
                        <p className="font-medium text-sm">Notifications</p>
                        <p className="text-xs text-muted-foreground">Receive updates when people like or follow you.</p>
                    </div>
                </div>
                <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-primary"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                />
              </div>

              {profileSuccess && (
                <Alert className="bg-green-50 text-green-600 border-green-200">
                  <Check className="h-4 w-4" />
                  <AlertDescription>Profile updated successfully!</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={() => updateProfileMutation.mutate()} 
                disabled={updateProfileMutation.isPending}
                className="w-full"
              >
                {updateProfileMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 2: SECURITY --- */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Ensure your account is secure with a strong password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}
              {passwordSuccess && (
                <Alert className="bg-green-50 text-green-600 border-green-200">
                  <Check className="h-4 w-4" />
                  <AlertDescription>Password updated successfully!</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>

              <Button 
                onClick={() => changePasswordMutation.mutate()} 
                disabled={changePasswordMutation.isPending || !oldPassword || !newPassword}
                className="w-full"
              >
                {changePasswordMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Update Password"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}