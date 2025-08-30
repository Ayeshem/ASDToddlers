import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { adminApi, type StimuliVideo } from "@/services/adminApi";
import { Video, RefreshCw, Edit, Trash2, Eye, AlertTriangle, Plus } from "lucide-react";

export function StimuliManagementTab() {
  const [stimuli, setStimuli] = useState<StimuliVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStimuli();
  }, []);

  const fetchStimuli = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const stimuliData = await adminApi.getAllStimuli();
      setStimuli(stimuliData);
    } catch (error) {
      console.error('Failed to fetch stimuli:', error);
      setError('Failed to load stimuli data');
      toast({
        title: "Error",
        description: "Failed to load stimuli data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewStimulus = (stimulus: any) => {
    // Open video in new tab
    window.open(stimulus.video_url, '_blank');
  };

  const handleEditStimulus = (stimulus: any) => {
    // Navigate to stimuli library with edit mode
    window.location.href = `/stimuli-library?edit=${stimulus.id}`;
  };

  const handleDeleteStimulus = async (stimulus: StimuliVideo) => {
    try {
      await adminApi.deleteStimuli(stimulus.id);
      toast({
        title: "Stimulus deleted",
        description: `${stimulus.title} has been removed from the library.`,
      });
      // Refresh the list
      await fetchStimuli();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "There was an error deleting the stimulus.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading stimuli data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button variant="outline" onClick={fetchStimuli}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Stimuli Library Management</h3>
        <Button variant="outline" onClick={fetchStimuli} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stimuli Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Stimuli Library ({stimuli.length} videos)
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => window.location.href = '/stimuli-library'}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Stimulus
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/stimuli-library'}>
                <Video className="h-4 w-4 mr-2" />
                View Full Library
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stimuli.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No stimuli videos found</p>
                <p className="text-sm">Add videos to the stimuli library to get started</p>
                <Button 
                  className="mt-4" 
                  onClick={() => window.location.href = '/stimuli-library'}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Stimulus
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stimuli.map((stimulus) => (
                  <div key={stimulus.id} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{stimulus.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {stimulus.description || 'No description available'}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewStimulus(stimulus)}
                          title="View Video"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditStimulus(stimulus)}
                          title="Edit Stimulus"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteStimulus(stimulus)}
                          title="Delete Stimulus"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {stimulus.category}
                      </Badge>
                      {stimulus.duration && (
                        <span>{stimulus.duration}s</span>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <p className="truncate" title={stimulus.video_url}>
                        {stimulus.video_url}
                      </p>
                      {stimulus.uploaded_by && (
                        <p className="mt-1">Uploaded by: {stimulus.uploaded_by}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stimuli Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Stimuli Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{stimuli.length}</div>
              <div className="text-sm text-muted-foreground">Total Videos</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {stimuli.filter(s => s.category === 'Moving Objects').length}
              </div>
              <div className="text-sm text-muted-foreground">Moving Objects</div>
            </div>
          </div>
          
          {/* Category Distribution */}
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Category Distribution</h4>
            <div className="space-y-2">
              {Array.from(new Set(stimuli.map(s => s.category))).map((category) => (
                <div key={category} className="flex items-center justify-between text-sm">
                  <span>{category}</span>
                  <span className="font-medium">
                    {stimuli.filter(s => s.category === category).length}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
