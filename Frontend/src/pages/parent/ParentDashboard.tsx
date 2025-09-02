// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { DashboardLayout } from "@/components/layout/dashboard-layout";
// import { Button } from "@/components/ui/button";
// import { ChildCard } from "@/components/children/child-card";
// import { AddChildModal } from "@/components/children/add-child-modal";
// import { EditChildModal } from "@/components/children/edit-child-modal";
// import { useChildrenStore } from "@/store/childrenStore";
// import { useAuthStore } from "@/store/authStore";
// import { useToast } from "@/hooks/use-toast";
// import { Plus, Video, Calendar, RefreshCw } from "lucide-react";
// import type { Child } from "@/services/childrenApi";

// export default function ParentDashboard() {
//   const [showAddChildModal, setShowAddChildModal] = useState(false);
//   const [showEditChildModal, setShowEditChildModal] = useState(false);
//   const [editingChild, setEditingChild] = useState<Child | null>(null);
//   const navigate = useNavigate();
//   const { toast } = useToast();
  
//   const user = useAuthStore(state => state.user);
//   const { children, isLoading, error, fetchChildren, deleteChild, clearError } = useChildrenStore();

//   // Fetch children when component mounts
//   useEffect(() => {
//     if (user?.id) {
//       fetchChildren(user.id);
//     }
//   }, [user?.id, fetchChildren]);

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

//   const handleEditChild = (child: Child) => {
//     setEditingChild(child);
//     setShowEditChildModal(true);
//   };

//   const handleDeleteChild = async (id: string) => {
//     if (!user?.id) return;
    
//     const success = await deleteChild(user.id, id);
//     if (success) {
//       toast({
//         title: "Child removed",
//         description: "The child has been removed from your profile.",
//       });
//     }
//   };

//   const handleStartSession = (child: Child) => {
//     navigate(`/gaze-session/${child.id}`);
//   };

//   const handleViewReports = (child: Child) => {
//     navigate(`/reports/${child.id}`);
//   };

//   const handleManageStimuli = () => {
//     navigate('/stimuli-library');
//   };

//   const handleScheduleAssessment = () => {
//     navigate('/appointments');
//   };

//   const handleRefreshChildren = () => {
//     if (user?.id) {
//       fetchChildren(user.id);
//     }
//   };

//   const handleCloseEditModal = () => {
//     setShowEditChildModal(false);
//     setEditingChild(null);
//   };

//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         {/* Action Buttons */}
//         <div className="flex gap-4">
//           <Button onClick={() => setShowAddChildModal(true)}>
//             <Plus className="h-4 w-4 mr-2" />
//             Add Child
//           </Button>
          
//           {/* <Button variant="outline" onClick={handleManageStimuli}>
//             <Video className="h-4 w-4 mr-2" />
//             Manage Video Stimuli
//           </Button> */}
          
//           {/* <Button variant="outline" onClick={handleScheduleAssessment}>
//             <Calendar className="h-4 w-4 mr-2" />
//             Schedule Assessment
//           </Button> */}

//           <Button variant="outline" onClick={handleRefreshChildren} disabled={isLoading}>
//             <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
//             Refresh
//           </Button>
//         </div>

//         {/* Children List */}
//         <div>
//           <h2 className="text-xl font-semibold mb-4">Your Children</h2>
          
//           {isLoading ? (
//             <div className="text-center py-12">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
//               <p className="mt-2 text-muted-foreground">Loading children...</p>
//             </div>
//           ) : children.length === 0 ? (
//             <div className="text-center py-12 bg-card rounded-lg border border-dashed">
//               <p className="text-muted-foreground mb-4">
//                 No children added yet. Start by adding your first child.
//               </p>
//               <Button onClick={() => setShowAddChildModal(true)}>
//                 <Plus className="h-4 w-4 mr-2" />
//                 Add Your First Child
//               </Button>
//             </div>
//           ) : (
//             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//               {children.map((child) => (
//                 <ChildCard
//                   key={child.id}
//                   child={child}
//                   onEdit={handleEditChild}
//                   onDelete={handleDeleteChild}
//                   onStartSession={handleStartSession}
//                   onViewReports={handleViewReports}
//                 />
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Add Child Modal */}
//         <AddChildModal
//           open={showAddChildModal}
//           onOpenChange={setShowAddChildModal}
//         />

//         {/* Edit Child Modal */}
//         <EditChildModal
//           open={showEditChildModal}
//           onOpenChange={handleCloseEditModal}
//           child={editingChild}
//         />
//       </div>
//     </DashboardLayout>
//   );
// }

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ChildCard } from "@/components/children/child-card";
import { AddChildModal } from "@/components/children/add-child-modal";
import { EditChildModal } from "@/components/children/edit-child-modal";
import { useChildrenStore } from "@/store/childrenStore";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { Plus, RefreshCw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Child } from "@/services/childrenApi";

// --- Custom hook for debouncing input ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

const ChildCardSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="w-full aspect-square md:aspect-video" />
    <div className="p-4 flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-8 w-8 rounded-md" />
    </div>
  </Card>
);

export default function ParentDashboard() {
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showEditChildModal, setShowEditChildModal] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const user = useAuthStore(state => state.user);
  const { children, isLoading, error, fetchChildren, deleteChild, clearError } = useChildrenStore();

  // Fetch children when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchChildren(user.id);
    }
  }, [user?.id, fetchChildren]);

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

  const handleEditChild = (child: Child) => {
    setEditingChild(child);
    setShowEditChildModal(true);
  };

  const handleDeleteChild = async (id: string) => {
    if (!user?.id) return;
    
    const success = await deleteChild(user.id, id);
    if (success) {
      toast({
        title: "Child removed",
        description: "The child has been removed from your profile.",
      });
    }
  };

  const handleStartSession = (child: Child) => {
    navigate(`/gaze-session/${child.id}`);
  };

  const handleViewReports = (child: Child) => {
    navigate(`/reports/${child.id}`);
  };

  const handleRefreshChildren = () => {
    if (user?.id) {
      fetchChildren(user.id);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditChildModal(false);
    setEditingChild(null);
  };

  const filteredChildren = useMemo(() => {
    return children.filter(child =>
      child.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [children, debouncedSearchQuery]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <ChildCardSkeleton key={i} />)}
        </div>
      );
    }

    if (children.length === 0) {
      return (
        <div className="text-center py-12 bg-card rounded-lg border border-dashed">
          <p className="text-muted-foreground mb-4">
            No children added yet. Start by adding your first child.
          </p>
          <Button onClick={() => setShowAddChildModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Child
          </Button>
        </div>
      );
    }
    
    if (filteredChildren.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          No children found matching your search.
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredChildren.map((child) => (
          <ChildCard
            key={child.id}
            child={child}
            onEdit={handleEditChild}
            onDelete={handleDeleteChild}
            onStartSession={handleStartSession}
            onViewReports={handleViewReports}
          />
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="outline" onClick={handleRefreshChildren} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button onClick={() => setShowAddChildModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Child
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>

        {/* Add Child Modal */}
        <AddChildModal
          open={showAddChildModal}
          onOpenChange={setShowAddChildModal}
        />

        {/* Edit Child Modal */}
        <EditChildModal
          open={showEditChildModal}
          onOpenChange={handleCloseEditModal}
          child={editingChild}
        />
      </div>
    </DashboardLayout>
  );
}