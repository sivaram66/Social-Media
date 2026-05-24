"use client"

import { useState, useEffect } from "react"
import { Heart, MessageCircle, Trash2, Share2, Sparkles } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "./auth-provider"
import { CommentSection } from "./comment-section"
import { LikesModal } from "./likes-modal"
import { API_URL } from "@/lib/config"
import { formatDistanceToNow } from "date-fns"

interface PostCardProps {
  id: number
  content: string
  media_url?: string
  user: { username: string; full_name: string; id: number; profile_pic_url?: string }
  createdAt?: string
  likeCount: number
  commentCount: number
  hasLiked: boolean
  commentsEnabled?: boolean
  onUserClick: (id: number) => void
  isSuggested?: boolean
}

export function PostCard({ id, content, media_url, user, createdAt, likeCount, commentCount, hasLiked, commentsEnabled = true, onUserClick, isSuggested = false }: PostCardProps) {
  const { user: currentUser, token } = useAuth()
  const queryClient = useQueryClient()
  const [showComments, setShowComments] = useState(false)
  const [showLikesModal, setShowLikesModal] = useState(false)
  const [isLiked, setIsLiked] = useState(hasLiked)
  const [likes, setLikes] = useState(likeCount)
  const [likePopping, setLikePopping] = useState(false)

  useEffect(() => { setIsLiked(hasLiked); setLikes(likeCount) }, [hasLiked, likeCount])

  const isOwner = currentUser?.username === user.username

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/api/posts/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error("Failed to delete")
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["feed"] }); queryClient.invalidateQueries({ queryKey: ["my-posts"] }) }
  })

  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        const res = await fetch(`${API_URL}/api/likes/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error("Failed"); return "unliked"
      } else {
        const res = await fetch(`${API_URL}/api/likes`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ post_id: id }) })
        if (!res.ok) throw new Error("Failed"); return "liked"
      }
    },
    onSuccess: (result) => {
      if (result === "liked") { setIsLiked(true); setLikes(p => p + 1) }
      else { setIsLiked(false); setLikes(p => p - 1) }
    }
  })

  const handleLike = () => {
    setLikePopping(true)
    setTimeout(() => setLikePopping(false), 350)
    toggleLikeMutation.mutate()
  }

  if (deleteMutation.isSuccess) return null

  const timeAgo = createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : ""

  return (
    <div className="post-card bg-card border border-border rounded-2xl mb-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onUserClick(user.id)}>
          <div className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center text-sm font-semibold overflow-hidden flex-shrink-0">
            {user.profile_pic_url
              ? <img src={user.profile_pic_url} alt={user.username} className="w-full h-full object-cover" />
              : <span>{user.full_name?.charAt(0).toUpperCase()}</span>
            }
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm leading-tight hover:underline underline-offset-2">{user.full_name}</span>
              {isSuggested && !isOwner && (
                <span className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground border border-border/60">
                  <Sparkles className="w-2.5 h-2.5" />
                  Suggested
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>@{user.username}</span>
              {timeAgo && <><span>·</span><span>{timeAgo}</span></>}
            </div>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={() => { if (confirm("Delete this post?")) deleteMutation.mutate() }}
            disabled={deleteMutation.isPending}
            className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/8 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Content */}
      {content?.trim() && (
        <div className="px-4 pb-3">
          <p className="text-[14.5px] leading-relaxed text-foreground whitespace-pre-wrap">{content}</p>
        </div>
      )}

      {/* Image */}
      {media_url && (
        <div className="mx-4 mb-3 rounded-xl overflow-hidden border border-border/40 bg-secondary/30">
          <img src={media_url} alt="Post" className="w-full max-h-[500px] object-contain" />
        </div>
      )}

      {/* Actions */}
      <div className="px-2 pb-2 flex items-center border-t border-border/40 pt-2 mx-2">
        <button
          onClick={handleLike}
          disabled={toggleLikeMutation.isPending}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-150 ${isLiked ? "text-rose-500 font-medium" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Heart className={`w-4 h-4 transition-all ${isLiked ? "fill-current" : ""} ${likePopping ? "like-pop" : ""}`} />
          <button
            onClick={e => { e.stopPropagation(); likes > 0 && setShowLikesModal(true) }}
            className="hover:underline underline-offset-2 tabular-nums"
          >{likes}</button>
        </button>

        {commentsEnabled ? (
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-150 ${showComments ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="tabular-nums">{commentCount}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground/40 cursor-not-allowed" title="Comments off">
            <MessageCircle className="w-4 h-4" />
            <span>{commentCount}</span>
          </div>
        )}

        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-all ml-auto">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {commentsEnabled && showComments && (
        <div className="mx-4 pb-4 pt-3 border-t border-border/40">
          <CommentSection postId={id} onUserClick={onUserClick} />
        </div>
      )}

      {showLikesModal && (
        <LikesModal postId={id} isOpen={showLikesModal} onClose={() => setShowLikesModal(false)} onUserClick={onUserClick} />
      )}
    </div>
  )
}