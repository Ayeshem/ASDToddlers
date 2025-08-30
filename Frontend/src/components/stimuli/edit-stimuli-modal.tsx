import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStimuliStore } from "@/store/stimuliStore";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { StimuliVideo, UpdateStimuliRequest } from "@/services/stimuliApi";

interface EditStimuliModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stimuli: StimuliVideo | null;
}

const STIMULI_CATEGORIES = [
  "Social Interaction",
  "Geometric Patterns", 
  "Animal Behaviors",
  "Human Faces",
  "Moving Objects",
  "Abstract Shapes",
  "Nature Scenes",
  "Educational Content",
  "Emotional Expressions",
  "Other"
];

export function EditStimuliModal({ open, onOpenChange, stimuli }: EditStimuliModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { updateStimuli } = useStimuliStore();
  const { toast } = useToast();

  // Populate form when stimuli data changes
  useEffect(() => {
    if (stimuli) {
      setTitle(stimuli.title);
      setDescription(stimuli.description || "");
      setCategory(stimuli.category);
      setDuration(stimuli.duration || "");
      setVideoUrl(stimuli.video_url);
    }
  }, [stimuli]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !category || !videoUrl || !stimuli) {
      toast({
        title: "Validation Error",
        description: "Title, Category, and Video URL are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const data: UpdateStimuliRequest = {
        title,
        description: description || undefined,
        category,
        duration: duration || undefined,
        video_url: videoUrl,
      };

      const success = await updateStimuli(stimuli.id, data);

      if (success) {
        toast({
          title: "Stimuli updated successfully",
          description: `${title} has been updated.`,
        });
        
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stimuli. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (stimuli) {
      setTitle(stimuli.title);
      setDescription(stimuli.description || "");
      setCategory(stimuli.category);
      setDuration(stimuli.duration || "");
      setVideoUrl(stimuli.video_url);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Stimuli Video</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description"
              disabled={isSubmitting}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category *</Label>
            <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {STIMULI_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-duration">Duration (seconds)</Label>
            <Input
              id="edit-duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Enter duration in seconds"
              disabled={isSubmitting}
              min="1"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-videoUrl">Video URL *</Label>
            <Input
              id="edit-videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Enter video URL or file path"
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter a valid video URL or file path (e.g., /stimuli/video.mp4)
            </p>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Stimuli"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 