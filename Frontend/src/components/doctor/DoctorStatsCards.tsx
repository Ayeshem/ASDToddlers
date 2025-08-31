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
  UserCheck,
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPatients}</div>
          <p className="text-xs text-muted-foreground">
            Active patient profiles
          </p>
        </CardContent>
      </Card>

      {/* Total Assessments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAssessments}</div>
          <p className="text-xs text-muted-foreground">
            Completed evaluations
          </p>
        </CardContent>
      </Card>

      {/* High Risk Cases */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">High Risk Cases</CardTitle>
          <TrendingUp className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.highRiskCount}</div>
          <p className="text-xs text-muted-foreground">
            Require immediate attention
          </p>
        </CardContent>
      </Card>

      {/* Moderate Risk Cases */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Moderate Risk Cases</CardTitle>
          <Target className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.moderateRiskCount}</div>
          <p className="text-xs text-muted-foreground">
            Monitoring recommended
          </p>
        </CardContent>
      </Card>

      {/* Low Risk Cases */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Low Risk Cases</CardTitle>
          <Shield className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.lowRiskCount}</div>
          <p className="text-xs text-muted-foreground">
            Healthy development
          </p>
        </CardContent>
      </Card>

      {/* Safe Cases */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Safe Cases</CardTitle>
          <CheckCircle className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">{stats.safeRiskCount}</div>
          <p className="text-xs text-muted-foreground">
            No concerns detected
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
