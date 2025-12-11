"use client"

import { useState, useEffect } from "react"
import { Heart, MessageCircle, Trash2, Share2 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "./auth-provider"
import { CommentSection } from "./comment-section"
import { LikesModal } from "./likes-modal"
import { Button } from "@/components/ui/button"
import { API_URL } from "@/lib/config"

interface PostCardProps {
  id: number
  content: string
  media_url?: string
  user: {
    username: string
    full_name: string
    id: number
    profile_pic_url?: string // <--- 1. Added this
  }
  createdAt?: string
  likeCount: number
  commentCount: number
  hasLiked: boolean
  commentsEnabled?: boolean
  onUserClick: (id: number) => void
}

export function PostCard({ 
  id, 
  content, 
  media_url, 
  user, 
  createdAt, 
  likeCount, 
  commentCount, 
  hasLiked, 
  commentsEnabled = true,
  onUserClick 
}: PostCardProps) {
  const { user: currentUser, token } = useAuth()
  const queryClient = useQueryClient()
  const [showComments, setShowComments] = useState(false)
  const [showLikesModal, setShowLikesModal] = useState(false)

  // State
  const [isLiked, setIsLiked] = useState(hasLiked)
  const [likes, setLikes] = useState(likeCount)

  useEffect(() => {
    setIsLiked(hasLiked)
    setLikes(likeCount)
  }, [hasLiked, likeCount])

  const isOwner = currentUser?.username === user.username

  // --- DELETE POST ---
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/api/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to delete")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] })
      queryClient.invalidateQueries({ queryKey: ["my-posts"] })
    }
  })

  // --- LIKE TOGGLE ---
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      const action = isLiked ? "unlike" : "like"
      if (action === "unlike") {
        const res = await fetch(`${API_URL}/api/likes/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to unlike")
        return "unliked"
      } else {
        const res = await fetch(`${API_URL}/api/likes`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ post_id: id }),
        })
        if (!res.ok) throw new Error("Failed to like")
        return "liked"
      }
    },
    onSuccess: (result) => {
      if (result === "liked") {
        setIsLiked(true)
        setLikes((prev) => prev + 1)
      } else {
        setIsLiked(false)
        setLikes((prev) => prev - 1)
      }
      queryClient.invalidateQueries({ queryKey: ["feed"] })
    },
    onError: (err) => {
      console.error("Like failed:", err)
    }
  })

  if (deleteMutation.isSuccess) return null

  return (
    <div className="w-full bg-card border border-border/60 rounded-xl mb-6 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      
      {/* 1. HEADER */}
      <div className="flex items-center justify-between p-4">
        <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onUserClick(user.id)}
        >
          {/* --- 2. UPDATED AVATAR SECTION --- */}
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
            <div className="h-full w-full rounded-full bg-background flex items-center justify-center text-foreground font-bold text-sm border-2 border-background overflow-hidden relative">
              {user.profile_pic_url ? (
                  <img 
                    src={user.profile_pic_url} 
                    alt={user.username} 
                    className="w-full h-full object-cover" 
                  />
              ) : (
                  user.full_name?.charAt(0).toUpperCase()
              )}
            </div>
          </div>
          {/* ---------------------------------- */}

          <div>
            <p className="font-semibold text-sm leading-none group-hover:underline">{user.full_name}</p>
            <p className="text-xs text-muted-foreground mt-1">@{user.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {createdAt && (
            <span className="text-xs text-muted-foreground">
              {new Date(createdAt).toLocaleDateString()}
            </span>
          )}
          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
              onClick={() => { if(confirm("Delete this post?")) deleteMutation.mutate() }}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* 2. TEXT CONTENT */}
      {content && content.trim() !== "" && (
        <div className="px-4 pb-3">
          <p className="text-foreground text-[15px] leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>
      )}

      {/* 3. IMAGE */}
      {media_url && (
        <div className="w-full bg-muted/20 flex justify-center border-y border-border/40">
          <img
            src={media_url}
            alt="Post media"
            className="w-full max-h-[500px] object-contain"
          />
        </div>
      )}

      {/* 4. ACTION BAR */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            
            {/* Like */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleLikeMutation.mutate()}
                disabled={toggleLikeMutation.isPending}
                className={`h-9 w-9 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors ${
                  isLiked ? "text-red-500" : "text-muted-foreground"
                }`}
              >
                <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
              </Button>
              <button 
                onClick={() => likes > 0 && setShowLikesModal(true)}
                className="text-sm font-medium tabular-nums hover:underline cursor-pointer"
              >
                {likes} <span className="hidden sm:inline text-muted-foreground font-normal">likes</span>
              </button>
            </div>

            {/* Comment */}
            <div className="flex items-center gap-1">
              {commentsEnabled ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowComments(!showComments)}
                  className="h-9 w-9 rounded-full hover:bg-blue-50 hover:text-blue-500 text-muted-foreground transition-colors"
                >
                  <MessageCircle className="w-6 h-6" />
                </Button>
              ) : (
                <div className="h-9 w-9 flex items-center justify-center opacity-50 cursor-not-allowed" title="Comments disabled">
                   <MessageCircle className="w-6 h-6" />
                </div>
              )}
              <span className="text-sm font-medium tabular-nums text-muted-foreground">
                {commentCount}
              </span>
            </div>

            {/* Share */}
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:bg-green-50 hover:text-green-600">
                <Share2 className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {commentsEnabled && showComments && (
          <div className="mt-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2">
            <CommentSection postId={id} onUserClick={onUserClick} />
          </div>
        )}
      </div>

      {showLikesModal && (
        <LikesModal postId={id} isOpen={showLikesModal} onClose={() => setShowLikesModal(false)} onUserClick={onUserClick} />
      )}
    </div>
  )
}