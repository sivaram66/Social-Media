"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "./auth-provider"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, User } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LikesModalProps {
  postId: number
  isOpen: boolean
  onClose: () => void
  onUserClick: (id: number) => void 
}

export function LikesModal({ postId, isOpen, onClose, onUserClick }: LikesModalProps) {
  const { token } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ["post-likes", postId],
    queryFn: async () => {
      const res = await fetch(`http://localhost:5000/api/likes/post/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch likes")
      return res.json()
    },
    enabled: isOpen,
  })

  const users = data?.users || []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Likes</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[300px] pr-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No likes yet.</p>
          ) : (
            <div className="space-y-2">
              {users.map((u: any) => (
                <div 
                    key={u.id} 
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                    onClick={() => {
                        onUserClick(u.id); // 1. Navigate to profile
                        onClose(); // 2. Close the modal so you can see the profile page
                    }}
                >
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden border border-border/50">
                    {u.profile_pic_url ? (
                        <img src={u.profile_pic_url} alt={u.username} className="w-full h-full object-cover" />
                    ) : (
                        <span className="font-bold text-muted-foreground">{u.full_name?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm leading-none">{u.full_name}</p>
                    <p className="text-xs text-muted-foreground mt-1">@{u.username}</p>
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