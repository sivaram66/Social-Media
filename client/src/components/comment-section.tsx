"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Send } from "lucide-react"
import { API_URL } from "@/lib/config"

interface CommentSectionProps {
  postId: number
  onUserClick: (id: number) => void 
}

export function CommentSection({ postId, onUserClick }: CommentSectionProps) {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const [newComment, setNewComment] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/comments/post/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return res.json()
    },
  })

  const addCommentMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ post_id: postId, content: newComment }),
      })
      if (!res.ok) throw new Error("Failed to comment")
      return res.json()
    },
    onSuccess: () => {
      setNewComment("")
      queryClient.invalidateQueries({ queryKey: ["comments", postId] })
      queryClient.invalidateQueries({ queryKey: ["feed"] })
      queryClient.invalidateQueries({ queryKey: ["my-posts"] })
    },
  })

  const comments = data?.data || []

  return (
    <div className="pt-4 border-t border-border space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && newComment.trim() && addCommentMutation.mutate()}
        />
        <Button
          size="icon"
          onClick={() => addCommentMutation.mutate()}
          disabled={!newComment.trim() || addCommentMutation.isPending}
        >
          {addCommentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>

      <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
        {isLoading ? (
          <div className="flex justify-center"><Loader2 className="h-4 w-4 animate-spin" /></div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center">No comments yet.</p>
        ) : (
          comments.map((c: any) => (
            <div key={c.id} className="flex gap-2 text-sm">
              <span 
                className="font-bold whitespace-nowrap cursor-pointer hover:underline"
                onClick={() => onUserClick(c.user_id)} // Navigate
              >
                {c.username}
              </span>
              <p className="text-muted-foreground break-words">{c.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}