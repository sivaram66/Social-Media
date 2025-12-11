"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "./auth-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search, UserPlus, UserMinus, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

// Added interface for props
interface UserSearchProps {
  onUserClick: (id: number) => void
}

export function UserSearch({ onUserClick }: UserSearchProps) {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  
  // 1. Fetch who I am already following
  const { data: followingData } = useQuery({
    queryKey: ["following"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/users/following", {
        headers: { Authorization: `Bearer ${token}` },
      })
      return res.json()
    },
    enabled: !!token,
  })

  const followingIds = new Set(followingData?.users?.map((u: any) => u.id))

  // 2. Search Query
  const { data: searchData, isLoading } = useQuery({
    queryKey: ["search", searchTerm],
    queryFn: async () => {
      if (!searchTerm) return { users: [] }
      const res = await fetch(`http://localhost:5000/api/users/search?q=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return res.json()
    },
    enabled: searchTerm.length > 0,
  })

  // 3. Follow Mutation
  const followMutation = useMutation({
    mutationFn: async (userId: number) => {
      await fetch("http://localhost:5000/api/users/follow", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ user_id: userId }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["following"] })
      queryClient.invalidateQueries({ queryKey: ["feed"] })
      // Also invalidate profile queries to update stats
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
  })

  // 4. Unfollow Mutation
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
      queryClient.invalidateQueries({ queryKey: ["feed"] })
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
  })

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-4">
        {isLoading && (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {searchData?.users?.map((user: any) => {
           const isFollowing = followingIds.has(user.id);
           
           return (
            <Card 
                key={user.id} 
                className="cursor-pointer hover:border-primary transition-colors"
            >
              <CardContent 
                className="p-4 flex items-center justify-between"
                onClick={(e) => {
                    // 1. Stop if clicking a button
                    if((e.target as HTMLElement).closest('button')) return;
                    
                    // 2. Safety Check: Does the function exist?
                    if (typeof onUserClick === 'function') {
                      onUserClick(user.id);
                    } else {
                      console.error("CRITICAL ERROR: 'onUserClick' prop is missing in UserSearch!");
                      console.log("Make sure <UserSearch onUserClick={...} /> is in page.tsx");
                    }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={isFollowing ? "outline" : "default"}
                  onClick={() => {
                    if (isFollowing) unfollowMutation.mutate(user.id)
                    else followMutation.mutate(user.id)
                  }}
                  disabled={followMutation.isPending || unfollowMutation.isPending}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="mr-2 h-4 w-4" /> Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" /> Follow
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}

        {searchTerm && searchData?.users?.length === 0 && (
          <p className="text-center text-muted-foreground">No users found.</p>
        )}
      </div>
    </div>
  )
  console.log("I AM THE CORRECT FILE!!!");
}