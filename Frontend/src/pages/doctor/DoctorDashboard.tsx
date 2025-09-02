import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PatientCard } from "@/components/doctor/patient-card";
import { PatientDetailsModal } from "@/components/doctor/PatientDetailsModal";
import { DoctorStatsCards } from "@/components/doctor/DoctorStatsCards";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { doctorPatientApi, type Child as APIChild, type Report } from "@/services/doctorPatientApi";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { RefreshCw, Search, Users, AlertTriangle, Frown, LayoutGrid, List, MoreVertical, FileDown, CalendarPlus, User, ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu";

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

type Child = APIChild & {
  latestReport?: Report;
  riskLevel?: 'safe' | 'low' | 'moderate' | 'high';
  photoUrl?: string;
};
type ViewMode = 'grid' | 'list';
type RiskLevel = 'high' | 'moderate' | 'low' | 'safe';
type SortBy = 'latest_assessment' | 'oldest_assessment' | 'name_asc';

const RiskBadge = ({ riskLevel }: { riskLevel?: Child['riskLevel'] }) => {
  if (!riskLevel) {
    return <Badge variant="secondary">No Data</Badge>;
  }
  switch (riskLevel) {
    case 'high':
      return <Badge variant="destructive">High</Badge>;
    case 'moderate':
      return <Badge className="bg-yellow-500 text-primary-foreground hover:bg-yellow-500/80">Moderate</Badge>;
    case 'low':
      return <Badge variant="default">Low</Badge>;
    case 'safe':
      return <Badge className="bg-green-600 text-primary-foreground hover:bg-green-600/80">Safe</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
};

const PatientListItem = ({ patient, onViewDetails, onDownloadPDF, onSchedule }: {
  patient: Child;
  onViewDetails: (p: Child) => void;
  onDownloadPDF: (p: Child) => void;
  onSchedule: (p: Child) => void;
}) => (
  <div className="flex items-center justify-between gap-4 p-3 pr-4 rounded-lg bg-card hover:bg-muted/50 transition-colors border">
    <div className="flex items-center gap-4">
      <Avatar className="h-10 w-10">
        <AvatarImage src={patient.photoUrl} alt={patient.name} />
        <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold text-card-foreground">{patient.name}</p>
        <p className="text-sm text-muted-foreground">
          Last assessed: {patient.latestReport ? `${formatDistanceToNow(parseISO(patient.latestReport.created_at))} ago` : 'N/A'}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <RiskBadge riskLevel={patient.riskLevel} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onViewDetails(patient)}>
            <User className="mr-2 h-4 w-4" /> View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDownloadPDF(patient)}>
            <FileDown className="mr-2 h-4 w-4" /> Download Report
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSchedule(patient)}>
            <CalendarPlus className="mr-2 h-4 w-4" /> Schedule Follow-up
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
);

const PatientCardSkeleton = ({ viewMode }: { viewMode: ViewMode }) => {
  if (viewMode === 'list') {
    return (
      <div className="flex items-center justify-between gap-4 p-4 rounded-lg border">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    );
  }
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4"><Skeleton className="h-16 w-16 rounded-full" /><div className="space-y-2 flex-1"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /></div></div><div className="mt-4 space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div><div className="mt-4 flex justify-end gap-2"><Skeleton className="h-9 w-24 rounded-md" /><Skeleton className="h-9 w-24 rounded-md" /></div>
    </Card>
  );
};

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [patients, setPatients] = useState<Child[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Child | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [sortBy, setSortBy] = useState<SortBy>('latest_assessment');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const [riskFilters, setRiskFilters] = useState<Set<RiskLevel>>(new Set());

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const patientsWithReports = await doctorPatientApi.getAllPatientsWithReports();
      setPatients(patientsWithReports);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      setError('Failed to load patient data. Please check your connection and try again.');
      toast({ title: "Error", description: "Failed to load patient data. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  const handleRefresh = () => {
    fetchPatients();
  };

  const processedPatients = useMemo(() => {
    return patients
      .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        const matchesRisk = riskFilters.size === 0 || (p.riskLevel && riskFilters.has(p.riskLevel));
        return matchesSearch && matchesRisk;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name_asc': return a.name.localeCompare(b.name);
          case 'oldest_assessment':
            const dateA = a.latestReport ? new Date(a.latestReport.created_at).getTime() : 0;
            const dateB = b.latestReport ? new Date(b.latestReport.created_at).getTime() : 1;
            return dateA - dateB;
          case 'latest_assessment':
          default:
            const dateB_latest = b.latestReport ? new Date(b.latestReport.created_at).getTime() : 0;
            const dateA_latest = a.latestReport ? new Date(a.latestReport.created_at).getTime() : 1;
            return dateB_latest - dateA_latest;
        }
      });
  }, [patients, debouncedSearchTerm, riskFilters, sortBy]);

  const totalPages = Math.ceil(processedPatients.length / itemsPerPage);
  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedPatients.slice(startIndex, startIndex + itemsPerPage);
  }, [processedPatients, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
    }
  }, [currentPage, totalPages]);
  
  const handleRiskFilterChange = (risk: RiskLevel) => {
    setRiskFilters(prev => {
      const newFilters = new Set(prev);
      if (newFilters.has(risk)) {
        newFilters.delete(risk);
      } else {
        newFilters.add(risk);
      }
      return newFilters;
    });
  };

  const riskOptions: RiskLevel[] = ['high', 'moderate', 'low', 'safe'];

  const handleViewDetails = (patient: Child) => {
    setSelectedPatient(patient);
    setIsDetailsModalOpen(true);
  };
  const handleSchedule = (patient: Child) => {
    navigate('/view-appointments');
  };
  const handleDownloadPDF = async (patient: Child) => {
    try {
      const latestReport = await doctorPatientApi.getLatestReport(patient.id);
      toast({ title: "Download Starting", description: `Downloading report for ${patient.name}...` });
      const reportData = { patient: patient.name, patientId: patient.id, dateOfBirth: patient.dob, assessmentDate: latestReport.created_at, riskLevel: latestReport.risk_level, confidence: `${(latestReport.confidence * 100).toFixed(1)}%`, predictedClass: latestReport.predicted_class, reportId: latestReport.id, photoUrl: patient.photoUrl };
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${patient.name}_report_${format(parseISO(latestReport.created_at), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Download Complete", description: "Report has been downloaded successfully." });
    } catch (error) {
      toast({ title: "Download Failed", description: "No recent assessment found for this patient.", variant: "destructive" });
    }
  };
  
  const renderContent = () => {
    if (isLoading) {
      const skeletonCount = viewMode === 'grid' ? itemsPerPage : 6;
      return (
        <div className={`gap-4 ${viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'flex flex-col'}`}>
          {Array.from({ length: skeletonCount }).map((_, index) => <PatientCardSkeleton key={index} viewMode={viewMode} />)}
        </div>
      );
    }
    
    if (error) {
      return <div className="text-center py-20"><AlertTriangle className="h-16 w-16 mx-auto mb-4 text-destructive" /><h3 className="text-xl font-semibold mb-2">Something Went Wrong</h3><p className="text-muted-foreground mb-4">{error}</p><Button variant="default" onClick={handleRefresh}><RefreshCw className="mr-2 h-4 w-4" />Try Again</Button></div>;
    }
    
    if (patients.length === 0) {
      return <div className="text-center py-20"><Frown className="h-16 w-16 mx-auto mb-4 text-muted-foreground" /><h3 className="text-xl font-semibold mb-2">No Patients Found</h3><p className="text-muted-foreground">Once patients are registered, they will appear here.</p></div>;
    }

    if (paginatedPatients.length === 0) {
      return (
        <div className="text-center py-20">
          <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Matching Patients</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter settings.</p>
        </div>
      );
    }

    if (viewMode === 'list') {
        return (
            <div className="flex flex-col gap-2">
                {paginatedPatients.map(patient => (
                    <PatientListItem key={patient.id} patient={patient} onViewDetails={handleViewDetails} onDownloadPDF={handleDownloadPDF} onSchedule={handleSchedule} />
                ))}
            </div>
        );
    }
    
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedPatients.map(patient => {
            // @ts-ignore
            return <PatientCard key={patient.id} patient={patient} onViewDetails={handleViewDetails} onDownloadPDF={handleDownloadPDF} onSchedule={handleSchedule} />;
        })}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DoctorStatsCards />
        <Card>
            <CardHeader>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[250px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search by name..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 ml-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full md:w-auto">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Filter by Risk
                                    {riskFilters.size > 0 && (
                                        <>
                                            <div className="bg-border h-4 w-px mx-2" />
                                            <Badge variant="secondary" className="rounded-sm px-1 font-normal">{riskFilters.size}</Badge>
                                        </>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Filter by Risk Level</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {riskOptions.map(option => (
                                    <DropdownMenuCheckboxItem
                                        key={option}
                                        className="capitalize"
                                        checked={riskFilters.has(option)}
                                        onCheckedChange={() => handleRiskFilterChange(option)}
                                    >
                                        {option}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="latest_assessment">Latest Assessment</SelectItem>
                                <SelectItem value="oldest_assessment">Oldest Assessment</SelectItem>
                                <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                            </SelectContent>
                        </Select>
                        <ToggleGroup type="single" value={viewMode} onValueChange={(v: ViewMode) => v && setViewMode(v)}>
                            <ToggleGroupItem value="grid" aria-label="Grid view"><LayoutGrid className="h-4 w-4" /></ToggleGroupItem>
                            <ToggleGroupItem value="list" aria-label="List view"><List className="h-4 w-4" /></ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
            
            {totalPages > 1 && (
                <CardFooter className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                        Showing <strong>{paginatedPatients.length}</strong> of <strong>{processedPatients.length}</strong> patients.
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

        <PatientDetailsModal patient={selectedPatient} isOpen={isDetailsModalOpen} onClose={() => { setIsDetailsModalOpen(false); setSelectedPatient(null); }} />
      </div>
    </DashboardLayout>
  );
}