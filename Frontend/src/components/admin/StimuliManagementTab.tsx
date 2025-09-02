import { useState, useEffect, useCallback, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { adminApi, type StimuliVideo } from "@/services/adminApi";
import {
  Video, RefreshCw, Eye, AlertTriangle, PlusCircle, MoreHorizontal,
  LayoutGrid, List, Search, X, Pencil, Trash2
} from "lucide-react";

// New imports for the enhanced UI
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


//==========================================================================
// 1. Main Page Component (Renamed for clarity)
//==========================================================================
export function StimuliManagementTab() {
  const [stimuli, setStimuli] = useState<StimuliVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // UI State
  const [layout, setLayout] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeVideo, setActiveVideo] = useState<StimuliVideo | null>(null);

  const fetchStimuli = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stimuliData = await adminApi.getAllStimuli();
      setStimuli(stimuliData);
    } catch (error) {
      console.error('Failed to fetch stimuli:', error);
      const errorMessage = "Failed to load stimuli data. Please try again.";
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStimuli();
  }, [fetchStimuli]);

  const uniqueCategories = useMemo(() => ["all", ...new Set(stimuli.map(s => s.category))], [stimuli]);

  const filteredStimuli = useMemo(() => {
    return stimuli
      .filter(s => categoryFilter === 'all' || s.category === categoryFilter)
      .filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [stimuli, searchTerm, categoryFilter]);

  // Placeholder actions
  const handleAddNew = () => toast({ title: "Action", description: "Open 'Add New Stimulus' form/modal." });
  const handleEdit = (id: string) => toast({ title: "Action", description: `Editing stimulus ID: ${id}` });
  const handleDelete = (id: string) => toast({ title: "Action", description: `Deleting stimulus ID: ${id}`, variant: "destructive" });

  const renderContent = () => {
    if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Loading stimuli..." /></div>;
    if (error) return <ErrorState message={error} onRetry={fetchStimuli} />;
    if (stimuli.length === 0) return <EmptyState onAddNew={handleAddNew} />;

    return (
      <div className="space-y-6">
        <StimuliStatistics stimuli={stimuli} />
        <Card>
          <CardHeader>
            <CardTitle>
              {`Stimuli Library (${filteredStimuli.length} video${filteredStimuli.length !== 1 ? 's' : ''} found)`}
            </CardTitle>
            <CardDescription>
              Browse, search, and manage all available video stimuli.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredStimuli.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No stimuli match your current filters.</p>
            ) : layout === 'grid' ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredStimuli.map((stimulus) => (
                  <StimulusCard
                    key={stimulus.id}
                    stimulus={stimulus}
                    onView={setActiveVideo}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <StimulusTable
                stimuli={filteredStimuli}
                onView={setActiveVideo}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <PageHeader
          isLoading={isLoading}
          onRefresh={fetchStimuli}
          onAddNew={handleAddNew}
          layout={layout}
          setLayout={setLayout}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={uniqueCategories}
        />
        {renderContent()}
        <VideoPreviewModal video={activeVideo} onOpenChange={(isOpen) => !isOpen && setActiveVideo(null)} />
      </div>
    </DashboardLayout>
  );
}


//==========================================================================
// 2. Helper Components (Refactored and New)
//==========================================================================

function PageHeader({
  isLoading, onRefresh, onAddNew, layout, setLayout, searchTerm,
  setSearchTerm, categoryFilter, setCategoryFilter, categories
}: {
  isLoading: boolean;
  onRefresh: () => void;
  onAddNew: () => void;
  layout: 'grid' | 'table';
  setLayout: (layout: 'grid' | 'table') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  categories: string[];
}) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <h2 className="text-3xl font-bold tracking-tight">Stimuli Management</h2>
      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
                {categories.map(cat => <SelectItem key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</SelectItem>)}
            </SelectContent>
        </Select>
        <Button variant={layout === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setLayout('grid')}><LayoutGrid className="h-4 w-4" /></Button>
        <Button variant={layout === 'table' ? 'default' : 'outline'} size="icon" onClick={() => setLayout('table')}><List className="h-4 w-4" /></Button>
        {/* <Button onClick={onAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Add New</Button> */}
        <Button variant="outline" size="icon" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </div>
  );
}

function StimulusCard({
  stimulus, onView, onEdit, onDelete
}: {
  stimulus: StimuliVideo;
  onView: (stimulus: StimuliVideo) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="flex flex-col group transition-all hover:shadow-xl hover:-translate-y-1">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="truncate pr-2">{stimulus.title}</CardTitle>
          {/* <StimulusActions id={stimulus.id} onEdit={onEdit} onDelete={onDelete} /> */}
        </div>
        <CardDescription className="line-clamp-2 h-[40px]">
          {stimulus.description || "No description provided."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <Badge variant="secondary">{stimulus.category}</Badge>
          {stimulus.duration && <span>{Math.round(stimulus.duration)}s</span>}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" onClick={() => onView(stimulus)} className="w-full">
          <Eye className="h-4 w-4 mr-2" /> View Video
        </Button>
      </CardFooter>
    </Card>
  );
}

// NEW: Table view for stimuli
function StimulusTable({
  stimuli, onView, onEdit, onDelete
}: {
  stimuli: StimuliVideo[];
  onView: (stimulus: StimuliVideo) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Duration (s)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {stimuli.map((s) => (
                    <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.title}</TableCell>
                        <TableCell><Badge variant="secondary">{s.category}</Badge></TableCell>
                        <TableCell className="text-right">{s.duration ? Math.round(s.duration) : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                             <Button variant="ghost" size="sm" onClick={() => onView(s)}><Eye className="h-4 w-4 mr-2" /> View</Button>
                             <StimulusActions id={s.id} onEdit={onEdit} onDelete={onDelete} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

// NEW: Reusable actions dropdown
function StimulusActions({ id, onEdit, onDelete }: { id: string, onEdit: (id: string) => void, onDelete: (id: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onEdit(id)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(id)} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// NEW: Modal for video preview
function VideoPreviewModal({ video, onOpenChange }: { video: StimuliVideo | null, onOpenChange: (isOpen: boolean) => void }) {
  if (!video) return null;
  return (
    <Dialog open={!!video} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader><DialogTitle>{video.title}</DialogTitle></DialogHeader>
        <div className="aspect-video bg-black rounded-md">
            <video src={video.video_url} controls autoPlay className="w-full h-full" />
        </div>
        <DialogFooter><DialogClose asChild><Button type="button" variant="secondary">Close</Button></DialogClose></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ErrorState({ message, onRetry }: { message: string, onRetry: () => void }) {
  return (
    <div className="text-center py-12">
      <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
      <p className="mt-4 text-red-500">{message}</p>
      <Button variant="outline" onClick={onRetry} className="mt-4">
        <RefreshCw className="mr-2 h-4 w-4" /> Try Again
      </Button>
    </div>
  );
}

function EmptyState({ onAddNew }: { onAddNew: () => void }) {
  return (
    <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
      <Video className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-medium">Your Library is Empty</h3>
      <p className="mt-1 text-sm text-muted-foreground">Get started by adding your first stimulus video.</p>
      <Button onClick={onAddNew} className="mt-6"><PlusCircle className="mr-2 h-4 w-4" /> Add First Video</Button>
    </div>
  );
}

function StimuliStatistics({ stimuli }: { stimuli: StimuliVideo[] }) {
  const categoryCounts = useMemo(() => {
    return stimuli.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [stimuli]);

  const totalDuration = useMemo(() => {
    const totalSeconds = stimuli.reduce((acc, s) => acc + (s.duration || 0), 0);
    return Math.floor(totalSeconds / 60);
  }, [stimuli]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stimuli.length}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Categories</CardTitle>
                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{Object.keys(categoryCounts).length}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Duration (Minutes)</CardTitle>
                <List className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalDuration}</div>
            </CardContent>
        </Card>
    </div>
  );
}