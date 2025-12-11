"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "./auth-provider"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, User, UserMinus, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FollowModalProps {
  isOpen: boolean
  onClose: () => void
  type: "followers" | "following" 
}

export function FollowModal({ isOpen, onClose, type }: FollowModalProps) {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  // 1. Fetch the list (Followers or Following)
  const { data, isLoading } = useQuery({
    queryKey: [type], 
    queryFn: async () => {
      const endpoint = type === "followers" 
        ? "http://localhost:5000/api/users/followers"
        : "http://localhost:5000/api/users/following"
      
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return res.json()
    },
    enabled: isOpen, 
  })

  // 2. Action: Unfollow (When viewing 'following')
  const unfollowMutation = useMutation({
    mutationFn: async (userId: number) => {
      await fetch("http://localhost:5000/api/users/unfollow", {
        method: "DELETE",
        headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ user_id: userId }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["following"] })
      queryClient.invalidateQueries({ queryKey: ["my-stats"] })
    }
  })

  // 3. Action: Remove Follower (When viewing 'followers')
  const removeFollowerMutation = useMutation({
    mutationFn: async (userId: number) => {
      await fetch(`http://localhost:5000/api/users/followers/${userId}`, {
        method: "DELETE", // We just created this endpoint!
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followers"] })
      queryClient.invalidateQueries({ queryKey: ["my-stats"] })
    }
  })

  const userList = data?.users || []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="capitalize">{type}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[300px] pr-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : userList.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No users found.</p>
          ) : (
            <div className="space-y-4">
              {userList.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{u.full_name}</p>
                      <p className="text-xs text-muted-foreground">@{u.username}</p>
                    </div>
                  </div>

                  {type === "following" ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => unfollowMutation.mutate(u.id)}
                      disabled={unfollowMutation.isPending}
                    >
                      Unfollow
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeFollowerMutation.mutate(u.id)}
                      disabled={removeFollowerMutation.isPending}
                      title="Remove follower"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}