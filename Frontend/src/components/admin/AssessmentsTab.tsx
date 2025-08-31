import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { adminApi, type GazeResult, type Child } from "@/services/adminApi";
import { AssessmentResultModal } from "./AssessmentResultModal";
import { 
  BarChart3, 
  RefreshCw, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Calendar,
  Brain,
  FileText,
  Eye
} from "lucide-react";
import { format, parseISO } from "date-fns";

// export function AssessmentsTab() {
//   const [allReports, setAllReports] = useState<{ child: Child; reports: GazeResult[] }[]>([]);
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
//     fetchAssessmentData();
//   }, []);

//   const fetchAssessmentData = async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const [systemReports, lowRisk, moderateRisk, highRisk] = await Promise.allSettled([
//         adminApi.getAllSystemReports(),
//         adminApi.getLowRiskCount(),
//         adminApi.getModerateRiskCount(),
//         adminApi.getHighRiskCount()
//       ]);

//       if (systemReports.status === 'fulfilled') {
//         setAllReports(systemReports.value);
//       }

//       setRiskStats({
//         low: lowRisk.status === 'fulfilled' ? lowRisk.value.count : 0,
//         moderate: moderateRisk.status === 'fulfilled' ? moderateRisk.value.count : 0,
//         high: highRisk.status === 'fulfilled' ? highRisk.value.count : 0
//       });

//     } catch (error) {
//       console.error('Failed to fetch assessment data:', error);
//       setError('Failed to load assessment data');
//       toast({
//         title: "Error",
//         description: "Failed to load assessment data. Please try again.",
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
//       <div className="flex items-center justify-center py-12">
//         <LoadingSpinner size="lg" text="Loading assessment data..." />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center py-12">
//         <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
//         <p className="text-red-600 mb-4">{error}</p>
//         <Button variant="outline" onClick={fetchAssessmentData}>
//           <RefreshCw className="h-4 w-4 mr-2" />
//           Try Again
//         </Button>
//       </div>
//     );
//   }

//   const totalAssessments = riskStats.low + riskStats.moderate + riskStats.high;
//   const childrenWithAssessments = allReports.filter(({ reports }) => reports.length > 0);
//   const totalChildren = allReports.length;

//   // Get all reports for detailed view
//   const allIndividualReports: (GazeResult & { childName: string })[] = [];
//   allReports.forEach(({ child, reports }) => {
//     reports.forEach(report => {
//       allIndividualReports.push({
//         ...report,
//         childName: child.name
//       });
//     });
//   });

//   // Sort by date (most recent first)
//   allIndividualReports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <h3 className="text-lg font-semibold">Assessment Analytics</h3>
//         <Button variant="outline" onClick={fetchAssessmentData} size="sm">
//           <RefreshCw className="h-4 w-4 mr-2" />
//           Refresh
//         </Button>
//       </div>

//       {/* Statistics Cards */}
//       <div className="grid gap-4 md:grid-cols-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
//             <BarChart3 className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold text-blue-600">{totalAssessments}</div>
//             <p className="text-xs text-muted-foreground">
//               Across {totalChildren} children
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Low Risk</CardTitle>
//             <TrendingUp className="h-4 w-4 text-green-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold text-green-600">{riskStats.low}</div>
//             <p className="text-xs text-muted-foreground">
//               {totalAssessments > 0 ? `${((riskStats.low / totalAssessments) * 100).toFixed(1)}%` : '0%'} of total
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Moderate Risk</CardTitle>
//             <AlertTriangle className="h-4 w-4 text-yellow-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold text-yellow-600">{riskStats.moderate}</div>
//             <p className="text-xs text-muted-foreground">
//               {totalAssessments > 0 ? `${((riskStats.moderate / totalAssessments) * 100).toFixed(1)}%` : '0%'} of total
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">High Risk</CardTitle>
//             <AlertTriangle className="h-4 w-4 text-red-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold text-red-600">{riskStats.high}</div>
//             <p className="text-xs text-muted-foreground">
//               {totalAssessments > 0 ? `${((riskStats.high / totalAssessments) * 100).toFixed(1)}%` : '0%'} of total
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Children Assessment Summary */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Users className="h-5 w-5" />
//             Children Assessment Summary
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {allReports.length === 0 ? (
//             <div className="text-center py-8 text-muted-foreground">
//               <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
//               <p>No children with assessments found</p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {allReports.map(({ child, reports }) => (
//                 <div key={child.id} className="border rounded-lg p-4">
//                   <div className="flex items-center justify-between mb-3">
//                     <div>
//                       <h4 className="font-medium">{child.name}</h4>
//                       <p className="text-sm text-muted-foreground">
//                         Child ID: #{child.id} • DOB: {format(new Date(child.dob), 'MMM dd, yyyy')}
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <div className="text-lg font-bold">{reports.length}</div>
//                       <div className="text-xs text-muted-foreground">Assessments</div>
//                     </div>
//                   </div>
                  
//                   {reports.length > 0 && (
//                     <div className="grid grid-cols-3 gap-3 mt-3">
//                       <div className="text-center p-2 bg-green-50 rounded">
//                         <div className="text-sm font-medium text-green-800">
//                           {reports.filter(r => r.risk_level.toLowerCase() === 'low').length}
//                         </div>
//                         <div className="text-xs text-green-600">Low Risk</div>
//                       </div>
//                       <div className="text-center p-2 bg-yellow-50 rounded">
//                         <div className="text-sm font-medium text-yellow-800">
//                           {reports.filter(r => r.risk_level.toLowerCase() === 'moderate').length}
//                         </div>
//                         <div className="text-xs text-yellow-600">Moderate</div>
//                       </div>
//                       <div className="text-center p-2 bg-red-50 rounded">
//                         <div className="text-sm font-medium text-red-800">
//                           {reports.filter(r => r.risk_level.toLowerCase() === 'high').length}
//                         </div>
//                         <div className="text-xs text-red-600">High Risk</div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* All Assessment Reports */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <FileText className="h-5 w-5" />
//             All Assessment Reports ({allIndividualReports.length})
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {allIndividualReports.length === 0 ? (
//             <div className="text-center py-8 text-muted-foreground">
//               <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
//               <p>No assessment reports found</p>
//             </div>
//           ) : (
//             <ScrollArea className="h-96">
//               <div className="space-y-3">
//                 {allIndividualReports.map((report) => (
//                   <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-3">
//                         <div className="font-medium">Report #{report.id}</div>
//                         <Badge 
//                           variant={
//                             report.risk_level.toLowerCase() === 'low' ? 'default' :
//                             report.risk_level.toLowerCase() === 'moderate' ? 'secondary' : 'destructive'
//                           }
//                         >
//                           {report.risk_level} Risk
//                         </Badge>
//                       </div>
//                       <div className="text-sm text-muted-foreground mt-1">
//                         <span className="flex items-center gap-2">
//                           <Users className="h-3 w-3" />
//                           {report.childName} • 
//                           <Calendar className="h-3 w-3" />
//                           {format(parseISO(report.created_at), 'MMM dd, yyyy HH:mm')}
//                         </span>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <div className="text-right text-sm">
//                         <div className="font-medium">{report.predicted_class}</div>
//                         <div className="text-muted-foreground">
//                           {(report.confidence * 100).toFixed(1)}% confidence
//                         </div>
//                       </div>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => handleViewResult(report)}
//                         title="View detailed results"
//                       >
//                         <Eye className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </ScrollArea>
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



export function AssessmentsTab() {
  const [allReports, setAllReports] = useState<{ child: Child; reports: GazeResult[] }[]>([]);
  const [selectedResult, setSelectedResult] = useState<GazeResult & { childName?: string } | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [riskStats, setRiskStats] = useState({
    safe: 0,        // ✅ added safe
    low: 0,
    moderate: 0,
    high: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssessmentData();
  }, []);

  const fetchAssessmentData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [systemReports, safeRisk, lowRisk, moderateRisk, highRisk] = await Promise.allSettled([
        adminApi.getAllSystemReports(),
        adminApi.getSafeRiskCount(),   // ✅ new API for safe
        adminApi.getLowRiskCount(),
        adminApi.getModerateRiskCount(),
        adminApi.getHighRiskCount()
      ]);

      if (systemReports.status === 'fulfilled') {
        setAllReports(systemReports.value);
      }

      setRiskStats({
        safe: safeRisk.status === 'fulfilled' ? safeRisk.value.count : 0,
        low: lowRisk.status === 'fulfilled' ? lowRisk.value.count : 0,
        moderate: moderateRisk.status === 'fulfilled' ? moderateRisk.value.count : 0,
        high: highRisk.status === 'fulfilled' ? highRisk.value.count : 0
      });

    } catch (error) {
      console.error('Failed to fetch assessment data:', error);
      setError('Failed to load assessment data');
      toast({
        title: "Error",
        description: "Failed to load assessment data. Please try again.",
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
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading assessment data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button variant="outline" onClick={fetchAssessmentData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // ✅ total includes safe now
  const totalAssessments = riskStats.safe + riskStats.low + riskStats.moderate + riskStats.high;
  const childrenWithAssessments = allReports.filter(({ reports }) => reports.length > 0);
  const totalChildren = allReports.length;

  // Flatten reports
  const allIndividualReports: (GazeResult & { childName: string })[] = [];
  allReports.forEach(({ child, reports }) => {
    reports.forEach(report => {
      allIndividualReports.push({
        ...report,
        childName: child.name
      });
    });
  });

  allIndividualReports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Assessment Analytics</h3>
        <Button variant="outline" onClick={fetchAssessmentData} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalAssessments}</div>
            <p className="text-xs text-muted-foreground">
              Across {totalChildren} children
            </p>
          </CardContent>
        </Card>

        {/* ✅ Safe Risk card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Safe</CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{riskStats.safe}</div>
            <p className="text-xs text-muted-foreground">
              {totalAssessments > 0 ? `${((riskStats.safe / totalAssessments) * 100).toFixed(1)}%` : '0%'} of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Risk</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{riskStats.low}</div>
            <p className="text-xs text-muted-foreground">
              {totalAssessments > 0 ? `${((riskStats.low / totalAssessments) * 100).toFixed(1)}%` : '0%'} of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moderate Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{riskStats.moderate}</div>
            <p className="text-xs text-muted-foreground">
              {totalAssessments > 0 ? `${((riskStats.moderate / totalAssessments) * 100).toFixed(1)}%` : '0%'} of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{riskStats.high}</div>
            <p className="text-xs text-muted-foreground">
              {totalAssessments > 0 ? `${((riskStats.high / totalAssessments) * 100).toFixed(1)}%` : '0%'} of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Children Assessment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Children Assessment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No children with assessments found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allReports.map(({ child, reports }) => (
                <div key={child.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{child.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Child ID: #{child.id} • DOB: {format(new Date(child.dob), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{reports.length}</div>
                      <div className="text-xs text-muted-foreground">Assessments</div>
                    </div>
                  </div>
                  
                  {reports.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mt-3">
                      {/* ✅ Safe */}
                      <div className="text-center p-2 bg-emerald-50 rounded">
                        <div className="text-sm font-medium text-emerald-800">
                          {reports.filter(r => r.risk_level.toLowerCase() === 'safe').length}
                        </div>
                        <div className="text-xs text-emerald-600">Safe</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-sm font-medium text-green-800">
                          {reports.filter(r => r.risk_level.toLowerCase() === 'low').length}
                        </div>
                        <div className="text-xs text-green-600">Low Risk</div>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 rounded">
                        <div className="text-sm font-medium text-yellow-800">
                          {reports.filter(r => r.risk_level.toLowerCase() === 'moderate').length}
                        </div>
                        <div className="text-xs text-yellow-600">Moderate</div>
                      </div>
                      <div className="text-center p-2 bg-red-50 rounded">
                        <div className="text-sm font-medium text-red-800">
                          {reports.filter(r => r.risk_level.toLowerCase() === 'high').length}
                        </div>
                        <div className="text-xs text-red-600">High Risk</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Assessment Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Assessment Reports ({allIndividualReports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allIndividualReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No assessment reports found</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {allIndividualReports.map((report) => (
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
                          {report.risk_level} {report.risk_level.toLowerCase() !== 'safe' && 'Risk'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          {report.childName} • 
                          <Calendar className="h-3 w-3" />
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
            </ScrollArea>
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
