import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddStimuliModal } from "@/components/stimuli/add-stimuli-modal";
import { EditStimuliModal } from "@/components/stimuli/edit-stimuli-modal";
import { VideoPreviewModal } from "@/components/stimuli/video-preview-modal";
import { useStimuliStore } from "@/store/stimuliStore";
import { useToast } from "@/hooks/use-toast";
import { Plus, RefreshCw, Pencil, Trash2, Eye, MoreVertical, Search, Film, PlayCircle, ChevronLeft, ChevronRight } from "lucide-react";
import type { StimuliVideo } from "@/services/stimuliApi";

// --- ✨ UI Enhancement: Custom hook for debouncing input ---
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


// --- Redesigned StimuliCard (unchanged from previous enhancement) ---
function StimuliCard({ stimuli, onEdit, onDelete, onPreview }: {
  stimuli: StimuliVideo;
  onEdit: (stimuli: StimuliVideo) => void;
  onDelete: (id: string) => void;
  onPreview: (stimuli: StimuliVideo) => void;
}) {
  return (
    <Card className="overflow-hidden group">
      <div 
        className="relative w-full aspect-video bg-secondary flex items-center justify-center cursor-pointer"
        onClick={() => onPreview(stimuli)}
      >
        <video
          src={stimuli.video_url + '#t=0.1'}
          className="object-cover w-full h-full"
          preload="metadata"
          muted
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <PlayCircle className="h-12 w-12 text-white" />
        </div>
      </div>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="space-y-1 overflow-hidden">
          <h3 className="font-semibold truncate text-sm" title={stimuli.title}>{stimuli.title}</h3>
          <p className="text-xs text-muted-foreground truncate">{stimuli.category}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="flex-shrink-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onPreview(stimuli)}><Eye className="h-4 w-4 mr-2" /> Preview</DropdownMenuItem>
            {/* <DropdownMenuItem onClick={() => onEdit(stimuli)}><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem> */}
            {/* <DropdownMenuItem className="text-destructive" onClick={() => onDelete(stimuli.id)}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}

// --- Skeleton Component (unchanged from previous enhancement) ---
const StimuliCardSkeleton = () => (
    <Card className="overflow-hidden">
        <Skeleton className="w-full aspect-video" />
        <div className="p-4 flex items-center justify-between">
            <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div>
            <Skeleton className="h-8 w-8 rounded-md" />
        </div>
    </Card>
);

export default function StimuliLibrary() {
  // --- Core State (unchanged) ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingStimuli, setEditingStimuli] = useState<StimuliVideo | null>(null);
  const [previewStimuli, setPreviewStimuli] = useState<StimuliVideo | null>(null);
  const { toast } = useToast();
  
  // --- ✨ UI Enhancement: State for advanced controls ---
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // Debounce search input by 300ms
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>('title_asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const { stimuli, isLoading, error, fetchStimuli, deleteStimuli, clearError } = useStimuliStore();

  // Core logic hooks (unchanged)
  useEffect(() => { fetchStimuli(); }, [fetchStimuli]);
  useEffect(() => { clearError(); }, [clearError]);
  useEffect(() => {
    if (error) { toast({ title: "Error", description: error, variant: "destructive" }); }
  }, [error, toast]);
  
  // Event handlers (unchanged)
  const handleEditStimuli = (stimuli: StimuliVideo) => { setEditingStimuli(stimuli); setShowEditModal(true); };
  const handleDeleteStimuli = async (id: string) => {
    const success = await deleteStimuli(id);
    if (success) { toast({ title: "Stimuli deleted", description: "The stimuli has been removed." }); }
  };
  const handlePreviewStimuli = (stimuli: StimuliVideo) => { setPreviewStimuli(stimuli); setShowPreviewModal(true); };
  const handleCloseEditModal = () => { setShowEditModal(false); setEditingStimuli(null); };
  const handleRefreshStimuli = () => { fetchStimuli(); };
  
  // --- ✨ UI Enhancement: Fully memoized processing logic (filter, sort) ---
  const processedStimuli = useMemo(() => {
    let processed = (stimuli || [])
      .filter(s => selectedCategory === "all" || s.category === selectedCategory)
      .filter(s => s.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));

    processed.sort((a, b) => {
        switch (sortBy) {
            case 'title_asc': return a.title.localeCompare(b.title);
            case 'title_desc': return b.title.localeCompare(a.title);
            case 'category_asc': return a.category.localeCompare(b.category);
            default: return 0;
        }
    });

    return processed;
  }, [stimuli, selectedCategory, debouncedSearchTerm, sortBy]);

  // --- ✨ UI Enhancement: Pagination calculations ---
  const totalPages = Math.ceil(processedStimuli.length / itemsPerPage);
  const paginatedStimuli = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return processedStimuli.slice(startIndex, startIndex + itemsPerPage);
  }, [processedStimuli, currentPage, itemsPerPage]);

  // Reset to page 1 if filters change and current page becomes invalid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
    }
  }, [currentPage, totalPages]);


  const categories = ["all", ...Array.from(new Set((stimuli || []).map(s => s.category)))];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: itemsPerPage }).map((_, i) => <StimuliCardSkeleton key={i} />)}
        </div>
      );
    }

    if (paginatedStimuli.length === 0) {
      return (
        <div className="text-center py-16 bg-background rounded-lg border-2 border-dashed flex flex-col items-center">
          <Film className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">No Stimuli Found</h3>
          <p className="text-muted-foreground mb-4 text-sm max-w-xs">
            {debouncedSearchTerm || selectedCategory !== 'all'
              ? "Try adjusting your search or filters to find what you're looking for."
              : "Your library is empty. Add your first video stimuli to get started."
            }
          </p>
          {searchTerm === '' && selectedCategory === 'all' && (
            <Button onClick={() => setShowAddModal(true)}><Plus className="h-4 w-4 mr-2" />Add Your First Stimuli</Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedStimuli.map((s) => (
          <StimuliCard key={s.id} stimuli={s} onEdit={handleEditStimuli} onDelete={handleDeleteStimuli} onPreview={handlePreviewStimuli} />
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
                <Input placeholder="Search by title..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleRefreshStimuli} disabled={isLoading}><RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /></Button>
                {/* <Button onClick={() => setShowAddModal(true)}><Plus className="h-4 w-4 mr-2" /> Add Stimuli</Button> */}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 ml-auto">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>{categories.map(cat => (<SelectItem key={cat} value={cat}>{cat === "all" ? "All Categories" : cat}</SelectItem>))}</SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title_asc">Title (A-Z)</SelectItem>
                    <SelectItem value="title_desc">Title (Z-A)</SelectItem>
                    <SelectItem value="category_asc">Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
          {/* --- ✨ UI Enhancement: Pagination Footer --- */}
          {totalPages > 1 && (
            <CardFooter className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing <strong>{paginatedStimuli.length}</strong> of <strong>{processedStimuli.length}</strong> stimuli.
              </div>
              <div className="flex items-center gap-2">
                 <Select value={String(itemsPerPage)} onValueChange={(v) => setItemsPerPage(Number(v))}>
                    <SelectTrigger className="w-[120px]"><SelectValue placeholder="Items per page" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="8">8 per page</SelectItem>
                        <SelectItem value="16">16 per page</SelectItem>
                        <SelectItem value="24">24 per page</SelectItem>
                    </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </CardFooter>
          )}
        </Card>

        {/* Modals (unchanged) */}
        <AddStimuliModal open={showAddModal} onOpenChange={setShowAddModal} />
        <EditStimuliModal open={showEditModal} onOpenChange={handleCloseEditModal} stimuli={editingStimuli} />
        <VideoPreviewModal open={showPreviewModal} onOpenChange={setShowPreviewModal} stimuli={previewStimuli} />
      </div>
    </DashboardLayout>
  );
}