import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { doctorPatientApi, type Child, type Report } from "@/services/doctorPatientApi";
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

      if (allReports.status === 'fulfilled') {
        setReports(allReports.value);
      }

      if (latest.status === 'fulfilled') {
        setLatestReport(latest.value);
      } else {
        setLatestReport(null);
      }
    } catch (error) {
      console.error('Failed to fetch patient reports:', error);
      setError('Failed to load patient reports');
      toast({
        title: "Error",
        description: "Failed to load patient reports",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = async (report: Report) => {
    try {
      toast({
        title: "Download Starting",
        description: `Downloading report for ${patient?.name}...`,
      });

      // Mock PDF download - replace with actual download logic
      const reportData = {
        patient: patient?.name,
        date: report.created_at,
        riskLevel: report.risk_level,
        confidence: report.confidence,
        predictedClass: report.predicted_class
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${patient?.name}_report_${format(parseISO(report.created_at), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: "Report has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the report.",
        variant: "destructive",
      });
    }
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low': return 'default';
      case 'moderate': return 'secondary';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Patient Details - {patient.name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <div className="space-y-6">
            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-lg font-semibold">{patient.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Age</p>
                    <p className="text-lg font-semibold">{calculateAge(patient.dob)} years old</p>
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
              </CardContent>
            </Card>

            {/* Latest Assessment */}
            {latestReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Latest Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                        <Badge 
                          variant={getRiskBadgeVariant(latestReport.risk_level)}
                          className="text-sm"
                        >
                          {latestReport.risk_level} Risk
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Confidence Score</p>
                        <p className="text-2xl font-bold">{(latestReport.confidence * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Predicted Class</p>
                        <p className="text-lg font-semibold">{latestReport.predicted_class}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Assessment Date</p>
                        <p className="text-lg font-semibold">
                          {format(parseISO(latestReport.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <Button 
                      onClick={() => handleDownloadReport(latestReport)}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Latest Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reports History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Assessment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="md" text="Loading reports..." />
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">{error}</p>
                    <Button 
                      variant="outline" 
                      onClick={fetchPatientReports}
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No assessment reports found for this patient</p>
                    <p className="text-sm">Reports will appear here after conducting assessments</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reports.map((report) => (
                      <div 
                        key={report.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Badge variant={getRiskBadgeVariant(report.risk_level)}>
                              {report.risk_level}
                            </Badge>
                            <span className="font-medium">{report.predicted_class}</span>
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(parseISO(report.created_at), 'MMM dd, yyyy HH:mm')}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {(report.confidence * 100).toFixed(1)}% confidence
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReport(report)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
