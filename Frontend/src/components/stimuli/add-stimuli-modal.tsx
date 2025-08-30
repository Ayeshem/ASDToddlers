import { useState } from "react";
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
import { X } from "lucide-react";
import type { CreateStimuliRequest } from "@/services/stimuliApi";
import { stimuliApi } from "@/services/stimuliApi";

interface AddStimuliModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function AddStimuliModal({ open, onOpenChange }: AddStimuliModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  
  const { addStimuli } = useStimuliStore();
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/wmv'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid video file (MP4, AVI, MOV, MKV, WMV).",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 100MB.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      setVideoUrl(file.name); // Set the filename as the URL for now
    }
  };

  // Removed separate upload functionality - now handled in form submission

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !category || (!videoUrl && !selectedFile)) {
      toast({
        title: "Validation Error",
        description: "Title, Category, and either Video File or Video URL are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const data: CreateStimuliRequest = {
        title,
        description: description || undefined,
        category,
        duration: duration || undefined,
        video_url: videoUrl || undefined,
        video_file: selectedFile || undefined,
      };

      const success = await addStimuli(data);

      if (success) {
        toast({
          title: "Stimuli added successfully",
          description: `${title} has been added to the library.`,
        });
        
        // Reset form
        setTitle("");
        setDescription("");
        setCategory("");
        setDuration("");
        setVideoUrl("");
        setSelectedFile(null);
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add stimuli. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setTitle("");
    setDescription("");
    setCategory("");
    setDuration("");
    setVideoUrl("");
    setSelectedFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Stimuli Video</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description"
              disabled={isSubmitting}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
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
            <Label htmlFor="duration">Duration (seconds)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Enter duration in seconds"
              disabled={isSubmitting}
              min="1"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="videoFile">Video File *</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  id="videoFile"
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  disabled={isSubmitting}
                  className="flex-1"
                />
                {selectedFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {selectedFile && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
              
              <Input
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Or enter video URL manually"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Upload a video file or enter a video URL manually
              </p>
            </div>
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
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Adding...
                </>
              ) : (
                "Add Stimuli"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 