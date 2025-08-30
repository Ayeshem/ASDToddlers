import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Play, Eye } from "lucide-react";
import type { StimuliVideo } from "@/services/stimuliApi";

interface StimuliCardProps {
  stimuli: StimuliVideo;
  onEdit: (stimuli: StimuliVideo) => void;
  onDelete: (id: string) => void;
  onPreview: (stimuli: StimuliVideo) => void;
}

export function StimuliCard({ stimuli, onEdit, onDelete, onPreview }: StimuliCardProps) {
  const formatDuration = (duration: string | undefined) => {
    if (!duration) return "Unknown";
    const seconds = parseInt(duration);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{stimuli.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{stimuli.category}</Badge>
              {stimuli.duration && (
                <Badge variant="outline">{formatDuration(stimuli.duration)}</Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(stimuli)}
            className="h-8 w-8 p-0 ml-2"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {stimuli.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {stimuli.description}
          </p>
        )}
        
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => onPreview(stimuli)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview(stimuli)}
          >
            <Play className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(stimuli.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>URL: {stimuli.video_url}</p>
        </div>
      </CardContent>
    </Card>
  );
} 