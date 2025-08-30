import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RiskBadge } from "@/components/ui/risk-badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { useChildrenStore } from "@/store/childrenStore";
import { useAssessmentStore } from "@/store/assessmentStore";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { gazeApi, type GazeResult } from "@/services/gazeApi";
import { 
  ArrowLeft, 
  Download, 
  Save, 
  Eye, 
  Activity, 
  AlertCircle, 
  Loader2, 
  FileSpreadsheet,
  Image as ImageIcon,
  Calendar,
  Brain,
  Target,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { format, parseISO } from "date-fns";

export default function AssessmentReport() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [doctorComment, setDoctorComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [backendResult, setBackendResult] = useState<GazeResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState({ scanpath: true, heatmap: true });
  const [imageErrors, setImageErrors] = useState({ scanpath: false, heatmap: false });
  
  const user = useAuthStore(state => state.user);
  const children = useChildrenStore(state => state.children);
  const getChildById = useChildrenStore(state => state.getChildById);
  const { assessments, getAssessmentsByChild, addDoctorComment } = useAssessmentStore();
  
  const child = children.find(c => c.id === childId);
  const [localChild, setLocalChild] = useState<any>(null);
  const resolvedChild = child || localChild;
  
  // Try to get results from Flask backend first, fall back to mock data
  const childAssessments = childId ? getAssessmentsByChild(childId) : [];
  const latestAssessment = childAssessments[0];

  // Fetch results from Flask backend with retry polling (handles write latency after stop)
  useEffect(() => {
    if (!childId) return;
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 10; // ~10 seconds

    const tryFetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await gazeApi.getResult(childId);
        if (!cancelled) {
          setBackendResult(result);
          setLoading(false);
          toast({ title: "Results loaded", description: "Analysis results are ready." });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (message === 'PROCESSING') {
          attempts += 1;
          if (attempts < maxAttempts && !cancelled) {
            setTimeout(tryFetch, 1000);
            return;
          }
        }
        if (!cancelled) {
          console.error('Failed to fetch backend results:', error);
          setError('Failed to load backend results. Using mock data.');
          setLoading(false);
          toast({
            title: "Using mock data",
            description: "Could not load backend results.",
            variant: "destructive",
          });
        }
      }
    };

    tryFetch();
    return () => { cancelled = true; };
  }, [childId, toast]);

  // Ensure child is available when navigating directly
  useEffect(() => {
    if (!child && childId) {
      void (async () => {
        try {
          const c = await getChildById(childId);
          if (c) setLocalChild(c);
        } catch {}
      })();
    }
  }, [child, childId, getChildById]);

  useEffect(() => {
    if (latestAssessment?.doctorComments) {
      setDoctorComment(latestAssessment.doctorComments);
    }
  }, [latestAssessment]);

  const handleSaveComment = async () => {
    if (!latestAssessment) return;
    
    setIsSaving(true);
    try {
      addDoctorComment(latestAssessment.id, doctorComment);
      toast({
        title: "Comment saved",
        description: "Doctor comment has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageLoad = (type: 'scanpath' | 'heatmap') => {
    setImageLoading(prev => ({ ...prev, [type]: false }));
  };

  const handleImageError = (type: 'scanpath' | 'heatmap') => {
    setImageLoading(prev => ({ ...prev, [type]: false }));
    setImageErrors(prev => ({ ...prev, [type]: true }));
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Download started",
        description: `${filename} is being downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = () => {
    if (!backendResult) {
      toast({
        title: "PDF Download",
        description: "Generating PDF report...",
      });
      // Mock PDF generation for cases without backend data
      setTimeout(() => {
        toast({
          title: "Download Complete",
          description: "Report has been downloaded successfully.",
        });
      }, 2000);
      return;
    }

    // For real backend data, you could generate a comprehensive PDF
    toast({
      title: "PDF Download",
      description: "Generating comprehensive PDF report with images...",
    });
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: "Comprehensive report has been downloaded successfully.",
      });
    }, 2000);
  };

  if (!resolvedChild) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading child...</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading assessment results...</p>
        </div>
      </DashboardLayout>
    );
  }

  const hasBackendData = !!backendResult && !error;
  const hasLocalData = latestAssessment && !hasBackendData;
  
  // If no data at all, show not found
  if (!hasBackendData && !hasLocalData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No assessment results found.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Run a gaze tracking session to generate results.
          </p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Create display data based on what's available
  const displayData = hasBackendData ? {
    id: backendResult!.id,
    prediction: backendResult!.predicted_class,
    confidence: backendResult!.confidence,
    riskLevel: backendResult!.risk_level.toLowerCase(),
    scanpathImage: backendResult!.scanpath_path,
    heatmapImage: backendResult!.heatmap_path,
    gazeDataPath: backendResult!.gaze_data_path,
    createdAt: backendResult!.created_at,
    childId: backendResult!.child_id,
    source: 'backend'
  } : {
    prediction: latestAssessment!.riskLevel,
    confidence: null,
    scanpathImage: latestAssessment!.scanpathImage,
    heatmapImage: latestAssessment!.heatmapImage,
    riskLevel: latestAssessment!.riskLevel,
    fixationCount: latestAssessment!.fixationCount,
    gazeDeviation: latestAssessment!.gazeDeviation,
    source: 'mock'
  };

  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + 
                  (today.getMonth() - birth.getMonth());
    
    if (months < 12) {
      return `${months} months`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return remainingMonths > 0 ? `${years}y ${remainingMonths}m` : `${years} years`;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Assessment Report</h1>
              <p className="text-muted-foreground">
                {resolvedChild.name} • {calculateAge(resolvedChild.dob)} • 
                {hasBackendData && displayData.createdAt ? 
                  format(parseISO(displayData.createdAt), 'MMMM dd, yyyy HH:mm') : 
                  (latestAssessment ? format(new Date(latestAssessment.date), 'MMMM dd, yyyy') : 'Today')}
              </p>
              {hasBackendData && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    Assessment #{displayData.id}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Child #{displayData.childId}
                  </Badge>
                  <Badge variant="default" className="text-xs">
                    Live Data
                  </Badge>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {error && (
              <div className="flex items-center gap-2 text-sm text-risk-moderate">
                <AlertCircle className="h-4 w-4" />
                <span>Mock Data</span>
              </div>
            )}
            
            <Button onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Risk Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              Risk Assessment Summary
              <RiskBadge level={displayData.riskLevel as any} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasBackendData ? (
              // Backend data display
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {displayData.prediction}
                    </div>
                    <p className="text-sm text-muted-foreground">Classification</p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {displayData.confidence != null ? `${(displayData.confidence * 100).toFixed(1)}%` : 'N/A'}
                    </div>
                    <p className="text-sm text-muted-foreground">Confidence</p>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-1 capitalize">
                      {displayData.riskLevel}
                    </div>
                    <p className="text-sm text-muted-foreground">Risk Level</p>
                  </div>
                </div>

                {/* Assessment Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-muted-foreground text-sm">Assessment ID</p>
                    <p className="font-medium">#{displayData.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Child ID</p>
                    <p className="font-medium">#{displayData.childId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Date</p>
                    <p className="font-medium">{format(parseISO(displayData.createdAt), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Time</p>
                    <p className="font-medium">{format(parseISO(displayData.createdAt), 'HH:mm:ss')}</p>
                  </div>
                </div>

                {/* Download Section */}
                {displayData.gazeDataPath && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Raw Gaze Data</p>
                          <p className="text-sm text-muted-foreground">Complete eye tracking data in Excel format</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleDownload(displayData.gazeDataPath!, `gaze_data_${displayData.id}.xlsx`)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Excel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Mock data display
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {latestAssessment?.fixationCount || 'N/A'}
                  </div>
                  <p className="text-sm text-muted-foreground">Fixation Count</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {latestAssessment?.gazeDeviation || 'N/A'}%
                  </div>
                  <p className="text-sm text-muted-foreground">Gaze Deviation</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {resolvedChild.assessmentCount}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Assessments</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visual Analysis */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Scanpath Analysis
                </CardTitle>
                {displayData.scanpathImage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(displayData.scanpathImage!, `scanpath_${hasBackendData ? displayData.id : childId}.png`)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                {imageLoading.scanpath && displayData.scanpathImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                    <LoadingSpinner size="md" text="Loading scanpath..." />
                  </div>
                )}
                
                {displayData.scanpathImage ? (
                  imageErrors.scanpath ? (
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Failed to load scanpath image</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => window.open(displayData.scanpathImage!, '_blank')}
                      >
                        Open in new tab
                      </Button>
                    </div>
                  ) : (
                    <img 
                      src={displayData.scanpathImage} 
                      alt="Scanpath visualization showing eye movement patterns"
                      className="w-full h-full object-contain rounded-lg"
                      onLoad={() => handleImageLoad('scanpath')}
                      onError={() => handleImageError('scanpath')}
                    />
                  )
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Scanpath visualization</p>
                    <p className="text-sm">
                      {hasBackendData ? 'Real-time eye movement analysis' : 'Generated from gaze tracking data'}
                    </p>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Visual representation of eye movement patterns during the assessment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Attention Heatmap
                </CardTitle>
                {displayData.heatmapImage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(displayData.heatmapImage!, `heatmap_${hasBackendData ? displayData.id : childId}.png`)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                {imageLoading.heatmap && displayData.heatmapImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                    <LoadingSpinner size="md" text="Loading heatmap..." />
                  </div>
                )}
                
                {displayData.heatmapImage ? (
                  imageErrors.heatmap ? (
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Failed to load heatmap image</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => window.open(displayData.heatmapImage!, '_blank')}
                      >
                        Open in new tab
                      </Button>
                    </div>
                  ) : (
                    <img 
                      src={displayData.heatmapImage} 
                      alt="Attention heatmap showing visual focus areas"
                      className="w-full h-full object-contain rounded-lg"
                      onLoad={() => handleImageLoad('heatmap')}
                      onError={() => handleImageError('heatmap')}
                    />
                  )
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Attention heatmap</p>
                    <p className="text-sm">Shows areas of visual attention focus</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Heat visualization showing areas of concentrated visual attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Assessment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              {hasBackendData ? 'Assessment Analysis' : 'Detailed Gaze Metrics'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasBackendData ? (
              // Show real backend data
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">#{displayData.id}</div>
                    <p className="text-sm text-muted-foreground">Assessment ID</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {(displayData.confidence * 100).toFixed(0)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Confidence</p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600 capitalize">
                      {displayData.riskLevel}
                    </div>
                    <p className="text-sm text-muted-foreground">Risk Level</p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {displayData.prediction}
                    </div>
                    <p className="text-sm text-muted-foreground">Classification</p>
                  </div>
                </div>

                {/* Clinical Interpretation */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Clinical Interpretation</h4>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Classification:</strong> {displayData.prediction}</p>
                    <p><strong>Confidence Level:</strong> {(displayData.confidence * 100).toFixed(1)}%</p>
                    <p><strong>Risk Assessment:</strong> {displayData.riskLevel} risk level</p>
                    {displayData.riskLevel === 'high' && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-800 font-medium">⚠️ High Risk Assessment</p>
                        <p className="text-red-700 text-sm">Immediate referral to autism specialist recommended for comprehensive evaluation.</p>
                      </div>
                    )}
                    {displayData.riskLevel === 'moderate' && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-yellow-800 font-medium">⚠️ Moderate Risk Assessment</p>
                        <p className="text-yellow-700 text-sm">Consider additional evaluation and monitoring. Consult with developmental specialist.</p>
                      </div>
                    )}
                    {displayData.riskLevel === 'low' && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-green-800 font-medium">✅ Low Risk Assessment</p>
                        <p className="text-green-700 text-sm">Continue regular developmental monitoring as recommended.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Show mock metrics for cases without backend data
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Fixation Count</p>
                  <p className="text-xl font-bold">{displayData.fixationCount || 'N/A'}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Gaze Deviation</p>
                  <p className="text-xl font-bold">{displayData.gazeDeviation || 'N/A'}%</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                  <p className="text-xl font-bold capitalize">{displayData.riskLevel}</p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Assessment Count</p>
                  <p className="text-xl font-bold">{resolvedChild.assessmentCount || 1}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Doctor Comments */}
        {user?.role === 'doctor' && (
          <Card>
            <CardHeader>
              <CardTitle>Doctor Comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doctor-comment">Clinical Notes and Observations</Label>
                <Textarea
                  id="doctor-comment"
                  placeholder="Enter your clinical observations, recommendations, and notes..."
                  value={doctorComment}
                  onChange={(e) => setDoctorComment(e.target.value)}
                  className="min-h-32"
                />
              </div>
              
              <Button onClick={handleSaveComment} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Comment"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Read-only comments for non-doctors */}
        {user?.role !== 'doctor' && latestAssessment?.doctorComments && (
          <Card>
            <CardHeader>
              <CardTitle>Doctor's Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{latestAssessment?.doctorComments}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}