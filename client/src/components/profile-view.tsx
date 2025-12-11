"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "./auth-provider"
import { PostCard } from "./post-card"
import { FollowModal } from "./follow-modal"
import { ProfileUploadModal } from "./profile-upload-modal" // Import the modal
import { Loader2, Calendar, Mail, UserPlus, UserMinus, Camera } from "lucide-react" // Added Camera
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface ProfileViewProps {
  targetUserId?: number | null
  onUserClick?: (id: number) => void
}

export function ProfileView({ targetUserId, onUserClick }: ProfileViewProps) {
  const { user: currentUser, token } = useAuth()
  const queryClient = useQueryClient()
  
  const [modalType, setModalType] = useState<"followers" | "following" | null>(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false) // State for upload modal
  const [selectedImage, setSelectedImage] = useState<string | null>(null) // State for selected file preview

  // Determine if viewing "Me" or "Others"
  const isMe = !targetUserId || Number(targetUserId) === Number(currentUser?.id)
  
  // 1. Fetch Profile Data
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", isMe ? "me" : targetUserId],
    queryFn: async () => {
      const url = isMe 
        ? "http://localhost:5000/api/users/stats" 
        : `http://localhost:5000/api/users/${targetUserId}/profile`
      
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error("Failed to fetch profile")
      return res.json()
    },
    enabled: !!token,
  })

  // Normalize Data
  const displayUser = isMe ? currentUser : profileData?.user
  // If viewing me, stats come from the stats endpoint directly. If other, they are nested in user object.
  const stats = isMe ? profileData : profileData?.user 
  const isFollowing = profileData?.user?.is_following

  // Use the profile pic from the API data if available (stats for me, user for others)
  // Note: For 'isMe', we might need to refresh the currentUser context or rely on the stats endpoint returning the URL.
  // Let's assume the stats endpoint OR the user context has the URL. 
  // Ideally, the "stats" endpoint should return the profile_pic_url too.
  const profilePicUrl = isMe ? (profileData?.profile_pic_url || displayUser?.profile_pic_url) : displayUser?.profile_pic_url

  // 2. Fetch Posts
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["posts", isMe ? "me" : targetUserId],
    queryFn: async () => {
      const url = isMe 
        ? "http://localhost:5000/api/posts/my"
        : `http://localhost:5000/api/posts/user/${targetUserId}`
      
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      return res.json()
    },
    enabled: !!token,
  })

  const posts = postsData?.posts || []

  // --- MUTATIONS ---

  const toggleFollowMutation = useMutation({
    mutationFn: async () => {
      const endpoint = isFollowing ? "unfollow" : "follow"
      await fetch(`http://localhost:5000/api/users/${endpoint}`, {
        method: isFollowing ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: targetUserId }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", targetUserId] })
      queryClient.invalidateQueries({ queryKey: ["following"] })
    }
  })

  // Upload Mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (blob: Blob) => {
        const formData = new FormData()
        formData.append("avatar", blob) 

        const res = await fetch("http://localhost:5000/api/users/profile-pic", {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        })
        if(!res.ok) throw new Error("Upload failed")
        return res.json()
    },
    onSuccess: () => {
        setIsUploadOpen(false)
        setSelectedImage(null)
        // Refresh profile data to show new image
        queryClient.invalidateQueries({ queryKey: ["profile", "me"] })
        // Force reload page to update User Context (since we store user in localStorage)
        // Alternatively, you could update the context, but reload is easier for now
        window.location.reload()
    }
  })

  // Handle File Selection
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.addEventListener("load", () => setSelectedImage(reader.result as string))
      reader.readAsDataURL(file)
      setIsUploadOpen(true)
    }
  }

  if (profileLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div>
  if (!displayUser) return <div className="p-8 text-center">User not found</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            
            {/* --- AVATAR SECTION --- */}
            <div className="relative group">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-background shadow-xl overflow-hidden">
                    {profilePicUrl ? (
                        <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        displayUser.full_name?.charAt(0).toUpperCase()
                    )}
                </div>

                {/* Edit Button (Only visible if it is ME) */}
                {isMe && (
                    <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-sm">
                        <Camera className="w-4 h-4" />
                        <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                    </label>
                )}
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div>
                <h2 className="text-2xl font-bold">{displayUser.full_name}</h2>
                <p className="text-muted-foreground">@{displayUser.username}</p>
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                {isMe && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {displayUser.email}
                    </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Member
                </div>
              </div>

               {!isMe && (
                <Button 
                    size="sm" 
                    variant={isFollowing ? "outline" : "default"}
                    onClick={() => toggleFollowMutation.mutate()}
                    disabled={toggleFollowMutation.isPending}
                    className="mt-2"
                >
                    {isFollowing ? <><UserMinus className="mr-2 h-4 w-4"/> Unfollow</> : <><UserPlus className="mr-2 h-4 w-4"/> Follow</>}
                </Button>
               )}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => isMe && setModalType("followers")}
                disabled={!isMe}
                className={`text-center p-3 bg-secondary/50 rounded-lg min-w-[80px] ${isMe ? 'hover:bg-secondary cursor-pointer' : ''}`}
              >
                <p className="text-2xl font-bold text-primary">{stats?.followers || 0}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase">Followers</p>
              </button>
              
              <button 
                 onClick={() => isMe && setModalType("following")}
                 disabled={!isMe}
                 className={`text-center p-3 bg-secondary/50 rounded-lg min-w-[80px] ${isMe ? 'hover:bg-secondary cursor-pointer' : ''}`}
              >
                <p className="text-2xl font-bold text-primary">{stats?.following || 0}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase">Following</p>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            Posts <span className="text-sm font-normal text-muted-foreground">({posts.length})</span>
        </h3>

        {postsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post: any) => (
              <PostCard
                key={post.id}
                id={post.id}
                content={post.content}
                media_url={post.media_url}
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
                onUserClick={onUserClick || (() => {})} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-secondary/20 rounded-lg border border-dashed">
            <p className="text-muted-foreground">No posts yet.</p>
          </div>
        )}
      </div>

      {isMe && modalType && (
        <FollowModal isOpen={!!modalType} onClose={() => setModalType(null)} type={modalType} />
      )}

      {/* CROPPER MODAL */}
      {isUploadOpen && selectedImage && (
        <ProfileUploadModal 
            imageSrc={selectedImage}
            isOpen={isUploadOpen}
            onClose={() => { setIsUploadOpen(false); setSelectedImage(null); }}
            onUpload={(blob) => uploadAvatarMutation.mutate(blob)}
            isLoading={uploadAvatarMutation.isPending}
        />
      )}
    </div>
  )
}