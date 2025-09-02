import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { adminApi, type SystemStats } from "@/services/adminApi";
import {
  Users, Activity, Settings, Download, BarChart3, Video, RefreshCw, AlertTriangle, ShieldAlert
} from "lucide-react";

// Import tab components
import { OverviewTab } from "@/components/admin/OverviewTab";

export default function AdminDashboard() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isHighlighting, setIsHighlighting] = useState(false); // State for the new feature
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    totalDoctors: 0,
    totalChildren: 0,
    totalAssessments: 0,
    totalStimuli: 0,
    safeRiskCount: 0,
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

  const handleSystemMaintenance = async () => {
    const newMode = !isMaintenanceMode;
    setIsMaintenanceMode(newMode);
    
    toast({
      title: newMode ? "Maintenance mode activated" : "Maintenance mode deactivated",
      description: newMode ? "System is now in maintenance mode. Users will be notified." : "System is now operational.",
    });
  };
  
  // Handler for the new button
  const handleToggleHighlight = () => {
    setIsHighlighting(prevState => !prevState);
  };

  const handleGenerateReport = async () => {
    try {
      // Generate comprehensive system report
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

  const getHealthStyling = (health: string) => {
    switch (health) {
      case 'excellent': return { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' };
      case 'good': return { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' };
      case 'warning': return { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20' };
      case 'critical': return { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/20' };
      default: return { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/20' };
    }
  };

  const healthStyle = getHealthStyling(systemStats.systemHealth);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">System administration and monitoring.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchDashboardData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {/* New Button replacing Backup */}
            <Button
              variant={isHighlighting ? "destructive" : "secondary"}
              onClick={handleToggleHighlight}
            >
              <ShieldAlert className="h-4 w-4 mr-2" />
              {isHighlighting ? "Stop Highlighting" : "Highlight Risks"}
            </Button>
            <Button
              variant={isMaintenanceMode ? "destructive" : "secondary"}
              onClick={handleSystemMaintenance}
            >
              <Settings className="h-4 w-4 mr-2" />
              {isMaintenanceMode ? 'End Maintenance' : 'Maintenance'}
            </Button>
            <Button variant="secondary" onClick={handleGenerateReport}>
              <Download className="h-4 w-4 mr-2" />
              Report
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <p className="text-destructive font-medium text-sm">{error}</p>
            </div>
            <Button variant="destructive" size="sm" onClick={fetchDashboardData}>
              Retry
            </Button>
          </div>
        )}

        {/* Statistics Cards */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="space-y-3 animate-pulse">
                    <div className="h-5 w-3/5 rounded bg-muted"></div>
                    <div className="h-8 w-2/5 rounded bg-muted"></div>
                    <div className="h-4 w-4/5 rounded bg-muted"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="transition-all hover:shadow-md hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Children</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalChildren}</div>
                <p className="text-xs text-muted-foreground">Registered patients</p>
              </CardContent>
            </Card>
            
            <Card className="transition-all hover:shadow-md hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalDoctors}</div>
                <p className="text-xs text-muted-foreground">Healthcare professionals</p>
              </CardContent>
            </Card>
            
            {/* --- MODIFIED CARD FOR HIGHLIGHTING --- */}
            <Card className={`
              transition-all hover:shadow-md hover:-translate-y-1 
              ${isHighlighting ? 'border-destructive/50 bg-destructive/10' : ''}
            `}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalAssessments}</div>
                <p className={`
                  transition-colors 
                  ${isHighlighting ? 'text-destructive font-bold' : 'text-xs text-muted-foreground'}
                `}>
                  {systemStats.highRiskCount} high risk cases
                </p>
              </CardContent>
            </Card>
            
            <Card className="transition-all hover:shadow-md hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stimuli Library</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalStimuli}</div>
                <p className="text-xs text-muted-foreground">Video stimuli available</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* System Health Banner */}
        <Card className={`${healthStyle.bg} border ${healthStyle.border} shadow-none`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className={`h-5 w-5 ${healthStyle.text}`} />
              <div>
                <div className="font-medium">Health: <span className={`font-bold ${healthStyle.text}`}>{systemStats.systemHealth.toUpperCase()}</span></div>
                <div className="text-sm text-muted-foreground">
                  {systemStats.totalUsers} total users • {systemStats.totalAssessments} assessments completed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}