import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { adminApi, type SystemStats } from "@/services/adminApi";
import { 
  Users, Activity, Database, Settings, Download, BarChart3, Video, RefreshCw, AlertTriangle
} from "lucide-react";

// Import tab components
import { DoctorManagementTab } from "@/components/admin/DoctorManagementTab";
import { StimuliManagementTab } from "@/components/admin/StimuliManagementTab";
import { OverviewTab } from "@/components/admin/OverviewTab";
import { AssessmentsTab } from "@/components/admin/AssessmentsTab";
import { SystemTab } from "@/components/admin/SystemTab";
import { SystemLogsTab } from "@/components/admin/SystemLogsTab";

export default function AdminDashboard() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    totalDoctors: 0,
    totalChildren: 0,
    totalAssessments: 0,
    totalStimuli: 0,
    safeRiskCount: 0,     // added
    lowRiskCount: 0,
    moderateRiskCount: 0,
    highRiskCount: 0,
    systemHealth: 'warning'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const stats = await adminApi.getSystemStats();
      setSystemStats(stats);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSystemBackup = async () => {
    toast({
      title: "System backup initiated",
      description: "Creating backup of all system data...",
    });
    
    // Mock backup process for now - you can integrate with real backup API
    setTimeout(() => {
      toast({
        title: "Backup completed",
        description: "System backup has been completed successfully.",
      });
    }, 3000);
  };

  const handleSystemMaintenance = async () => {
    const newMode = !isMaintenanceMode;
    setIsMaintenanceMode(newMode);
    
    toast({
      title: newMode ? "Maintenance mode activated" : "Maintenance mode deactivated",
      description: newMode ? "System is now in maintenance mode. Users will be notified." : "System is now operational.",
    });
  };

  const handleGenerateReport = async () => {
    try {
      // Generate comprehensive system report with real data
      const report = `
System Report - ${new Date().toLocaleDateString()}

=== SYSTEM STATISTICS ===
Total Users: ${systemStats.totalUsers}
Total Doctors: ${systemStats.totalDoctors}
Total Children: ${systemStats.totalChildren}
Total Assessments: ${systemStats.totalAssessments}
Total Stimuli: ${systemStats.totalStimuli}

=== RISK DISTRIBUTION ===
Safe: ${systemStats.safeRiskCount} (${systemStats.totalAssessments > 0 ? ((systemStats.safeRiskCount / systemStats.totalAssessments) * 100).toFixed(1) : 0}%)
Low Risk: ${systemStats.lowRiskCount} (${systemStats.totalAssessments > 0 ? ((systemStats.lowRiskCount / systemStats.totalAssessments) * 100).toFixed(1) : 0}%)
Moderate Risk: ${systemStats.moderateRiskCount} (${systemStats.totalAssessments > 0 ? ((systemStats.moderateRiskCount / systemStats.totalAssessments) * 100).toFixed(1) : 0}%)
High Risk: ${systemStats.highRiskCount} (${systemStats.totalAssessments > 0 ? ((systemStats.highRiskCount / systemStats.totalAssessments) * 100).toFixed(1) : 0}%)

=== SYSTEM HEALTH ===
Status: ${systemStats.systemHealth.toUpperCase()}

Generated at: ${new Date().toISOString()}
      `.trim();
      
      // Create a downloadable file
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-system-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Report generated",
        description: "System report has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Report generation failed",
        description: "There was an error generating the system report.",
        variant: "destructive",
      });
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive system administration and monitoring</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchDashboardData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleSystemBackup}>
              <Database className="h-4 w-4 mr-2" />
              Backup System
            </Button>
            <Button 
              variant={isMaintenanceMode ? "destructive" : "outline"} 
              onClick={handleSystemMaintenance}
            >
              <Settings className="h-4 w-4 mr-2" />
              {isMaintenanceMode ? 'Disable Maintenance' : 'Maintenance Mode'}
            </Button>
            <Button variant="outline" onClick={handleGenerateReport}>
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <p className="text-destructive text-sm">{error}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchDashboardData}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Statistics Cards */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="flex items-center justify-center py-8">
                  <LoadingSpinner size="sm" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Children</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalChildren}</div>
                <p className="text-xs text-muted-foreground">
                  Registered patients
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalDoctors}</div>
                <p className="text-xs text-muted-foreground">
                  Healthcare professionals
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalAssessments}</div>
                <p className="text-xs text-muted-foreground">
                  {systemStats.highRiskCount} high risk cases
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stimuli Library</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalStimuli}</div>
                <p className="text-xs text-muted-foreground">
                  Video stimuli available
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* System Health Banner */}
        <Card className={`border-l-4 ${
          systemStats.systemHealth === 'excellent' ? 'border-l-green-500 bg-green-50' :
          systemStats.systemHealth === 'good' ? 'border-l-blue-500 bg-blue-50' :
          systemStats.systemHealth === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
          'border-l-red-500 bg-red-50'
        }`}>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Activity className={`h-5 w-5 ${getHealthColor(systemStats.systemHealth)}`} />
              <div>
                <div className="font-medium">System Health: <span className={getHealthColor(systemStats.systemHealth)}>{systemStats.systemHealth.toUpperCase()}</span></div>
                <div className="text-sm text-muted-foreground">
                  {systemStats.totalUsers} total users • {systemStats.totalAssessments} assessments completed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="doctors">Doctor Management</TabsTrigger>
            <TabsTrigger value="stimuli">Stimuli Management</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="doctors">
            <DoctorManagementTab />
          </TabsContent>

          <TabsContent value="stimuli">
            <StimuliManagementTab />
          </TabsContent>

          <TabsContent value="assessments">
            <AssessmentsTab />
          </TabsContent>

          <TabsContent value="system">
            <SystemTab />
          </TabsContent>

          <TabsContent value="logs">
            <SystemLogsTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}