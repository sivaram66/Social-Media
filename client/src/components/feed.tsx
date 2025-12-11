"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "./auth-provider"
import { PostCard } from "./post-card"
import { Loader2 } from "lucide-react"
import { API_URL } from "@/lib/config"

interface FeedProps {
  onUserClick: (id: number) => void
}

export function Feed({ onUserClick }: FeedProps) {
  const { token, user } = useAuth() 

  const {
    data: feedData,
    isLoading,
    error,
  } = useQuery({
    // This forces a complete refresh whenever you log in as a different person.
    queryKey: ["feed", user?.id], 
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/posts/feed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch feed")
      return response.json()
    },
    enabled: !!token && !!user,
  })

  const posts = feedData?.data || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load feed</p>
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts yet. Start following people!</p>
      </div>
    )
  }

  return (
    <div className="space-y-0 pb-20">
      {posts.map((post: any) => (
        <PostCard
          key={post.id}
          id={post.id}
          content={post.content}
          media_url={post.media_url}
          onUserClick={onUserClick}
          user={{
            username: post.username,
            full_name: post.full_name,
            id: post.user_id,
            profile_pic_url: post.profile_pic_url,
          }}
          createdAt={post.created_at}
          likeCount={post.like_count || 0}
          commentCount={post.comment_count || 0}
          hasLiked={post.has_liked}
          commentsEnabled={post.comments_enabled}
          
        />
      ))}
    </div>
  )
}