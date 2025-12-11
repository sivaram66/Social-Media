"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { AuthFlow } from "@/components/auth-flow"
import { Feed } from "@/components/feed"
import { UserSearch } from "@/components/user-search"
import { ProfileView } from "@/components/profile-view"
import { SettingsView } from "@/components/settings-view"
import { CreatePostModal } from "@/components/create-post-modal"
import { Button } from "@/components/ui/button"
import { Home, Plus, LogOut, Menu, Search, User, Settings, Bell } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-mobile"
import { SocketProvider, useSocket } from "@/components/socket-provider"
import { NotificationsModal } from "@/components/notifications-modal"

export default function PageWrapper() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SocketProvider>
                <PageContent />
            </SocketProvider>
        </Suspense>
    )
}

function PageContent() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { socket } = useSocket()
  
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const isMobile = useMediaQuery("(max-width: 768px)")

  // --- 1. SMART ROUTING LOGIC ---
  // Read state directly from the URL. If URL is empty, default to 'feed'.
  const currentView = searchParams.get("v") || "feed"
  const viewProfileId = searchParams.get("id") ? Number(searchParams.get("id")) : null
  const isNotifOpen = searchParams.get("modal") === "notifications"

  // Helper to update URL without reloading
  const navigate = (view: string, id?: number | null) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("v", view)
    
    // Handle Profile ID
    if (id) params.set("id", id.toString())
    else params.delete("id")
    
    params.delete("modal")
    
    router.push(`?${params.toString()}`)
  }

  // Helper to toggle Notification Modal via URL
  const toggleNotifications = (open: boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    if (open) {
        params.set("modal", "notifications")
        setUnreadCount(0) 
    } else {
        params.delete("modal")
    }
    router.push(`?${params.toString()}`)
  }

  // --- SOCKET LOGIC ---
  useEffect(() => {
    if (!socket) return
    const handleNotif = () => setUnreadCount((prev) => prev + 1)
    socket.on("notification", handleNotif)
    return () => { socket.off("notification", handleNotif) }
  }, [socket])

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>
  if (!user) return <AuthFlow />

  return (
    <div className="flex h-screen bg-background relative overflow-hidden">
  {/* Gradient Blob for visual interest */}
  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
      {/* SIDEBAR */}
      {!isMobile && (
        <div className="w-64 border-r border-border/40 bg-card/60 backdrop-blur-xl p-6 flex flex-col fixed h-full z-10 supports-[backdrop-filter]:bg-background/60">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-primary"></h1>
          </div>

          <nav className="space-y-2 flex-1">
            <Button 
                variant={currentView === "feed" ? "secondary" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => navigate("feed")}
            >
              <Home className="mr-2 w-5 h-5" /> Feed
            </Button>

            <Button 
                variant={currentView === "search" ? "secondary" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => navigate("search")}
            >
              <Search className="mr-2 w-5 h-5" /> Explore Users
            </Button>

            {/* Notification Button - Updates URL now */}
            <Button 
                variant={isNotifOpen ? "secondary" : "ghost"} 
                className="w-full justify-start relative" 
                onClick={() => toggleNotifications(true)}
            >
              <Bell className="mr-2 w-5 h-5" /> Notifications
              {unreadCount > 0 && (
                  <span className="absolute right-4 top-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                      {unreadCount}
                  </span>
              )}
            </Button>

            <Button 
                variant={currentView === "profile" && !viewProfileId ? "secondary" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => navigate("profile")}
            >
              <User className="mr-2 w-5 h-5" /> My Profile
            </Button>

            <Button 
                variant={currentView === "settings" ? "secondary" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => navigate("settings")}
            >
              <Settings className="mr-2 w-5 h-5" /> Settings
            </Button>
          </nav>

          <div className="space-y-2 pt-4 border-t border-border">
            <Button onClick={() => setIsCreatePostOpen(true)} className="w-full" size="lg">
              <Plus className="mr-2 w-4 h-4" /> New Post
            </Button>
            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-sm font-medium text-foreground">{user.full_name}</p>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            </div>
            <Button variant="outline" onClick={logout} className="w-full bg-transparent">
              <LogOut className="mr-2 w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className={`flex-1 flex flex-col md:overflow-hidden ${!isMobile ? "md:pl-64" : ""}`}>
        {isMobile && (
          <div className="border-b border-border bg-card p-4 flex items-center justify-between sticky top-0 z-10">
            <h1 className="text-xl font-bold">Social Media</h1>
            <button className="relative mr-4" onClick={() => toggleNotifications(true)}>
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full" />}
            </button>
            <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto w-full">
          <div className="p-4 md:py-8 max-w-2xl md:ml-16 lg:ml-32">
            
            {currentView === "feed" && <Feed onUserClick={(id) => navigate("profile", id)} />}
            {currentView === "search" && <UserSearch onUserClick={(id) => navigate("profile", id)} />}
            {currentView === "profile" && <ProfileView targetUserId={viewProfileId} onUserClick={(id) => navigate("profile", id)} />}
            {currentView === "settings" && <SettingsView />}

          </div>
        </div>
      </div>

      <CreatePostModal isOpen={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)} />
      
      {/* NOTIFICATION MODAL - Controlled by URL */}
      <NotificationsModal 
        isOpen={isNotifOpen} 
        onClose={() => toggleNotifications(false)} 
        onUserClick={(id) => navigate("profile", id)}
      />
    </div>
  )
}