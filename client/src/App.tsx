"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { AuthFlow } from "@/components/auth-flow"
import { Feed } from "@/components/feed"
import { UserSearch } from "@/components/user-search"
import { ProfileView } from "@/components/profile-view"
import { CreatePostModal } from "@/components/create-post-modal"
import { Button } from "@/components/ui/button"
import { Home, Plus, LogOut, Menu, Search, User } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-mobile"

export default function Page() {
  const { user, isLoading, logout } = useAuth()
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  
  // State to manage views
  const [currentView, setCurrentView] = useState<"feed" | "search" | "profile">("feed") 
  const [viewProfileId, setViewProfileId] = useState<number | null>(null)

  const isMobile = useMediaQuery("(max-width: 768px)")

  // --- HANDLERS ---
  const handleOpenProfile = (id: number) => {
    console.log("Opening profile for user ID:", id);
    setViewProfileId(id)
    setCurrentView("profile")
  }

  const handleOpenMyProfile = () => {
    setViewProfileId(null)
    setCurrentView("profile")
  }

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>
  if (!user) return <AuthFlow />

  return (
    <div className="flex h-screen bg-background">
      {/* SIDEBAR */}
      {!isMobile && (
        <div className="w-64 border-r border-border bg-card p-6 flex flex-col">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-primary"> Social Media v2</h1>
          </div>

          <nav className="space-y-2 flex-1">
            <Button 
              variant={currentView === "feed" ? "secondary" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setCurrentView("feed")}
            >
              <Home className="mr-2 w-5 h-5" /> Feed
            </Button>

            <Button 
              variant={currentView === "search" ? "secondary" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setCurrentView("search")}
            >
              <Search className="mr-2 w-5 h-5" /> Explore Users
            </Button>

            <Button 
              variant={currentView === "profile" && !viewProfileId ? "secondary" : "ghost"} 
              className="w-full justify-start" 
              onClick={handleOpenMyProfile}
            >
              <User className="mr-2 w-5 h-5" /> My Profile
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
      <div className="flex-1 flex flex-col md:overflow-hidden">
        {/* Mobile Header */}
        {isMobile && (
          <div className="border-b border-border bg-card p-4 flex items-center justify-between">
            <h1 className="text-xl font-bold"> Social Media v2</h1>
            <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto max-w-3xl mx-auto w-full">
          <div className="p-4 md:p-6 space-y-4">
            
            {currentView === "feed" && <Feed />}
            
            {currentView === "search" && <UserSearch onUserClick={handleOpenProfile} />}
            
            {currentView === "profile" && <ProfileView targetUserId={viewProfileId} />}

          </div>
        </div>
      </div>

      <CreatePostModal isOpen={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)} />
    </div>
  )
}