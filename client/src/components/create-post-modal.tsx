"use client"

import type React from "react"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, ImageIcon, Loader2, X, MessageSquare } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox" // Ensure you have this or use standard input

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const [content, setContent] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // NEW: State for comments toggle
  const [commentsEnabled, setCommentsEnabled] = useState(true)

  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData()
      formData.append("content", content)
      // NEW: Send the boolean setting
      formData.append("comments_enabled", String(commentsEnabled))
      
      if (file) {
        formData.append("media", file)
      }

      const response = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!response.ok) {
         const data = await response.json().catch(() => ({}));
         throw new Error(data.error || "Failed to create post");
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] })
      queryClient.invalidateQueries({ queryKey: ["my-posts"] })
      setContent("")
      setFile(null)
      setPreview(null)
      setError(null)
      setCommentsEnabled(true) // Reset to default
      onClose()
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to create post")
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleSubmit = () => {
    if (!content.trim() && !file) {
      setError("Please add text or an image")
      return
    }
    mutation.mutate()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Post</DialogTitle>
          <DialogDescription>Share your thoughts with the community</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-24 resize-none"
            disabled={mutation.isPending}
          />

          {preview && (
            <div className="relative rounded-lg overflow-hidden border border-border bg-black/5 flex justify-center">
              <img src={preview} alt="Preview" className="w-full max-h-[400px] object-contain" />
              <button
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors">
              <ImageIcon className="w-4 h-4" />
              <span className="text-sm">Add image</span>
              <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" disabled={mutation.isPending} />
            </label>

            {/* NEW: Comments Toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground select-none">
              <input 
                type="checkbox" 
                checked={commentsEnabled} 
                onChange={(e) => setCommentsEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              Allow Comments
            </label>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={mutation.isPending} className="flex-1 bg-transparent">Cancel</Button>
            <Button onClick={handleSubmit} disabled={mutation.isPending || (!content.trim() && !file)} className="flex-1">
              {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...</> : "Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}