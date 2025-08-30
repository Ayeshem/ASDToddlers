import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { VideoPreviewModal } from "@/components/stimuli/video-preview-modal";
import { useStimuliStore } from "@/store/stimuliStore";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Filter } from "lucide-react";
import type { StimuliVideo } from "@/services/stimuliApi";

export default function StimuliLibrary() {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewStimuli, setPreviewStimuli] = useState<StimuliVideo | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();
  
  const { 
    stimuli, 
    isLoading, 
    error, 
    fetchStimuli, 
    clearError 
  } = useStimuliStore();

  useEffect(() => { fetchStimuli(); }, [fetchStimuli]);
  useEffect(() => { clearError(); }, [clearError]);
  useEffect(() => { if (error) toast({ title: "Error", description: error, variant: "destructive" }); }, [error, toast]);

  const handlePreviewStimuli = (stimuli: StimuliVideo) => { 
    setPreviewStimuli(stimuli); 
    setShowPreviewModal(true); 
  };
  const handleRefreshStimuli = () => { fetchStimuli(); };

  const filteredStimuli = selectedCategory === "all" 
    ? (stimuli || []) 
    : (stimuli || []).filter(s => s.category === selectedCategory);
  const categories = ["all", ...Array.from(new Set((stimuli || []).map(s => s.category)))];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">View Stimuli Library</h1>
          <p className="text-muted-foreground">Browse video stimuli for gaze tracking sessions</p>
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>
          
          <Button variant="outline" onClick={handleRefreshStimuli} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        {/* Stimuli Grid */}
        <div>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading stimuli...</p>
            </div>
          ) : filteredStimuli.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border border-dashed">
              <p className="text-muted-foreground">
                {selectedCategory === "all" 
                  ? "No stimuli videos available." 
                  : `No stimuli found in the "${selectedCategory}" category.`}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredStimuli.map((stimuli) => (
                <div key={stimuli.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                  {/* Video thumbnail */}
                  <div className="w-full h-48 bg-black flex items-center justify-center">
                    <video
                      src={stimuli.video_url}
                      className="object-cover w-full h-full"
                      controls={false}
                      muted
                      preload="metadata"
                    />
                  </div>

                  {/* Video info */}
                  <div className="p-3">
                    <h3 className="font-medium text-lg">{stimuli.title}</h3>
                    <p className="text-sm text-muted-foreground">{stimuli.description || "No description"}</p>
                    <p className="text-xs text-muted-foreground mt-1">Category: {stimuli.category}</p>

                    {/* Actions (only Preview) */}
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => handlePreviewStimuli(stimuli)}>Preview</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Modal only */}
        <VideoPreviewModal 
          open={showPreviewModal} 
          onOpenChange={setShowPreviewModal} 
          stimuli={previewStimuli} 
        />
      </div>
    </DashboardLayout>
  );
}