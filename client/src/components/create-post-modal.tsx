"use client"

import type React from "react"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "./auth-provider"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, ImageIcon, Loader2, X, Send, MessageSquare } from "lucide-react"
import { API_URL } from "@/lib/config"

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  const [content, setContent] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [commentsEnabled, setCommentsEnabled] = useState(true)

  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData()
      formData.append("content", content)
      formData.append("comments_enabled", String(commentsEnabled))
      if (file) formData.append("media", file)
      const res = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || "Failed") }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] })
      queryClient.invalidateQueries({ queryKey: ["my-posts"] })
      setContent(""); setFile(null); setPreview(null); setError(null); setCommentsEnabled(true)
      onClose()
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Failed to create post"),
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(f)
    }
  }

  const handleSubmit = () => {
    if (!content.trim() && !file) { setError("Add some text or an image"); return }
    mutation.mutate()
  }

  const maxChars = 500

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg premium-card rounded-2xl shadow-2xl p-0 overflow-hidden">

        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center text-sm font-semibold overflow-hidden flex-shrink-0">
              {(user as any)?.profile_pic_url
                ? <img src={(user as any).profile_pic_url} alt="" className="w-full h-full object-cover" />
                : user?.full_name?.charAt(0).toUpperCase()
              }
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold leading-none">{user?.full_name}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">@{user?.username}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/8 border border-destructive/20 rounded-xl text-sm text-destructive">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={e => setContent(e.target.value.slice(0, maxChars))}
            className="min-h-[100px] resize-none bg-secondary/60 border-border/50 focus:border-ring/50 focus:ring-0 rounded-xl text-sm placeholder:text-muted-foreground/50"
            disabled={mutation.isPending}
          />

          <div className="flex justify-end">
            <span className={`text-xs tabular-nums ${content.length > maxChars * 0.9 ? "text-destructive" : "text-muted-foreground/40"}`}>
              {content.length}/{maxChars}
            </span>
          </div>

          {preview && (
            <div className="relative rounded-xl overflow-hidden border border-border/60 bg-secondary/30">
              <img src={preview} alt="Preview" className="w-full max-h-[280px] object-contain" />
              <button
                onClick={() => { setFile(null); setPreview(null) }}
                className="absolute top-2 right-2 bg-background/80 hover:bg-background text-foreground rounded-full p-1.5 border border-border transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between pt-1 border-t border-border/40">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 hover:bg-secondary cursor-pointer transition-colors text-xs text-muted-foreground hover:text-foreground">
                <ImageIcon className="w-3.5 h-3.5" />
                {file ? "Change" : "Image"}
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" disabled={mutation.isPending} />
              </label>

              <button
                type="button"
                onClick={() => setCommentsEnabled(!commentsEnabled)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                  commentsEnabled
                    ? "border-ring/30 premium-button"
                    : "border-border/60 text-muted-foreground hover:bg-secondary"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Comments
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                disabled={mutation.isPending}
                className="px-4 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={mutation.isPending || (!content.trim() && !file)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg premium-button text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 active:scale-95"
              >
                {mutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {mutation.isPending ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
