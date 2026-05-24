"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { useAuth } from "@/components/auth-provider"
import { AuthFlow } from "@/components/auth-flow"
import { Feed } from "@/components/feed"
import { UserSearch } from "@/components/user-search"
import { ProfileView } from "@/components/profile-view"
import { SettingsView } from "@/components/settings-view"
import { CreatePostModal } from "@/components/create-post-modal"
import { NotificationsModal } from "@/components/notifications-modal"
import { SocketProvider, useSocket } from "@/components/socket-provider"
import { Home, Search, User, Settings, Bell, Plus, LogOut, Sun, Moon, Menu, X, Bird } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-mobile"
import { useEffect } from "react"
import { LandingPage } from "@/components/landing-page"

export default function PageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-foreground flex items-center justify-center">
            <Bird className="w-5 h-5 text-background" />
          </div>
          <div className="flex gap-1">
            {[0, 150, 300].map(d => (
              <span key={d} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        </div>
      </div>
    }>
      <SocketProvider>
        <PageContent />
      </SocketProvider>
    </Suspense>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-8 h-8" />
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
      title={theme === "dark" ? "Light mode" : "Dark mode"}
    >
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}

function PageContent() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { socket } = useSocket()

  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const currentView = searchParams.get("v") || "feed"
  const viewProfileId = searchParams.get("id") ? Number(searchParams.get("id")) : null
  const isNotifOpen = searchParams.get("modal") === "notifications"
  const showAuth = searchParams.get("auth") === "true"

  const navigate = (view: string, id?: number | null) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("v", view)
    if (id) params.set("id", id.toString())
    else params.delete("id")
    params.delete("modal")
    router.push(`?${params.toString()}`)
    setIsMobileSidebarOpen(false)
  }

  const toggleNotifications = (open: boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    if (open) { params.set("modal", "notifications"); setUnreadCount(0) }
    else params.delete("modal")
    router.push(`?${params.toString()}`)
  }

  useEffect(() => {
    if (!socket) return
    const handle = () => setUnreadCount(p => p + 1)
    socket.on("notification", handle)
    return () => { socket.off("notification", handle) }
  }, [socket])

  // Loading state
  if (isLoading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-foreground flex items-center justify-center animate-pulse">
          <Bird className="w-5 h-5 text-background" />
        </div>
      </div>
    </div>
  )

  // Not logged in — show landing or auth
  if (!user) {
    if (showAuth) return <AuthFlow />
    return <LandingPage />
  }

  // Logged in — show app
  const navItems = [
    { icon: Home, label: "Home", view: "feed" },
    { icon: Search, label: "Explore", view: "search" },
    { icon: User, label: "Profile", view: "profile" },
    { icon: Settings, label: "Settings", view: "settings" },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
            <Bird className="w-3.5 h-3.5 text-background" />
          </div>
          <span className="font-bold text-sm tracking-tight">SocialNest</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map(({ icon: Icon, label, view }) => {
          const isActive = currentView === view && (view !== "profile" || !viewProfileId)
          return (
            <button
              key={view}
              onClick={() => navigate(view)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          )
        })}

        <button
          onClick={() => toggleNotifications(true)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
            isNotifOpen ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Bell className="w-4 h-4 flex-shrink-0" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-auto min-w-5 h-5 bg-foreground text-background dark:bg-white dark:text-black text-[10px] font-bold px-1.5 rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-border/60 space-y-1.5">
        <button
          onClick={() => setIsCreatePostOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-foreground text-background font-semibold text-sm hover:opacity-85 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>

        <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-accent transition-colors group cursor-default">
          <div className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0">
            {user.profile_pic_url
              ? <img src={(user as any).profile_pic_url} alt="" className="w-full h-full object-cover" />
              : user.full_name?.charAt(0).toUpperCase()
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate leading-tight">{user.full_name}</p>
            <p className="text-[11px] text-muted-foreground truncate">
              {user.username ? `@${user.username}` : user.email}
            </p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all p-1 rounded-lg"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside className="w-52 flex-shrink-0 border-r border-border bg-sidebar flex flex-col">
          <SidebarContent />
        </aside>
      )}

      {/* Mobile overlay sidebar */}
      {isMobile && isMobileSidebarOpen && (
        <>
          <div className="fixed inset-0 bg-foreground/20 modal-backdrop z-20" onClick={() => setIsMobileSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-52 bg-sidebar border-r border-border z-30 flex flex-col">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {isMobile && (
          <div className="border-b border-border bg-sidebar px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-foreground flex items-center justify-center">
                <Bird className="w-3 h-3 text-background" />
              </div>
              <span className="font-bold text-sm">SocialNest</span>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button onClick={() => toggleNotifications(true)} className="relative w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-foreground rounded-full" />}
              </button>
              <button onClick={() => setIsMobileSidebarOpen(true)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent">
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-xl mx-auto px-4 py-6">
            {currentView === "feed" && <Feed onUserClick={(id) => navigate("profile", id)} />}
            {currentView === "search" && <UserSearch onUserClick={(id) => navigate("profile", id)} />}
            {currentView === "profile" && <ProfileView targetUserId={viewProfileId} onUserClick={(id) => navigate("profile", id)} />}
            {currentView === "settings" && <SettingsView />}
          </div>
        </div>
      </main>

      {isMobile && (
        <button onClick={() => setIsCreatePostOpen(true)} className="fixed bottom-6 right-6 z-10 w-12 h-12 bg-foreground text-background rounded-2xl flex items-center justify-center shadow-xl hover:opacity-85 active:scale-95 transition-all">
          <Plus className="w-5 h-5" />
        </button>
      )}

      <CreatePostModal isOpen={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)} />
      <NotificationsModal isOpen={isNotifOpen} onClose={() => toggleNotifications(false)} onUserClick={(id) => navigate("profile", id)} />
    </div>
  )
}