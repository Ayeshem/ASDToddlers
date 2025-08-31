import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { adminApi, type GazeResult, type Child } from "@/services/adminApi";
import { AssessmentResultModal } from "./AssessmentResultModal";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, AlertTriangle, TrendingUp, Users, Activity, Eye } from "lucide-react";
import { format, parseISO } from "date-fns";

// export function OverviewTab() {
//   const [recentReports, setRecentReports] = useState<(GazeResult & { childName?: string })[]>([]);
//   const [selectedResult, setSelectedResult] = useState<GazeResult & { childName?: string } | null>(null);
//   const [showResultModal, setShowResultModal] = useState(false);
//   const [riskStats, setRiskStats] = useState({
//     low: 0,
//     moderate: 0,
//     high: 0
//   });
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const { toast } = useToast();

//   useEffect(() => {
//     fetchOverviewData();
//   }, []);

//   const fetchOverviewData = async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const [recentReportsData, lowRisk, moderateRisk, highRisk] = await Promise.allSettled([
//         adminApi.getRecentSystemReports(5),
//         adminApi.getLowRiskCount(),
//         adminApi.getModerateRiskCount(),
//         adminApi.getHighRiskCount()
//       ]);

//       if (recentReportsData.status === 'fulfilled') {
//         setRecentReports(recentReportsData.value);
//       }

//       setRiskStats({
//         low: lowRisk.status === 'fulfilled' ? lowRisk.value.count : 0,
//         moderate: moderateRisk.status === 'fulfilled' ? moderateRisk.value.count : 0,
//         high: highRisk.status === 'fulfilled' ? highRisk.value.count : 0
//       });

//     } catch (error) {
//       console.error('Failed to fetch overview data:', error);
//       setError('Failed to load overview data');
//       toast({
//         title: "Error",
//         description: "Failed to load overview data. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleViewResult = (result: GazeResult & { childName?: string }) => {
//     setSelectedResult(result);
//     setShowResultModal(true);
//   };

//   if (isLoading) {
//     return (
//       <div className="space-y-4">
//         <div className="flex items-center justify-center py-12">
//           <LoadingSpinner size="lg" text="Loading overview data..." />
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="space-y-4">
//         <div className="text-center py-12">
//           <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
//           <p className="text-red-600 mb-4">{error}</p>
//           <Button variant="outline" onClick={fetchOverviewData}>
//             <RefreshCw className="h-4 w-4 mr-2" />
//             Try Again
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   const totalAssessments = riskStats.low + riskStats.moderate + riskStats.high;

//   return (
//     <div className="space-y-4">
//       {/* Header with Refresh */}
//       <div className="flex items-center justify-between">
//         <h3 className="text-lg font-semibold">System Overview</h3>
//         <Button variant="outline" onClick={fetchOverviewData} size="sm">
//           <RefreshCw className="h-4 w-4 mr-2" />
//           Refresh
//         </Button>
//       </div>

//       {/* Risk Level Distribution */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <TrendingUp className="h-5 w-5" />
//             Risk Level Distribution
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-3 gap-4">
//             <div className="text-center p-4 border rounded-lg">
//               <div className="text-3xl font-bold text-green-600">
//                 {riskStats.low}
//               </div>
//               <div className="text-sm text-muted-foreground">Low Risk</div>
//               <div className="text-xs text-muted-foreground mt-1">
//                 {totalAssessments > 0 ? `${((riskStats.low / totalAssessments) * 100).toFixed(1)}%` : '0%'}
//               </div>
//             </div>
//             <div className="text-center p-4 border rounded-lg">
//               <div className="text-3xl font-bold text-yellow-600">
//                 {riskStats.moderate}
//               </div>
//               <div className="text-sm text-muted-foreground">Moderate Risk</div>
//               <div className="text-xs text-muted-foreground mt-1">
//                 {totalAssessments > 0 ? `${((riskStats.moderate / totalAssessments) * 100).toFixed(1)}%` : '0%'}
//               </div>
//             </div>
//             <div className="text-center p-4 border rounded-lg">
//               <div className="text-3xl font-bold text-red-600">
//                 {riskStats.high}
//               </div>
//               <div className="text-sm text-muted-foreground">High Risk</div>
//               <div className="text-xs text-muted-foreground mt-1">
//                 {totalAssessments > 0 ? `${((riskStats.high / totalAssessments) * 100).toFixed(1)}%` : '0%'}
//               </div>
//             </div>
//           </div>
          
//           <div className="mt-4 p-3 bg-muted/30 rounded-lg">
//             <div className="flex items-center justify-between text-sm">
//               <span className="font-medium">Total Assessments</span>
//               <span className="font-bold">{totalAssessments}</span>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Recent Assessment Activity */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Activity className="h-5 w-5" />
//             Recent Assessment Activity
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {recentReports.length === 0 ? (
//             <div className="text-center py-8 text-muted-foreground">
//               <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
//               <p>No recent assessments found</p>
//               <p className="text-sm">Assessment activity will appear here</p>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {recentReports.map((report) => (
//                 <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-3">
//                       <div className="font-medium">Report #{report.id}</div>
//                       <Badge 
//                         variant={
//                           report.risk_level.toLowerCase() === 'low' ? 'default' :
//                           report.risk_level.toLowerCase() === 'moderate' ? 'secondary' : 'destructive'
//                         }
//                       >
//                         {report.risk_level} Risk
//                       </Badge>
//                     </div>
//                     <div className="text-sm text-muted-foreground mt-1">
//                       <span className="flex items-center gap-2">
//                         <Users className="h-3 w-3" />
//                         {report.childName || `Child #${report.child_id}`} • 
//                         {format(parseISO(report.created_at), 'MMM dd, yyyy HH:mm')}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <div className="text-right text-sm">
//                       <div className="font-medium">{report.predicted_class}</div>
//                       <div className="text-muted-foreground">
//                         {(report.confidence * 100).toFixed(1)}% confidence
//                       </div>
//                     </div>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => handleViewResult(report)}
//                       title="View detailed results"
//                     >
//                       <Eye className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Assessment Result Modal */}
//       <AssessmentResultModal
//         result={selectedResult}
//         isOpen={showResultModal}
//         onClose={() => {
//           setShowResultModal(false);
//           setSelectedResult(null);
//         }}
//       />
//     </div>
//   );
// }



export function OverviewTab() {
  const [recentReports, setRecentReports] = useState<(GazeResult & { childName?: string })[]>([]);
  const [selectedResult, setSelectedResult] = useState<GazeResult & { childName?: string } | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [riskStats, setRiskStats] = useState({
    safe: 0,
    low: 0,
    moderate: 0,
    high: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [recentReportsData, safeRisk, lowRisk, moderateRisk, highRisk] = await Promise.allSettled([
        adminApi.getRecentSystemReports(5),
        adminApi.getSafeRiskCount(),
        adminApi.getLowRiskCount(),
        adminApi.getModerateRiskCount(),
        adminApi.getHighRiskCount()
      ]);

      if (recentReportsData.status === 'fulfilled') {
        setRecentReports(recentReportsData.value);
      }

      setRiskStats({
        safe: safeRisk.status === 'fulfilled' ? safeRisk.value.count : 0,
        low: lowRisk.status === 'fulfilled' ? lowRisk.value.count : 0,
        moderate: moderateRisk.status === 'fulfilled' ? moderateRisk.value.count : 0,
        high: highRisk.status === 'fulfilled' ? highRisk.value.count : 0
      });

    } catch (error) {
      console.error('Failed to fetch overview data:', error);
      setError('Failed to load overview data');
      toast({
        title: "Error",
        description: "Failed to load overview data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewResult = (result: GazeResult & { childName?: string }) => {
    setSelectedResult(result);
    setShowResultModal(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" text="Loading overview data..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="outline" onClick={fetchOverviewData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const totalAssessments = riskStats.safe + riskStats.low + riskStats.moderate + riskStats.high;

  return (
    <div className="space-y-4">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">System Overview</h3>
        <Button variant="outline" onClick={fetchOverviewData} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Risk Level Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Risk Level Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-emerald-600">
                {riskStats.safe}
              </div>
              <div className="text-sm text-muted-foreground">Safe</div>
              <div className="text-xs text-muted-foreground mt-1">
                {totalAssessments > 0 ? `${((riskStats.safe / totalAssessments) * 100).toFixed(1)}%` : '0%'}
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {riskStats.low}
              </div>
              <div className="text-sm text-muted-foreground">Low Risk</div>
              <div className="text-xs text-muted-foreground mt-1">
                {totalAssessments > 0 ? `${((riskStats.low / totalAssessments) * 100).toFixed(1)}%` : '0%'}
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">
                {riskStats.moderate}
              </div>
              <div className="text-sm text-muted-foreground">Moderate Risk</div>
              <div className="text-xs text-muted-foreground mt-1">
                {totalAssessments > 0 ? `${((riskStats.moderate / totalAssessments) * 100).toFixed(1)}%` : '0%'}
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-red-600">
                {riskStats.high}
              </div>
              <div className="text-sm text-muted-foreground">High Risk</div>
              <div className="text-xs text-muted-foreground mt-1">
                {totalAssessments > 0 ? `${((riskStats.high / totalAssessments) * 100).toFixed(1)}%` : '0%'}
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Total Assessments</span>
              <span className="font-bold">{totalAssessments}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Assessment Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Assessment Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent assessments found</p>
              <p className="text-sm">Assessment activity will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="font-medium">Report #{report.id}</div>
                      <Badge 
                        variant={
                          report.risk_level.toLowerCase() === 'safe' ? 'outline' :
                          report.risk_level.toLowerCase() === 'low' ? 'default' :
                          report.risk_level.toLowerCase() === 'moderate' ? 'secondary' : 'destructive'
                        }
                      >
                        {report.risk_level === 'safe' ? 'Safe' : `${report.risk_level} Risk`}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        {report.childName || `Child #${report.child_id}`} • 
                        {format(parseISO(report.created_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      <div className="font-medium">{report.predicted_class}</div>
                      <div className="text-muted-foreground">
                        {(report.confidence * 100).toFixed(1)}% confidence
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewResult(report)}
                      title="View detailed results"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assessment Result Modal */}
      <AssessmentResultModal
        result={selectedResult}
        isOpen={showResultModal}
        onClose={() => {
          setShowResultModal(false);
          setSelectedResult(null);
        }}
      />
    </div>
  );
}
