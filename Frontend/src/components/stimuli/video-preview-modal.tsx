import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useState, useRef } from "react";
import type { StimuliVideo } from "@/services/stimuliApi";

interface VideoPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stimuli: StimuliVideo | null;
}

export function VideoPreviewModal({ open, onOpenChange, stimuli }: VideoPreviewModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  const formatDuration = (duration: string | undefined) => {
    if (!duration) return "Unknown";
    const seconds = parseInt(duration);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!stimuli) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{stimuli.title}</span>
            <Badge variant="secondary">{stimuli.category}</Badge>
            {stimuli.duration && (
              <Badge variant="outline">{formatDuration(stimuli.duration)}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Video Player */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-64 object-contain"
              onEnded={handleVideoEnded}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src={stimuli.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayPause}
                  className="text-white hover:text-white"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMuteToggle}
                  className="text-white hover:text-white"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Video Details */}
          <div className="space-y-2">
            <h3 className="font-semibold">{stimuli.title}</h3>
            {stimuli.description && (
              <p className="text-sm text-muted-foreground">{stimuli.description}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Category: {stimuli.category}</span>
              {stimuli.duration && (
                <span>• Duration: {formatDuration(stimuli.duration)}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              URL: {stimuli.video_url}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 