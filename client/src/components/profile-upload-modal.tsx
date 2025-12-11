"use client"

import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import getCroppedImg from "@/lib/cropImage"
import { Loader2 } from "lucide-react"

interface ProfileUploadModalProps {
  imageSrc: string
  isOpen: boolean
  onClose: () => void
  onUpload: (blob: Blob) => void
  isLoading: boolean
}

export function ProfileUploadModal({ imageSrc, isOpen, onClose, onUpload, isLoading }: ProfileUploadModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
      onUpload(croppedImage)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Profile Picture</DialogTitle>
        </DialogHeader>
        
        <div className="relative w-full h-64 bg-black/5 rounded-md overflow-hidden mt-4">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1} 
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            cropShape="round" 
            showGrid={false}
          />
        </div>

        <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">Zoom</p>
            <Slider 
                value={[zoom]} 
                min={1} 
                max={3} 
                step={0.1} 
                onValueChange={(value) => setZoom(value[0])} 
            />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Profile Picture"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}