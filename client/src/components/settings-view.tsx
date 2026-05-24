"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "./auth-provider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Check, AlertCircle, Bell, Lock, User } from "lucide-react"
import { API_URL } from "@/lib/config"

export function SettingsView() {
  const { user, token } = useAuth()
  const queryClient = useQueryClient()

  const [fullName, setFullName] = useState(user?.full_name || "")
  const [username, setUsername] = useState(user?.username || "")
  const [email, setEmail] = useState(user?.email || "")
  const [notificationsEnabled, setNotificationsEnabled] = useState((user as any)?.notifications_enabled ?? true)
  const [profileSuccess, setProfileSuccess] = useState(false)

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile")

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ full_name: fullName, username, email, notifications_enabled: notificationsEnabled }),
      })
      if (!res.ok) throw new Error("Failed to update profile")
      return res.json()
    },
    onSuccess: (data) => {
      localStorage.setItem("auth_user", JSON.stringify(data.user))
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] })
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    }
  })

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/api/users/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update password")
      return data
    },
    onSuccess: () => {
      setPasswordSuccess(true); setPasswordError("")
      setOldPassword(""); setNewPassword("")
      setTimeout(() => setPasswordSuccess(false), 3000)
    },
    onError: (err) => { setPasswordError(err.message); setPasswordSuccess(false) }
  })

  if (!user) return null

  const inputCls = "h-10 rounded-xl border-border/60 bg-secondary text-sm focus:border-foreground/20 focus:ring-0 transition-colors"
  const tabs = [
    { id: "profile" as const, icon: User, label: "Profile" },
    { id: "security" as const, icon: Lock, label: "Security" },
  ]

  return (
    <div className="max-w-lg space-y-6 pb-20">
      <div>
        <h2 className="text-lg font-bold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-secondary rounded-xl p-1">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === id
                ? "bg-card text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Full Name</Label>
            <Input className={inputCls} value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Username</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
              <Input className={`${inputCls} pl-7`} value={username} onChange={e => setUsername(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</Label>
            <Input type="email" className={inputCls} value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          {/* Notifications toggle */}
          <div className="flex items-center justify-between py-3 border-t border-border/40">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center">
                <Bell className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Email notifications</p>
                <p className="text-xs text-muted-foreground">Get notified about likes and follows</p>
              </div>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative w-10 h-5.5 rounded-full transition-colors ${notificationsEnabled ? "bg-foreground" : "bg-secondary border border-border"}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-background transition-all ${notificationsEnabled ? "translate-x-4.5" : "translate-x-0"}`} />
            </button>
          </div>

          {profileSuccess && (
            <div className="flex items-center gap-2 p-3 bg-secondary border border-border/60 rounded-xl text-sm text-foreground">
              <Check className="w-4 h-4 flex-shrink-0" />
              Profile updated successfully
            </div>
          )}

          <button
            onClick={() => updateProfileMutation.mutate()}
            disabled={updateProfileMutation.isPending}
            className="w-full h-10 rounded-xl bg-foreground text-background text-sm font-semibold transition-all hover:opacity-85 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
          </button>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
          <div>
            <p className="text-sm font-semibold">Change Password</p>
            <p className="text-xs text-muted-foreground mt-0.5">Ensure your account stays secure</p>
          </div>

          {passwordError && (
            <div className="flex items-center gap-2 p-3 bg-destructive/8 border border-destructive/20 rounded-xl text-sm text-destructive">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="flex items-center gap-2 p-3 bg-secondary border border-border/60 rounded-xl text-sm text-foreground">
              <Check className="w-4 h-4 flex-shrink-0" />
              Password updated successfully
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Current Password</Label>
            <Input type="password" className={inputCls} value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">New Password</Label>
            <Input type="password" className={inputCls} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>

          <button
            onClick={() => changePasswordMutation.mutate()}
            disabled={changePasswordMutation.isPending || !oldPassword || !newPassword}
            className="w-full h-10 rounded-xl bg-foreground text-background text-sm font-semibold transition-all hover:opacity-85 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {changePasswordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
          </button>
        </div>
      )}
    </div>
  )
}