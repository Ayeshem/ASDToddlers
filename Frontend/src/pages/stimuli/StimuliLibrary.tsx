// import { useState, useEffect } from "react";
// import { DashboardLayout } from "@/components/layout/dashboard-layout";
// import { Button } from "@/components/ui/button";
// import { StimuliCard } from "@/components/stimuli/stimuli-card";
// import { AddStimuliModal } from "@/components/stimuli/add-stimuli-modal";
// import { EditStimuliModal } from "@/components/stimuli/edit-stimuli-modal";
// import { VideoPreviewModal } from "@/components/stimuli/video-preview-modal";
// import { useStimuliStore } from "@/store/stimuliStore";
// import { useToast } from "@/hooks/use-toast";
// import { Plus, RefreshCw, Filter } from "lucide-react";
// import type { StimuliVideo } from "@/services/stimuliApi";

// export default function StimuliLibrary() {
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showPreviewModal, setShowPreviewModal] = useState(false);
//   const [editingStimuli, setEditingStimuli] = useState<StimuliVideo | null>(null);
//   const [previewStimuli, setPreviewStimuli] = useState<StimuliVideo | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState<string>("all");
//   const { toast } = useToast();
  
//   const { 
//     stimuli, 
//     isLoading, 
//     error, 
//     fetchStimuli, 
//     deleteStimuli, 
//     clearError 
//   } = useStimuliStore();

//   // Fetch stimuli when component mounts
//   useEffect(() => {
//     fetchStimuli();
//   }, [fetchStimuli]);

//   // Clear error when component mounts
//   useEffect(() => {
//     clearError();
//   }, [clearError]);

//   // Show error toast if there's an error
//   useEffect(() => {
//     if (error) {
//       toast({
//         title: "Error",
//         description: error,
//         variant: "destructive",
//       });
//     }
//   }, [error, toast]);

//   const handleEditStimuli = (stimuli: StimuliVideo) => {
//     setEditingStimuli(stimuli);
//     setShowEditModal(true);
//   };

//   const handleDeleteStimuli = async (id: string) => {
//     const success = await deleteStimuli(id);
//     if (success) {
//       toast({
//         title: "Stimuli deleted",
//         description: "The stimuli has been removed from the library.",
//       });
//     }
//   };

//   const handlePreviewStimuli = (stimuli: StimuliVideo) => {
//     setPreviewStimuli(stimuli);
//     setShowPreviewModal(true);
//   };

//   const handleCloseEditModal = () => {
//     setShowEditModal(false);
//     setEditingStimuli(null);
//   };

//   const handleRefreshStimuli = () => {
//     fetchStimuli();
//   };

//   // Filter stimuli by category
//   const filteredStimuli = selectedCategory === "all" 
//     ? (stimuli || [])
//     : (stimuli || []).filter(s => s.category === selectedCategory);

//   // Get unique categories for filter
//   const categories = ["all", ...Array.from(new Set((stimuli || []).map(s => s.category)))];

//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold">Stimuli Library</h1>
//             <p className="text-muted-foreground">
//               Manage video stimuli for gaze tracking sessions
//             </p>
//           </div>
//           <Button onClick={() => setShowAddModal(true)}>
//             <Plus className="h-4 w-4 mr-2" />
//             Add Stimuli
//           </Button>
//         </div>

//         {/* Filters and Actions */}
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-2">
//             <Filter className="h-4 w-4" />
//             <select
//               value={selectedCategory}
//               onChange={(e) => setSelectedCategory(e.target.value)}
//               className="px-3 py-1 border rounded-md text-sm"
//             >
//               {categories.map(category => (
//                 <option key={category} value={category}>
//                   {category === "all" ? "All Categories" : category}
//                 </option>
//               ))}
//             </select>
//           </div>
          
//           <Button variant="outline" onClick={handleRefreshStimuli} disabled={isLoading}>
//             <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
//             Refresh
//           </Button>
//         </div>

//         {/* Stimuli Grid */}
//         <div>
//           {isLoading ? (
//             <div className="text-center py-12">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
//               <p className="mt-2 text-muted-foreground">Loading stimuli...</p>
//             </div>
//           ) : filteredStimuli.length === 0 ? (
//             <div className="text-center py-12 bg-card rounded-lg border border-dashed">
//               <p className="text-muted-foreground mb-4">
//                 {selectedCategory === "all" 
//                   ? "No stimuli videos found. Start by adding your first video."
//                   : `No stimuli found in the "${selectedCategory}" category.`
//                 }
//               </p>
//               {selectedCategory === "all" && (
//                 <Button onClick={() => setShowAddModal(true)}>
//                   <Plus className="h-4 w-4 mr-2" />
//                   Add Your First Stimuli
//                 </Button>
//               )}
//             </div>
//           ) : (
//             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//               {filteredStimuli.map((stimuli) => (
//                 <StimuliCard
//                   key={stimuli.id}
//                   stimuli={stimuli}
//                   onEdit={handleEditStimuli}
//                   onDelete={handleDeleteStimuli}
//                   onPreview={handlePreviewStimuli}
//                 />
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Add Stimuli Modal */}
//         <AddStimuliModal
//           open={showAddModal}
//           onOpenChange={setShowAddModal}
//         />

//         {/* Edit Stimuli Modal */}
//         <EditStimuliModal
//           open={showEditModal}
//           onOpenChange={handleCloseEditModal}
//           stimuli={editingStimuli}
//         />

//         {/* Video Preview Modal */}
//         <VideoPreviewModal
//           open={showPreviewModal}
//           onOpenChange={setShowPreviewModal}
//           stimuli={previewStimuli}
//         />
//       </div>
//     </DashboardLayout>
//   );
// }

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AddStimuliModal } from "@/components/stimuli/add-stimuli-modal";
import { EditStimuliModal } from "@/components/stimuli/edit-stimuli-modal";
import { VideoPreviewModal } from "@/components/stimuli/video-preview-modal";
import { useStimuliStore } from "@/store/stimuliStore";
import { useToast } from "@/hooks/use-toast";
import { Plus, RefreshCw, Filter, Pencil, Trash2, Eye } from "lucide-react";
import type { StimuliVideo } from "@/services/stimuliApi";

function StimuliCard({
  stimuli,
  onEdit,
  onDelete,
  onPreview,
}: {
  stimuli: StimuliVideo;
  onEdit: (stimuli: StimuliVideo) => void;
  onDelete: (id: string) => void;
  onPreview: (stimuli: StimuliVideo) => void;
}) {
  return (
    <Card className="overflow-hidden shadow-md">
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

      <CardContent className="p-4 space-y-2">
        <h3 className="font-medium truncate">{stimuli.title}</h3>
        <p className="text-sm text-muted-foreground truncate">
          {stimuli.category}
        </p>

        <div className="flex justify-between mt-3">
          <Button size="sm" variant="outline" onClick={() => onPreview(stimuli)}>
            <Eye className="h-4 w-4 mr-1" /> Preview
          </Button>
          <Button size="sm" variant="outline" onClick={() => onEdit(stimuli)}>
            <Pencil className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(stimuli.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StimuliLibrary() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingStimuli, setEditingStimuli] = useState<StimuliVideo | null>(
    null
  );
  const [previewStimuli, setPreviewStimuli] = useState<StimuliVideo | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();

  const { stimuli, isLoading, error, fetchStimuli, deleteStimuli, clearError } =
    useStimuliStore();

  // Fetch stimuli when component mounts
  useEffect(() => {
    fetchStimuli();
  }, [fetchStimuli]);

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleEditStimuli = (stimuli: StimuliVideo) => {
    setEditingStimuli(stimuli);
    setShowEditModal(true);
  };

  const handleDeleteStimuli = async (id: string) => {
    const success = await deleteStimuli(id);
    if (success) {
      toast({
        title: "Stimuli deleted",
        description: "The stimuli has been removed from the library.",
      });
    }
  };

  const handlePreviewStimuli = (stimuli: StimuliVideo) => {
    setPreviewStimuli(stimuli);
    setShowPreviewModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingStimuli(null);
  };

  const handleRefreshStimuli = () => {
    fetchStimuli();
  };

  // Filter stimuli by category
  const filteredStimuli =
    selectedCategory === "all"
      ? stimuli || []
      : (stimuli || []).filter((s) => s.category === selectedCategory);

  // Get unique categories for filter
  const categories = [
    "all",
    ...Array.from(new Set((stimuli || []).map((s) => s.category))),
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Stimuli Library</h1>
            <p className="text-muted-foreground">
              Manage video stimuli for gaze tracking sessions
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Stimuli
          </Button>
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
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            onClick={handleRefreshStimuli}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
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
              <p className="text-muted-foreground mb-4">
                {selectedCategory === "all"
                  ? "No stimuli videos found. Start by adding your first video."
                  : `No stimuli found in the "${selectedCategory}" category.`}
              </p>
              {selectedCategory === "all" && (
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Stimuli
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredStimuli.map((stimuli) => (
                <StimuliCard
                  key={stimuli.id}
                  stimuli={stimuli}
                  onEdit={handleEditStimuli}
                  onDelete={handleDeleteStimuli}
                  onPreview={handlePreviewStimuli}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Stimuli Modal */}
        <AddStimuliModal open={showAddModal} onOpenChange={setShowAddModal} />

        {/* Edit Stimuli Modal */}
        <EditStimuliModal
          open={showEditModal}
          onOpenChange={handleCloseEditModal}
          stimuli={editingStimuli}
        />

        {/* Video Preview Modal */}
        <VideoPreviewModal
          open={showPreviewModal}
          onOpenChange={setShowPreviewModal}
          stimuli={previewStimuli}
        />
      </div>
    </DashboardLayout>
  );
}
