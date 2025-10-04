import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import {
  doctorPatientApi,
  type Child as APIChild,
  type Report as APIReport,
} from "@/services/doctorPatientApi";
import {
  Download,
  Calendar,
  TrendingUp,
  Eye,
  Activity,
  FileText,
  Brain,
  Target,
  ArrowLeft,
  RefreshCw,
  Clock,
  Ruler,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// --- Type Definitions ---
type Child = APIChild & {
  latestReport?: Report;
  riskLevel?: "safe" | "low" | "moderate" | "high";
  photoUrl?: string;
};

type Report = APIReport & {
  heatmap_path?: string;
  scanpath_path?: string;
  gaze_data?: any;
};

type SortOption = 'latest' | 'earliest';

// --- Child History Page Component ---
export default function ChildHistoryPage() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [child, setChild] = useState<Child | null>(null);
  const [allReports, setAllReports] = useState<Report[]>([]); // Stores original fetched reports
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOption>('latest'); // New state for sorting

  // Fetch child and reports
  useEffect(() => {
    const fetchChildData = async () => {
      if (!childId) return;
      setLoading(true);
      setError(null);
      try {
        const childData = await doctorPatientApi.getChildById(childId);
        const fetchedReports = await doctorPatientApi.getAllReports(childId);
        
        setAllReports(fetchedReports);
        setChild(childData);
      } catch (err) {
        console.error(err);
        toast({
          title: "Error",
          description: "Failed to load child data.",
          variant: "destructive",
        });
        setError("Failed to load child data.");
      } finally {
        setLoading(false);
      }
    };

    fetchChildData();
  }, [childId, toast]);

  // Memoized value for the ABSOLUTE latest report (independent of sortOrder)
  const trueLatestReport = useMemo(() => {
    if (allReports.length === 0) return undefined;
    
    // Sort all reports by date descending to find the newest one
    const sortedByDate = [...allReports].sort((a, b) =>
        parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime()
    );
    return sortedByDate[0];
  }, [allReports]);


  // Memoized reports for the history list based on sorting order
  const sortedReports = useMemo(() => {
    // Create a copy to sort
    const reportsCopy = [...allReports]; 

    if (sortOrder === 'latest') {
      // Sort descending (newest first)
      return reportsCopy.sort((a, b) =>
        parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime()
      );
    } else {
      // Sort ascending (oldest first)
      return reportsCopy.sort((a, b) =>
        parseISO(a.created_at).getTime() - parseISO(b.created_at).getTime()
      );
    }
  }, [allReports, sortOrder]);


  // --- Utility Functions ---
  const calculateAge = useCallback((dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    if (today.getDate() < birthDate.getDate()) months--;
    if (months < 0) {
      years--;
      months += 12;
    }

    if (years > 0) return `${years}y ${months}m`;
    if (months > 0) return `${months}m`;
    return "<1m";
  }, []);

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case "safe":
        return "default";
      case "low":
        return "default";
      case "moderate":
        return "secondary";
      case "high":
        return "destructive";
      default:
        return "outline";
    }
  };
  
  // Function to determine badge color based on prediction class
  const getPredictionBadgeClass = (prediction: string) => {
    const lowerPrediction = prediction.toLowerCase();
    
    if (lowerPrediction.includes('non-asd')) {
      return 'bg-green-600 hover:bg-green-700 text-white'; // Green for Non-ASD
    }
    if (lowerPrediction.includes('asd')) {
      return 'bg-red-600 hover:bg-red-700 text-white'; // Red for ASD
    }
    return 'bg-gray-500 hover:bg-gray-600 text-white';
  };
  
  const handleDownloadReport = (report: Report) => {
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${child?.name}_report_${format(parseISO(report.created_at), "yyyy-MM-dd")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
        title: "Download started",
        description: `JSON report for ${child?.name} is being downloaded.`,
    });
  };

  // --- Loading and Error States ---
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <LoadingSpinner size="lg" text="Loading child history..." />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !child) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[80vh] text-center">
          <p className="text-xl font-semibold mb-4">
            {error ?? "Child not found (404)"}
          </p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Determine key display values for the header
  const totalReports = allReports.length;
  const age = calculateAge(child.dob);
  const latestAssessmentDate = trueLatestReport?.created_at ? format(parseISO(trueLatestReport.created_at), 'MMMM dd, yyyy HH:mm') : 'No assessments recorded';


  // --- Main Component Render ---
  return (
    <DashboardLayout>
      {/* FIXED: Reduced top padding from py-8 to pt-4 to reduce space above the first card. */}
      <div className="w-full mx-auto px-4 pt-0 pb-8 space-y-8"> 
        
        {/* --- Header Section: Layout MATCHES Assessment Report --- */}
        <Card className="shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <Button variant="outline" onClick={() => navigate(-1)} className="shrink-0 mt-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                
                {/* Title, Subtitle, and Badges stacked vertically */}
                <div>
                  {/* Title */}
                  <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                    Child History
                  </h1>
                  
                  {/* Subtitle/Details */}
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-semibold">{child.name}</span> • {age} • <span className="text-gray-600">Total Reports: {totalReports}</span>
                  </p>
                  
                  {/* Assessment/Data Badges */}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      Child ID: #{child.id}
                    </Badge>
                    {/* FIXED: Using trueLatestReport here, independent of sortOrder */}
                    {trueLatestReport && (
                      <Badge 
                        className={`text-xs ${getPredictionBadgeClass(trueLatestReport.predicted_class)}`}
                      >
                        Latest: {trueLatestReport.predicted_class}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      Last Updated: {latestAssessmentDate}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Action Button */}
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()} 
                className="shrink-0 mt-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* --- Assessment History Card --- */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div className="flex items-center gap-4">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                  <Brain className="h-5 w-5 text-primary/80" /> Assessment History ({allReports.length} Reports)
                </CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1 sm:mt-0">
                </CardDescription>
            </div>
            {/* Sorting control only */}
            <div className="flex items-center gap-4 mt-3 sm:mt-0">
                <Select value={sortOrder} onValueChange={(value: SortOption) => setSortOrder(value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="latest">Latest First</SelectItem>
                        <SelectItem value="earliest">Earliest First</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </CardHeader>
          <CardContent>
            {allReports.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-lg">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
                <p className="text-lg font-medium">No assessments found for this child yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedReports.map((report, index) => {
                    const riskLevel = report.risk_level.toLowerCase();
                    // Check if this report is the current 'latest' based on the active sort order
                    const isMostRecent = sortOrder === 'latest' && index === 0;
                    
                    let bgClass = '';
                    let textClass = '';
                    
                    if (riskLevel === 'safe') {
                        bgClass = 'bg-emerald-50 border-emerald-300';
                        textClass = 'text-emerald-700';
                    } else if (riskLevel === 'low') {
                        bgClass = 'bg-green-50 border-green-300';
                        textClass = 'text-green-700';
                    } else if (riskLevel === 'moderate') {
                        bgClass = 'bg-yellow-50 border-yellow-300';
                        textClass = 'text-yellow-700';
                    } else if (riskLevel === 'high') {
                        bgClass = 'bg-red-50 border-red-300';
                        textClass = 'text-red-700';
                    }

                    const hasVisuals = report.scanpath_path || report.heatmap_path;
                    const hasGazeData = report.gaze_data;

                    return (
                        <div
                            key={report.id}
                            className={`p-4 border rounded-lg transition-shadow hover:shadow-lg ${bgClass}`}
                        >
                            {/* Summary & Download */}
                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <Badge
                                            variant={getRiskBadgeVariant(riskLevel)}
                                            className={`text-sm font-semibold px-3 py-1 capitalize ${
                                                riskLevel === "safe"
                                                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                                    : riskLevel === "low"
                                                        ? "bg-green-600 text-white hover:bg-green-700"
                                                        : riskLevel === "moderate"
                                                            ? "bg-yellow-600 text-white hover:bg-yellow-700"
                                                            : "bg-red-600 text-white hover:bg-red-700"
                                            }`}
                                        >
                                            {riskLevel} Risk
                                        </Badge>
                                        <span className="font-bold text-lg text-gray-900">
                                            {report.predicted_class}
                                        </span>
                                        {/* This badge indicates the position in the *currently sorted* list, NOT the true latest date */}
                                        {index === 0 && (
                                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                                                {sortOrder === 'latest' ? 'NEWEST' : 'OLDEST'}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="mt-2 text-sm text-muted-foreground flex flex-wrap gap-x-6 gap-y-2">
                                        <span className={`flex items-center gap-1.5 ${textClass}`}>
                                            <Calendar className="h-3.5 w-3.5" />
                                            {format(parseISO(report.created_at), "MMM dd, yyyy")}
                                        </span>
                                        <span className={`flex items-center gap-1.5 ${textClass}`}>
                                            <Clock className="h-3.5 w-3.5" />
                                            {format(parseISO(report.created_at), "HH:mm")}
                                        </span>
                                        <span className={`flex items-center gap-1.5 font-semibold ${textClass}`}>
                                            <TrendingUp className="h-3.5 w-3.5" />
                                            {(report.confidence * 100).toFixed(1)}% confidence
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownloadReport(report)}
                                    className="flex-shrink-0 border-primary text-primary hover:bg-primary/10"
                                >
                                    <Download className="h-4 w-4 mr-2" /> Download JSON
                                </Button>
                            </div>

                            {/* --- Visualization Section (Scanpath & Heatmap Side-by-Side) --- */}
                            {(hasVisuals || hasGazeData) && (
                                <div className="mt-4 pt-3 border-t border-gray-200">
                                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <Eye className="h-4 w-4" /> Visual & Raw Data
                                    </h4>

                                    {/* Visuals: Side-by-Side Grid with Aspect Ratio containers. */}
                                    {hasVisuals && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 max-w-xl">
                                            {report.scanpath_path && (
                                                <div className="space-y-2">
                                                    <p className="font-medium text-sm flex items-center gap-1">
                                                        <Activity className="h-4 w-4 text-blue-500" /> Scanpath
                                                    </p>
                                                    {/* Aspect ratio container */}
                                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-gray-100 shadow-md bg-gray-50 flex items-center justify-center">
                                                        <img
                                                            src={report.scanpath_path}
                                                            alt="Scanpath"
                                                            className="absolute inset-0 w-full h-full object-cover" 
                                                        />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">Visual path of eye movements.</p>
                                                </div>
                                            )}
                                            
                                            {report.heatmap_path && (
                                                <div className="space-y-2">
                                                    <p className="font-medium text-sm flex items-center gap-1">
                                                        <Activity className="h-4 w-4 text-red-500" /> Heatmap
                                                    </p>
                                                    {/* Aspect ratio container */}
                                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-gray-100 shadow-md bg-gray-50 flex items-center justify-center">
                                                        <img
                                                            src={report.heatmap_path}
                                                            alt="Heatmap"
                                                            className="absolute inset-0 w-full h-full object-cover" 
                                                        />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">Areas of concentrated visual attention.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Raw Data: Tabs for conditional content */}
                                    {hasGazeData && (
                                        <Tabs defaultValue="gaze">
                                            <TabsList className="grid w-full grid-cols-1 max-w-[150px]">
                                                <TabsTrigger value="gaze">Raw Gaze Data</TabsTrigger>
                                            </TabsList>
                                            <div className="mt-2">
                                                <TabsContent value="gaze">
                                                    <p className="text-sm text-muted-foreground mb-2">Complete eye tracking data recorded in JSON format.</p>
                                                    <pre className="text-xs bg-slate-50 border p-4 rounded-lg overflow-auto max-h-60 font-mono text-gray-700">
                                                        {JSON.stringify(report.gaze_data, null, 2)}
                                                    </pre>
                                                </TabsContent>
                                            </div>
                                        </Tabs>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}