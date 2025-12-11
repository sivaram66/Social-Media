"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Heart, MessageCircle, UserPlus, Bell } from "lucide-react"
import { useAuth } from "./auth-provider"
import { useSocket } from "./socket-provider"

interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
  onUserClick: (id: number) => void 
}

export function NotificationsModal({ isOpen, onClose, onUserClick }: NotificationsModalProps) {
  const { token } = useAuth()
  const { socket } = useSocket()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 1. Fetch History
  useEffect(() => {
    if (isOpen) {
      fetch("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setNotifications(data.notifications || [])
          setLoading(false)
          // Mark read
          fetch("http://localhost:5000/api/notifications/read", {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          })
        })
        .catch((err) => console.error(err))
    }
  }, [isOpen, token])

  // 2. Listen for Real-Time Updates
  useEffect(() => {
    if (!socket) return

    const handleNewNotification = (newNotif: any) => {
      setNotifications((prev) => [
        {
          ...newNotif,
          created_at: new Date().toISOString(),
          username: newNotif.senderName,
          full_name: newNotif.senderName,
          profile_pic_url: newNotif.senderAvatar,
          sender_id: newNotif.senderId 
        },
        ...prev,
      ])
    }

    socket.on("notification", handleNewNotification)
    return () => { socket.off("notification", handleNewNotification) }
  }, [socket])

  const getIcon = (type: string) => {
    switch (type) {
      case "LIKE": return <Heart className="w-4 h-4 text-red-500 fill-current" />
      case "COMMENT": return <MessageCircle className="w-4 h-4 text-blue-500" />
      case "FOLLOW": return <UserPlus className="w-4 h-4 text-green-500" />
      default: return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No notifications yet.</div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n, i) => (
                <div 
                    key={i} 
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors border border-transparent hover:border-border/50 cursor-pointer"
                    // 3. Navigate on Click
                    onClick={() => {
                        onUserClick(n.sender_id); 
                        onClose();
                    }}
                >
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-secondary overflow-hidden flex-shrink-0 border border-border/50">
                     {n.profile_pic_url ? (
                        <img src={n.profile_pic_url} className="w-full h-full object-cover" alt="" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground">
                            {n.username?.[0]?.toUpperCase()}
                        </div>
                     )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-semibold hover:underline">{n.username}</span>{" "}
                      {n.type === "LIKE" && "liked your post"}
                      {n.type === "COMMENT" && "commented on your post"}
                      {n.type === "FOLLOW" && "started following you"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {getIcon(n.type)}
                        <span>{new Date(n.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}