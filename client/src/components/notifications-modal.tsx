"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Heart, MessageCircle, UserPlus, Bell } from "lucide-react"
import { useAuth } from "./auth-provider"
import { useSocket } from "./socket-provider"
import { API_URL } from "@/lib/config"
import { formatDistanceToNow } from "date-fns"

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

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      fetch(`${API_URL}/api/notifications`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
          setNotifications(data.notifications || [])
          setLoading(false)
          fetch(`${API_URL}/api/notifications/read`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } })
        })
        .catch(() => setLoading(false))
    }
  }, [isOpen, token])

  useEffect(() => {
    if (!socket) return
    const handle = (n: any) => {
      setNotifications(prev => [{
        ...n, created_at: new Date().toISOString(),
        username: n.senderName, full_name: n.senderName,
        profile_pic_url: n.senderAvatar, sender_id: n.senderId
      }, ...prev])
    }
    socket.on("notification", handle)
    return () => { socket.off("notification", handle) }
  }, [socket])

  const getLabel = (type: string) => ({
    LIKE: "liked your post",
    COMMENT: "commented on your post",
    FOLLOW: "started following you",
  }[type] || "interacted with you")

  const getIcon = (type: string) => ({
    LIKE: <Heart className="w-3 h-3 fill-current text-rose-500" />,
    COMMENT: <MessageCircle className="w-3 h-3 text-foreground" />,
    FOLLOW: <UserPlus className="w-3 h-3 text-foreground" />,
  }[type] || <Bell className="w-3 h-3 text-muted-foreground" />)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md premium-card rounded-2xl shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl premium-logo flex items-center justify-center">
              <Bell className="w-3.5 h-3.5 text-background" />
            </div>
            <DialogTitle className="text-sm font-semibold">Notifications</DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[460px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center">
                <Bell className="w-5 h-5 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-sm font-medium">All caught up</p>
                <p className="text-xs text-muted-foreground mt-0.5">Notifications will show here</p>
              </div>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((n, i) => {
                const timeAgo = n.created_at ? formatDistanceToNow(new Date(n.created_at), { addSuffix: true }) : ""
                return (
                  <div
                    key={i}
                    onClick={() => { onUserClick(n.sender_id); onClose() }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/70 transition-colors cursor-pointer group"
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-semibold overflow-hidden flex-shrink-0">
                      {n.profile_pic_url
                        ? <img src={n.profile_pic_url} className="w-full h-full object-cover" alt="" />
                        : <span>{n.username?.[0]?.toUpperCase()}</span>
                      }
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">
                        <span className="font-semibold">{n.username}</span>
                        {" "}
                        <span className="text-muted-foreground">{getLabel(n.type)}</span>
                      </p>
                      {timeAgo && <p className="text-[11px] text-muted-foreground/60 mt-0.5">{timeAgo}</p>}
                    </div>

                    {/* Icon badge */}
                    <div className="w-6 h-6 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                      {getIcon(n.type)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
