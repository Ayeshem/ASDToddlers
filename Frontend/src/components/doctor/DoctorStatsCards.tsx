import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { doctorPatientApi } from "@/services/doctorPatientApi";
import { 
  Users, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  Shield,
  Target,
  CheckCircle
} from "lucide-react";

interface StatsData {
  totalPatients: number;
  totalDoctors: number;
  safeRiskCount: number;
  lowRiskCount: number;
  moderateRiskCount: number;
  highRiskCount: number;
}

export function DoctorStatsCards() {
  const [stats, setStats] = useState<StatsData>({
    totalPatients: 0,
    totalDoctors: 0,
    safeRiskCount: 0,
    lowRiskCount: 0,
    moderateRiskCount: 0,
    highRiskCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        childrenCount,
        doctorCount,
        safeRisk,
        lowRisk,
        moderateRisk,
        highRisk
      ] = await Promise.allSettled([
        doctorPatientApi.getChildrenCount(),
        doctorPatientApi.getDoctorCount(),
        doctorPatientApi.getSafeRiskCount(),
        doctorPatientApi.getLowRiskCount(),
        doctorPatientApi.getModerateRiskCount(),
        doctorPatientApi.getHighRiskCount()
      ]);

      setStats({
        totalPatients: childrenCount.status === 'fulfilled' ? childrenCount.value.total_children : 0,
        totalDoctors: doctorCount.status === 'fulfilled' ? doctorCount.value.total_doctors : 0,
        safeRiskCount: safeRisk.status === 'fulfilled' ? safeRisk.value.count : 0,
        lowRiskCount: lowRisk.status === 'fulfilled' ? lowRisk.value.count : 0,
        moderateRiskCount: moderateRisk.status === 'fulfilled' ? moderateRisk.value.count : 0,
        highRiskCount: highRisk.status === 'fulfilled' ? highRisk.value.count : 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setError('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const totalAssessments = 
    stats.safeRiskCount + stats.lowRiskCount + stats.moderateRiskCount + stats.highRiskCount;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center py-8">
              <LoadingSpinner size="sm" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="col-span-5">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Patients */}
      <Card className="bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">Total Patients</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700">{stats.totalPatients}</div>
          <p className="text-xs text-blue-700/70">Active patient profiles</p>
        </CardContent>
      </Card>
  
      {/* Total Assessments */}
      <Card className="bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20 hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-indigo-700">Total Assessments</CardTitle>
          <Activity className="h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-indigo-700">{totalAssessments}</div>
          <p className="text-xs text-indigo-700/70">Completed evaluations</p>
        </CardContent>
      </Card>
  
      {/* High Risk Cases */}
      <Card className="bg-red-500/10 border-red-500/20 hover:bg-red-500/20 hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-red-700">High Risk Cases</CardTitle>
          <TrendingUp className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-700">{stats.highRiskCount}</div>
          <p className="text-xs text-red-700/70">Require immediate attention</p>
        </CardContent>
      </Card>
  
      {/* Moderate Risk Cases */}
      <Card className="bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20 hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-yellow-700">Moderate Risk Cases</CardTitle>
          <Target className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-700">{stats.moderateRiskCount}</div>
          <p className="text-xs text-yellow-700/70">Monitoring recommended</p>
        </CardContent>
      </Card>
  
      {/* Low Risk Cases */}
      <Card className="bg-green-500/10 border-green-500/20 hover:bg-green-500/20 hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-green-700">Low Risk Cases</CardTitle>
          <Shield className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">{stats.lowRiskCount}</div>
          <p className="text-xs text-green-700/70">Healthy development</p>
        </CardContent>
      </Card>
  
      {/* Safe Cases */}
      <Card className="bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-emerald-700">Safe Cases</CardTitle>
          <CheckCircle className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-700">{stats.safeRiskCount}</div>
          <p className="text-xs text-emerald-700/70">No concerns detected</p>
        </CardContent>
      </Card>
    </div>
  );
}  