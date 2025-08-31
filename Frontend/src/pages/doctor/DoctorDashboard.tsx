import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PatientCard } from "@/components/doctor/patient-card";
import { PatientDetailsModal } from "@/components/doctor/PatientDetailsModal";
import { DoctorStatsCards } from "@/components/doctor/DoctorStatsCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { doctorPatientApi, type Child, type Report } from "@/services/doctorPatientApi";
import { RefreshCw, Search, Filter, Users, AlertTriangle } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [patients, setPatients] = useState<(Child & { latestReport?: Report })[]>([]);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Child | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const patientsWithReports = await doctorPatientApi.getAllPatientsWithReports();
      setPatients(patientsWithReports);
      
      // Get recent reports from all patients
      const allReports = patientsWithReports
        .map(p => p.latestReport)
        .filter(Boolean) as Report[];
      
      // Sort by date and take latest 5
      const sortedReports = allReports
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      
      setRecentReports(sortedReports);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      setError('Failed to load patient data');
      toast({
        title: "Error",
        description: "Failed to load patient data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (patient: Child) => {
    setSelectedPatient(patient);
    setIsDetailsModalOpen(true);
  };

  const handleDownloadPDF = async (patient: Child) => {
    try {
      const latestReport = await doctorPatientApi.getLatestReport(patient.id);
      
      toast({
        title: "Download Starting",
        description: `Downloading report for ${patient.name}...`,
      });

      // Create downloadable report data
      const reportData = {
        patient: patient.name,
        patientId: patient.id,
        dateOfBirth: patient.dob,
        assessmentDate: latestReport.created_at,
        riskLevel: latestReport.risk_level,
        confidence: `${(latestReport.confidence * 100).toFixed(1)}%`,
        predictedClass: latestReport.predicted_class,
        reportId: latestReport.id
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${patient.name}_report_${format(parseISO(latestReport.created_at), 'yyyy-MM-dd')}.json`;
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
        description: "No recent assessment found for this patient.",
        variant: "destructive",
      });
    }
  };

  const handleSchedule = (patient: Child) => {
    navigate('/appointments');
  };

  const handleRefresh = () => {
    fetchPatients();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage your patient assessments</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => navigate('/gaze-session/new')}>
              Start Assessment
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <DoctorStatsCards />

        {/* Patient List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Patient List
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{patients.length} total patients</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" text="Loading patients..." />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button variant="outline" onClick={handleRefresh}>
                  Try Again
                </Button>
              </div>
            ) : patients.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No patients found</p>
                <p className="text-sm">Patient records will appear here once they are registered</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {patients.map((patient) => (
                  <PatientCard
                    key={patient.id}
                    patient={patient}
                    onViewDetails={handleViewDetails}
                    onDownloadPDF={handleDownloadPDF}
                    onSchedule={handleSchedule}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Assessment Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Assessment Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentReports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent assessments found</p>
                <p className="text-sm">Assessment activity will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentReports.map((report) => {
                  const patient = patients.find(p => p.id === report.child_id);
                  return (
                    <div 
                      key={report.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => patient && handleViewDetails(patient)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-medium">{patient?.name || `Patient #${report.child_id}`}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              report.risk_level.toLowerCase() === 'safe' ? 'bg-emerald-100 text-emerald-800' :
                            report.risk_level.toLowerCase() === 'low' ? 'bg-green-100 text-green-800' :
                            report.risk_level.toLowerCase() === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {report.risk_level} Risk
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(report.created_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-right">
                          <p className="font-medium">{report.predicted_class}</p>
                          <p className="text-muted-foreground">
                            {(report.confidence * 100).toFixed(1)}% confidence
                          </p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          report.risk_level.toLowerCase() === 'safe' ? 'bg-emerald-500' :
                          report.risk_level.toLowerCase() === 'low' ? 'bg-green-500' :
                          report.risk_level.toLowerCase() === 'moderate' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patient Details Modal */}
        <PatientDetailsModal
          patient={selectedPatient}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedPatient(null);
          }}
        />
      </div>
    </DashboardLayout>
  );
}