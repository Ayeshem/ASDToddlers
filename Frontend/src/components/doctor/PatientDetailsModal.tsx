// Added safe level + heatmap + scanpath
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { doctorPatientApi, type Child as APIChild, type Report as APIReport } from "@/services/doctorPatientApi";
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  Eye, 
  Activity,
  FileText,
  Brain,
  Target
} from "lucide-react";
import { format, parseISO } from "date-fns";

type Child = APIChild & {
  latestReport?: Report;
  riskLevel?: 'safe' | 'low' | 'moderate' | 'high';
  photoUrl?: string;
};

type Report = APIReport & {
  heatmap_path?: string;
  scanpath_path?: string;
  gaze_data?: any;
};

interface PatientDetailsModalProps {
  patient: Child | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PatientDetailsModal({ patient, isOpen, onClose }: PatientDetailsModalProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [latestReport, setLatestReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (patient && isOpen) {
      fetchPatientReports();
    }
  }, [patient, isOpen]);

  const fetchPatientReports = async () => {
    if (!patient) return;
    setIsLoading(true);
    setError(null);
    try {
      const [allReports, latest] = await Promise.allSettled([
        doctorPatientApi.getAllReports(patient.id),
        doctorPatientApi.getLatestReport(patient.id)
      ]);
      if (allReports.status === 'fulfilled') setReports(allReports.value);
      if (latest.status === 'fulfilled') setLatestReport(latest.value);
      else setLatestReport(null);
    } catch (error) {
      console.error('Failed to fetch patient reports:', error);
      setError('Failed to load patient reports');
      toast({ title: "Error", description: "Failed to load patient reports", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = async (report: Report) => {
    try {
      toast({ title: "Download Starting", description: `Downloading report for ${patient?.name}...` });
      const reportData = {
        patient: patient?.name, date: report.created_at, riskLevel: report.risk_level,
        confidence: report.confidence, predictedClass: report.predicted_class,
        heatmap: report.heatmap_path ?? null, scanpath: report.scanpath_path ?? null,
        gazeData: report.gaze_data ?? null,
      };
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${patient?.name}_report_${format(parseISO(report.created_at), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Download Complete", description: "Report has been downloaded successfully." });
    } catch (error) {
      toast({ title: "Download Failed", description: "Failed to download the report.", variant: "destructive" });
    }
  };

  const downloadFile = (filePath: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = filePath; a.download = fileName;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const downloadGazeData = (data: any, fileName: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fileName;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'safe': return 'outline';
      case 'low': return 'default';
      case 'moderate': return 'secondary';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
  
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
  
    if (today.getDate() < birthDate.getDate()) {
      months--;
    }
  
    if (months < 0) {
      years--;
      months += 12;
    }
  
    if (years > 0) return `${years} year${years > 1 ? 's' : ''}`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''}`;
    return 'Less than a month';
  };
  
  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* --- FIX: Make the dialog scrollable, remove padding and flex layout --- */}
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* --- FIX: Make header sticky and add padding/styling --- */}
        <DialogHeader className="sticky top-0 z-10 bg-background px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Patient Details - {patient.name}
          </DialogTitle>
        </DialogHeader>

        {/* --- FIX: Add padding to the main content area --- */}
        <div className="px-6">
          <div className="space-y-6 my-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="h-5 w-5" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="flex flex-col items-center justify-center">
                    <img
                      src={patient.photoUrl ?? '/default-baby.png'}
                      alt={patient.name}
                      className="w-28 h-28 rounded-full object-cover mb-2 border-2 border-primary/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 flex-1">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p className="text-lg font-semibold">{patient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Age</p>
                      <p className="text-lg font-semibold">{calculateAge(patient.dob)} old</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                      <p className="text-lg font-semibold">{format(new Date(patient.dob), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Patient ID</p>
                      <p className="text-lg font-semibold">#{patient.id}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {latestReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5" />
                    Latest Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                      <Badge variant={getRiskBadgeVariant(latestReport.risk_level)} className="text-md font-semibold">
                        {latestReport.risk_level.toLowerCase() === 'safe' ? 'Safe' : `${latestReport.risk_level} Risk`}
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">Predicted Class</p>
                      <p className="text-lg font-semibold">{latestReport.predicted_class}</p>
                    </div>
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">Confidence Score</p>
                      <p className="text-2xl font-bold text-primary">{(latestReport.confidence * 100).toFixed(1)}%</p>
                    </div>
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">Assessment Date</p>
                      <p className="text-lg font-semibold">
                        {format(parseISO(latestReport.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <Tabs defaultValue="scanpath" className="mt-6">
                    <TabsList>
                      {latestReport.scanpath_path && <TabsTrigger value="scanpath">Scanpath</TabsTrigger>}
                      {latestReport.heatmap_path && <TabsTrigger value="heatmap">Heatmap</TabsTrigger>}
                      {latestReport.gaze_data && <TabsTrigger value="gaze">Gaze Data</TabsTrigger>}
                    </TabsList>

                    {latestReport.scanpath_path && (
                        <TabsContent value="scanpath">
                            <div className="mt-2 p-4 border rounded-lg bg-muted/30">
                                <img src={latestReport.scanpath_path} alt="Scanpath" className="w-full max-w-md mx-auto rounded border" />
                                <Button className="mt-3" size="sm" variant="outline"
                                    onClick={() => downloadFile(latestReport.scanpath_path!, `${patient?.name}_scanpath.png`)}>
                                    <Download className="h-3 w-3 mr-2" /> Download Scanpath
                                </Button>
                            </div>
                        </TabsContent>
                    )}
                    {latestReport.heatmap_path && (
                        <TabsContent value="heatmap">
                            <div className="mt-2 p-4 border rounded-lg bg-muted/30">
                                <img src={latestReport.heatmap_path} alt="Heatmap" className="w-full max-w-md mx-auto rounded border" />
                                <Button className="mt-3" size="sm" variant="outline"
                                    onClick={() => downloadFile(latestReport.heatmap_path!, `${patient?.name}_heatmap.png`)}>
                                    <Download className="h-3 w-3 mr-2" /> Download Heatmap
                                </Button>
                            </div>
                        </TabsContent>
                    )}
                    {latestReport.gaze_data && (
                         <TabsContent value="gaze">
                            <div className="mt-2 p-4 border rounded-lg bg-muted/30">
                               <pre className="text-xs bg-background p-3 rounded-md overflow-auto max-h-60">{JSON.stringify(latestReport.gaze_data, null, 2)}</pre>
                               <Button className="mt-3" size="sm" variant="outline"
                                   onClick={() => downloadGazeData(latestReport.gaze_data, `${patient?.name}_gaze_data.json`)}>
                                   <Download className="h-3 w-3 mr-2" /> Download Gaze Data
                               </Button>
                           </div>
                       </TabsContent>
                    )}
                  </Tabs>

                  <div className="mt-6 pt-6 border-t">
                    <Button onClick={() => handleDownloadReport(latestReport)} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Full Latest Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="h-5 w-5" />
                  Assessment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8"><LoadingSpinner size="md" text="Loading reports..." /></div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">{error}</p>
                    <Button variant="outline" onClick={fetchPatientReports} className="mt-2">Retry</Button>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No assessment reports found for this patient.</p>
                    <p className="text-sm">Reports will appear here after conducting assessments.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div key={report.id} className="p-4 border rounded-lg transition-colors">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <Badge variant={getRiskBadgeVariant(report.risk_level)}>
                                {report.risk_level.toLowerCase() === 'safe' ? 'Safe' : `${report.risk_level} Risk`}
                              </Badge>
                              <span className="font-medium">{report.predicted_class}</span>
                            </div>
                            <div className="mt-2 text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1">
                              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{format(parseISO(report.created_at), 'MMM dd, yyyy HH:mm')}</span>
                              <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" />{(report.confidence * 100).toFixed(1)}% confidence</span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleDownloadReport(report)} className="w-full sm:w-auto">
                            <Download className="h-3 w-3 mr-1.5" /> Download
                          </Button>
                        </div>

                        {(report.scanpath_path || report.heatmap_path || report.gaze_data) && (
                            <Tabs defaultValue="scanpath" className="mt-4 pt-4 border-t">
                                <TabsList>
                                    {report.scanpath_path && <TabsTrigger value="scanpath">Scanpath</TabsTrigger>}
                                    {report.heatmap_path && <TabsTrigger value="heatmap">Heatmap</TabsTrigger>}
                                    {report.gaze_data && <TabsTrigger value="gaze">Gaze Data</TabsTrigger>}
                                </TabsList>
                                {report.scanpath_path && (
                                    <TabsContent value="scanpath">
                                        <div className="mt-2"><img src={report.scanpath_path} alt="Scanpath" className="w-full max-w-[240px] rounded border" /></div>
                                    </TabsContent>
                                )}
                                {report.heatmap_path && (
                                    <TabsContent value="heatmap">
                                        <div className="mt-2"><img src={report.heatmap_path} alt="Heatmap" className="w-full max-w-[240px] rounded border" /></div>
                                    </TabsContent>
                                )}
                                {report.gaze_data && (
                                    <TabsContent value="gaze">
                                        <div className="mt-2"><pre className="text-xs bg-muted/50 p-2 rounded overflow-auto max-h-40">{JSON.stringify(report.gaze_data, null, 2)}</pre></div>
                                    </TabsContent>
                                )}
                            </Tabs>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* --- FIX: Make footer sticky and add padding/styling --- */}
        <div className="sticky bottom-0 z-10 bg-background px-6 pb-6 pt-4 border-t">
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}