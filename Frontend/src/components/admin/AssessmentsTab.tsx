// import { useState, useEffect } from "react";
// import { DashboardLayout } from "@/components/layout/dashboard-layout";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { LoadingSpinner } from "@/components/ui/loading-spinner";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { useToast } from "@/hooks/use-toast";
// import { adminApi, type GazeResult, type Child } from "@/services/adminApi";
// import { AssessmentResultModal } from "./AssessmentResultModal";
// import { 
//   BarChart3, 
//   RefreshCw, 
//   AlertTriangle, 
//   Users, 
//   TrendingUp, 
//   Calendar,
//   Brain,
//   FileText,
//   Eye
// } from "lucide-react";
// import { format, parseISO } from "date-fns";

// export function AssessmentsTab() {
//   const [allReports, setAllReports] = useState<{ child: Child; reports: GazeResult[] }[]>([]);
//   const [selectedResult, setSelectedResult] = useState<GazeResult & { childName?: string } | null>(null);
//   const [showResultModal, setShowResultModal] = useState(false);
//   const [riskStats, setRiskStats] = useState({
//     safe: 0,        // ✅ added safe
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
//       const [systemReports, safeRisk, lowRisk, moderateRisk, highRisk] = await Promise.allSettled([
//         adminApi.getAllSystemReports(),
//         adminApi.getSafeRiskCount(),   // ✅ new API for safe
//         adminApi.getLowRiskCount(),
//         adminApi.getModerateRiskCount(),
//         adminApi.getHighRiskCount()
//       ]);

//       if (systemReports.status === 'fulfilled') {
//         setAllReports(systemReports.value);
//       }

//       setRiskStats({
//         safe: safeRisk.status === 'fulfilled' ? safeRisk.value.count : 0,
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

//   // ✅ total includes safe now
//   const totalAssessments = riskStats.safe + riskStats.low + riskStats.moderate + riskStats.high;
//   const childrenWithAssessments = allReports.filter(({ reports }) => reports.length > 0);
//   const totalChildren = allReports.length;

//   // Flatten reports
//   const allIndividualReports: (GazeResult & { childName: string })[] = [];
//   allReports.forEach(({ child, reports }) => {
//     reports.forEach(report => {
//       allIndividualReports.push({
//         ...report,
//         childName: child.name
//       });
//     });
//   });

//   allIndividualReports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <h3 className="text-lg font-semibold">Assessment Analytics</h3>
//           <Button variant="outline" onClick={fetchAssessmentData} size="sm">
//             <RefreshCw className="h-4 w-4 mr-2" />
//             Refresh
//           </Button>
//         </div>

//         {/* Statistics Cards */}
//         <div className="grid gap-4 md:grid-cols-5">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
//               <BarChart3 className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold text-blue-600">{totalAssessments}</div>
//               <p className="text-xs text-muted-foreground">
//                 Across {totalChildren} children
//               </p>
//             </CardContent>
//           </Card>

//           {/* ✅ Safe Risk card */}
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Safe</CardTitle>
//               <Users className="h-4 w-4 text-emerald-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold text-emerald-600">{riskStats.safe}</div>
//               <p className="text-xs text-muted-foreground">
//                 {totalAssessments > 0 ? `${((riskStats.safe / totalAssessments) * 100).toFixed(1)}%` : '0%'} of total
//               </p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Low Risk</CardTitle>
//               <TrendingUp className="h-4 w-4 text-green-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold text-green-600">{riskStats.low}</div>
//               <p className="text-xs text-muted-foreground">
//                 {totalAssessments > 0 ? `${((riskStats.low / totalAssessments) * 100).toFixed(1)}%` : '0%'} of total
//               </p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Moderate Risk</CardTitle>
//               <AlertTriangle className="h-4 w-4 text-yellow-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold text-yellow-600">{riskStats.moderate}</div>
//               <p className="text-xs text-muted-foreground">
//                 {totalAssessments > 0 ? `${((riskStats.moderate / totalAssessments) * 100).toFixed(1)}%` : '0%'} of total
//               </p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">High Risk</CardTitle>
//               <AlertTriangle className="h-4 w-4 text-red-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold text-red-600">{riskStats.high}</div>
//               <p className="text-xs text-muted-foreground">
//                 {totalAssessments > 0 ? `${((riskStats.high / totalAssessments) * 100).toFixed(1)}%` : '0%'} of total
//               </p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Children Assessment Summary */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Users className="h-5 w-5" />
//               Children Assessment Summary
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             {allReports.length === 0 ? (
//               <div className="text-center py-8 text-muted-foreground">
//                 <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
//                 <p>No children with assessments found</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {allReports.map(({ child, reports }) => (
//                   <div key={child.id} className="border rounded-lg p-4">
//                     <div className="flex items-center justify-between mb-3">
//                       <div>
//                         <h4 className="font-medium">{child.name}</h4>
//                         <p className="text-sm text-muted-foreground">
//                           Child ID: #{child.id} • DOB: {format(new Date(child.dob), 'MMM dd, yyyy')}
//                         </p>
//                       </div>
//                       <div className="text-right">
//                         <div className="text-lg font-bold">{reports.length}</div>
//                         <div className="text-xs text-muted-foreground">Assessments</div>
//                       </div>
//                     </div>
                    
//                     {reports.length > 0 && (
//                       <div className="grid grid-cols-4 gap-3 mt-3">
//                         {/* ✅ Safe */}
//                         <div className="text-center p-2 bg-emerald-50 rounded">
//                           <div className="text-sm font-medium text-emerald-800">
//                             {reports.filter(r => r.risk_level.toLowerCase() === 'safe').length}
//                           </div>
//                           <div className="text-xs text-emerald-600">Safe</div>
//                         </div>
//                         <div className="text-center p-2 bg-green-50 rounded">
//                           <div className="text-sm font-medium text-green-800">
//                             {reports.filter(r => r.risk_level.toLowerCase() === 'low').length}
//                           </div>
//                           <div className="text-xs text-green-600">Low Risk</div>
//                         </div>
//                         <div className="text-center p-2 bg-yellow-50 rounded">
//                           <div className="text-sm font-medium text-yellow-800">
//                             {reports.filter(r => r.risk_level.toLowerCase() === 'moderate').length}
//                           </div>
//                           <div className="text-xs text-yellow-600">Moderate</div>
//                         </div>
//                         <div className="text-center p-2 bg-red-50 rounded">
//                           <div className="text-sm font-medium text-red-800">
//                             {reports.filter(r => r.risk_level.toLowerCase() === 'high').length}
//                           </div>
//                           <div className="text-xs text-red-600">High Risk</div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* All Assessment Reports */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <FileText className="h-5 w-5" />
//               All Assessment Reports ({allIndividualReports.length})
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             {allIndividualReports.length === 0 ? (
//               <div className="text-center py-8 text-muted-foreground">
//                 <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
//                 <p>No assessment reports found</p>
//               </div>
//             ) : (
//               <ScrollArea className="h-96">
//                 <div className="space-y-3">
//                   {allIndividualReports.map((report) => (
//                     <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-3">
//                           <div className="font-medium">Report #{report.id}</div>
//                           <Badge 
//                             variant={
//                               report.risk_level.toLowerCase() === 'safe' ? 'outline' :
//                               report.risk_level.toLowerCase() === 'low' ? 'default' :
//                               report.risk_level.toLowerCase() === 'moderate' ? 'secondary' : 'destructive'
//                             }
//                           >
//                             {report.risk_level} {report.risk_level.toLowerCase() !== 'safe' && 'Risk'}
//                           </Badge>
//                         </div>
//                         <div className="text-sm text-muted-foreground mt-1">
//                           <span className="flex items-center gap-2">
//                             <Users className="h-3 w-3" />
//                             {report.childName} • 
//                             <Calendar className="h-3 w-3" />
//                             {format(parseISO(report.created_at), 'MMM dd, yyyy HH:mm')}
//                           </span>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-3">
//                         <div className="text-right text-sm">
//                           <div className="font-medium">{report.predicted_class}</div>
//                           <div className="text-muted-foreground">
//                             {(report.confidence * 100).toFixed(1)}% confidence
//                           </div>
//                         </div>
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => handleViewResult(report)}
//                           title="View detailed results"
//                         >
//                           <Eye className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </ScrollArea>
//             )}
//           </CardContent>
//         </Card>

//         {/* Assessment Result Modal */}
//         <AssessmentResultModal
//           result={selectedResult}
//           isOpen={showResultModal}
//           onClose={() => {
//             setShowResultModal(false);
//             setSelectedResult(null);
//           }}
//         />
//       </div>
//     </DashboardLayout>
//   );

// }


























// import { useState, useEffect } from "react";
// import { DashboardLayout } from "@/components/layout/dashboard-layout";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { LoadingSpinner } from "@/components/ui/loading-spinner";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { useToast } from "@/hooks/use-toast";
// import { adminApi, type GazeResult, type Child } from "@/services/adminApi";
// import { AssessmentResultModal } from "./AssessmentResultModal";
// import { 
//   BarChart3, 
//   RefreshCw, 
//   AlertTriangle, 
//   Users, 
//   TrendingUp, 
//   Calendar,
//   FileText,
//   Eye
// } from "lucide-react";
// import { format, parseISO } from "date-fns";

// export function AssessmentsTab() {
//   const [allReports, setAllReports] = useState<{ child: Child; reports: GazeResult[] }[]>([]);
//   const [selectedResult, setSelectedResult] = useState<GazeResult & { childName?: string } | null>(null);
//   const [showResultModal, setShowResultModal] = useState(false);
//   const [riskStats, setRiskStats] = useState({
//     safe: 0,
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
//       const [systemReports, safeRisk, lowRisk, moderateRisk, highRisk] = await Promise.allSettled([
//         adminApi.getAllSystemReports(),
//         adminApi.getSafeRiskCount(),
//         adminApi.getLowRiskCount(),
//         adminApi.getModerateRiskCount(),
//         adminApi.getHighRiskCount()
//       ]);

//       if (systemReports.status === 'fulfilled') {
//         setAllReports(systemReports.value);
//       }

//       setRiskStats({
//         safe: safeRisk.status === 'fulfilled' ? safeRisk.value.count : 0,
//         low: lowRisk.status === 'fulfilled' ? lowRisk.value.count : 0,
//         moderate: moderateRisk.status === 'fulfilled' ? moderateRisk.value.count : 0,
//         high: highRisk.status === 'fulfilled' ? highRisk.value.count : 0
//       });

//     } catch (err) {
//       console.error('Failed to fetch assessment data:', err);
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

//   // total includes safe now
//   const totalAssessments = riskStats.safe + riskStats.low + riskStats.moderate + riskStats.high;
//   const childrenWithAssessments = allReports.filter(({ reports }) => reports.length > 0);
//   const totalChildren = allReports.length;

//   // Flatten reports
//   const allIndividualReports: (GazeResult & { childName: string })[] = [];
//   allReports.forEach(({ child, reports }) => {
//     reports.forEach(report => {
//       allIndividualReports.push({
//         ...report,
//         childName: child.name
//       });
//     });
//   });

//   allIndividualReports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <h3 className="text-lg font-semibold">Assessment Analytics</h3>
//           <Button variant="outline" onClick={fetchAssessmentData} size="sm" disabled={isLoading}>
//             <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
//             Refresh
//           </Button>
//         </div>

//         {/* Main content area: show loading / error inline like StimuliLibrary */}
//         {isLoading ? (
//           <div className="flex items-center justify-center py-12">
//             <LoadingSpinner size="lg" text="Loading assessment data..." />
//           </div>
//         ) : error ? (
//           <div className="text-center py-12">
//             <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
//             <p className="text-red-600 mb-4">{error}</p>
//             <Button variant="outline" onClick={fetchAssessmentData}>
//               <RefreshCw className="h-4 w-4 mr-2" />
//               Try Again
//             </Button>
//           </div>
//         ) : (
//           <>
//             {/* Statistics Cards */}
//             <div className="grid gap-4 md:grid-cols-5">
//               <Card>
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
//                   <BarChart3 className="h-4 w-4 text-muted-foreground" />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-3xl font-bold text-blue-600">{totalAssessments}</div>
//                   <p className="text-xs text-muted-foreground">
//                     Across {totalChildren} children
//                   </p>
//                 </CardContent>
//               </Card>

//               {/* Safe Risk card */}
//               <Card>
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-sm font-medium">Safe</CardTitle>
//                   <Users className="h-4 w-4 text-emerald-600" />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-3xl font-bold text-emerald-600">{riskStats.safe}</div>
//                   <p className="text-xs text-muted-foreground">
//                     {totalAssessments > 0 ? `${((riskStats.safe / totalAssessments) * 100).toFixed(1)}%` : '0%'} of total
//                   </p>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-sm font-medium">Low Risk</CardTitle>
//                   <TrendingUp className="h-4 w-4 text-green-600" />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-3xl font-bold text-green-600">{riskStats.low}</div>
//                   <p className="text-xs text-muted-foreground">
//                     {totalAssessments > 0 ? `${((riskStats.low / totalAssessments) * 100).toFixed(1)}%` : '0%'} of total
//                   </p>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-sm font-medium">Moderate Risk</CardTitle>
//                   <AlertTriangle className="h-4 w-4 text-yellow-600" />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-3xl font-bold text-yellow-600">{riskStats.moderate}</div>
//                   <p className="text-xs text-muted-foreground">
//                     {totalAssessments > 0 ? `${((riskStats.moderate / totalAssessments) * 100).toFixed(1)}%` : '0%'} of total
//                   </p>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-sm font-medium">High Risk</CardTitle>
//                   <AlertTriangle className="h-4 w-4 text-red-600" />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-3xl font-bold text-red-600">{riskStats.high}</div>
//                   <p className="text-xs text-muted-foreground">
//                     {totalAssessments > 0 ? `${((riskStats.high / totalAssessments) * 100).toFixed(1)}%` : '0%'} of total
//                   </p>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Children Assessment Summary */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Users className="h-5 w-5" />
//                   Children Assessment Summary
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {allReports.length === 0 ? (
//                   <div className="text-center py-8 text-muted-foreground">
//                     <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
//                     <p>No children with assessments found</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {allReports.map(({ child, reports }) => (
//                       <div key={child.id} className="border rounded-lg p-4">
//                         <div className="flex items-center justify-between mb-3">
//                           <div>
//                             <h4 className="font-medium">{child.name}</h4>
//                             <p className="text-sm text-muted-foreground">
//                               Child ID: #{child.id} • DOB: {format(new Date(child.dob), 'MMM dd, yyyy')}
//                             </p>
//                           </div>
//                           <div className="text-right">
//                             <div className="text-lg font-bold">{reports.length}</div>
//                             <div className="text-xs text-muted-foreground">Assessments</div>
//                           </div>
//                         </div>
                        
//                         {reports.length > 0 && (
//                           <div className="grid grid-cols-4 gap-3 mt-3">
//                             {/* Safe */}
//                             <div className="text-center p-2 bg-emerald-50 rounded">
//                               <div className="text-sm font-medium text-emerald-800">
//                                 {reports.filter(r => r.risk_level.toLowerCase() === 'safe').length}
//                               </div>
//                               <div className="text-xs text-emerald-600">Safe</div>
//                             </div>
//                             <div className="text-center p-2 bg-green-50 rounded">
//                               <div className="text-sm font-medium text-green-800">
//                                 {reports.filter(r => r.risk_level.toLowerCase() === 'low').length}
//                               </div>
//                               <div className="text-xs text-green-600">Low Risk</div>
//                             </div>
//                             <div className="text-center p-2 bg-yellow-50 rounded">
//                               <div className="text-sm font-medium text-yellow-800">
//                                 {reports.filter(r => r.risk_level.toLowerCase() === 'moderate').length}
//                               </div>
//                               <div className="text-xs text-yellow-600">Moderate</div>
//                             </div>
//                             <div className="text-center p-2 bg-red-50 rounded">
//                               <div className="text-sm font-medium text-red-800">
//                                 {reports.filter(r => r.risk_level.toLowerCase() === 'high').length}
//                               </div>
//                               <div className="text-xs text-red-600">High Risk</div>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             {/* All Assessment Reports */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <FileText className="h-5 w-5" />
//                   All Assessment Reports ({allIndividualReports.length})
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {allIndividualReports.length === 0 ? (
//                   <div className="text-center py-8 text-muted-foreground">
//                     <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
//                     <p>No assessment reports found</p>
//                   </div>
//                 ) : (
//                   <ScrollArea className="h-96">
//                     <div className="space-y-3">
//                       {allIndividualReports.map((report) => (
//                         <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
//                           <div className="flex-1">
//                             <div className="flex items-center gap-3">
//                               <div className="font-medium">Report #{report.id}</div>
//                               <Badge 
//                                 variant={
//                                   report.risk_level.toLowerCase() === 'safe' ? 'outline' :
//                                   report.risk_level.toLowerCase() === 'low' ? 'default' :
//                                   report.risk_level.toLowerCase() === 'moderate' ? 'secondary' : 'destructive'
//                                 }
//                               >
//                                 {report.risk_level} {report.risk_level.toLowerCase() !== 'safe' && 'Risk'}
//                               </Badge>
//                             </div>
//                             <div className="text-sm text-muted-foreground mt-1">
//                               <span className="flex items-center gap-2">
//                                 <Users className="h-3 w-3" />
//                                 {report.childName} • 
//                                 <Calendar className="h-3 w-3" />
//                                 {format(parseISO(report.created_at), 'MMM dd, yyyy HH:mm')}
//                               </span>
//                             </div>
//                           </div>
//                           <div className="flex items-center gap-3">
//                             <div className="text-right text-sm">
//                               <div className="font-medium">{report.predicted_class}</div>
//                               <div className="text-muted-foreground">
//                                 {(report.confidence * 100).toFixed(1)}% confidence
//                               </div>
//                             </div>
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={() => handleViewResult(report)}
//                               title="View detailed results"
//                             >
//                               <Eye className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </ScrollArea>
//                 )}
//               </CardContent>
//             </Card>
//           </>
//         )}

//         {/* Assessment Result Modal */}
//         <AssessmentResultModal
//           result={selectedResult}
//           isOpen={showResultModal}
//           onClose={() => {
//             setShowResultModal(false);
//             setSelectedResult(null);
//           }}
//         />
//       </div>
//     </DashboardLayout>
//   );
// }









import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { adminApi, type GazeResult, type Child } from "@/services/adminApi";
import { AssessmentResultModal } from "./AssessmentResultModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  RefreshCw, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Calendar,
  FileText,
  Eye,
  ShieldCheck,
  SignalLow,
  SignalMedium,
  SignalHigh,
  FilePieChart,
  Baby,
} from "lucide-react";
import { format, parseISO } from "date-fns";

// Helper to get styling based on risk level
const getRiskLevelDetails = (riskLevel: string) => {
  const level = riskLevel.toLowerCase();
  switch (level) {
    case 'safe':
      return { color: 'text-emerald-500', bgColor: 'bg-emerald-500', icon: <ShieldCheck className="h-4 w-4" /> };
    case 'low':
      return { color: 'text-sky-500', bgColor: 'bg-sky-500', icon: <SignalLow className="h-4 w-4" /> };
    case 'moderate':
      return { color: 'text-amber-500', bgColor: 'bg-amber-500', icon: <SignalMedium className="h-4 w-4" /> };
    case 'high':
      return { color: 'text-red-500', bgColor: 'bg-red-500', icon: <SignalHigh className="h-4 w-4" /> };
    default:
      return { color: 'text-gray-500', bgColor: 'bg-gray-500', icon: <AlertTriangle className="h-4 w-4" /> };
  }
};

export function AssessmentsTab() {
  const [allReports, setAllReports] = useState<{ child: Child; reports: GazeResult[] }[]>([]);
  const [selectedResult, setSelectedResult] = useState<GazeResult & { childName?: string } | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [riskStats, setRiskStats] = useState({ safe: 0, low: 0, moderate: 0, high: 0 });
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
      const [systemReports, safe, low, moderate, high] = await Promise.all([
        adminApi.getAllSystemReports(),
        adminApi.getSafeRiskCount(),
        adminApi.getLowRiskCount(),
        adminApi.getModerateRiskCount(),
        adminApi.getHighRiskCount()
      ]);
      setAllReports(systemReports);
      setRiskStats({
        safe: safe.count,
        low: low.count,
        moderate: moderate.count,
        high: high.count,
      });
    } catch (err) {
      console.error('Failed to fetch assessment data:', err);
      setError('An error occurred while fetching assessment data.');
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

  const totalAssessments = riskStats.safe + riskStats.low + riskStats.moderate + riskStats.high;
  
  const allIndividualReports = allReports
    .flatMap(({ child, reports }) => 
      reports.map(report => ({ ...report, childName: child.name }))
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex items-center justify-center py-24"><LoadingSpinner size="lg" text="Loading assessment data..." /></div>;
    }

    if (error) {
      return (
        <Card className="text-center py-16 bg-red-50 border-red-200">
            <CardContent>
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-xl font-semibold text-red-800">Failed to Load Data</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <Button variant="destructive" onClick={fetchAssessmentData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
                </Button>
            </CardContent>
        </Card>
      );
    }

    return (
      <>
        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FilePieChart className="h-5 w-5"/> Risk Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">{totalAssessments}</div>
                    <p className="text-xs text-muted-foreground mb-4">Total Assessments Conducted</p>
                    <div className="flex w-full h-3 rounded-full overflow-hidden bg-muted">
                        {Object.entries(riskStats).map(([key, value]) => (
                            value > 0 && <div key={key} className={getRiskLevelDetails(key).bgColor} style={{ width: `${(value / totalAssessments) * 100}%` }}></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                        {Object.entries(riskStats).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2 text-sm">
                                <span className={`h-2 w-2 rounded-full ${getRiskLevelDetails(key).bgColor}`}></span>
                                <span className="font-semibold capitalize">{key}</span>
                                <span className="text-muted-foreground">{value}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/> Children Assessed</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">{allReports.length}</div>
                    <p className="text-xs text-muted-foreground mb-4">Total children with one or more assessments.</p>
                    <div className="flex items-center gap-2 text-sm text-emerald-600">
                        <TrendingUp className="h-4 w-4" />
                        <span>Analysis across all participants</span>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Assessment Reports Tabs */}
        <Tabs defaultValue="recent">
          <TabsList>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            <TabsTrigger value="child_summary">Child Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent">
            <Card>
                <CardHeader>
                    <CardTitle>All Assessment Reports</CardTitle>
                    <CardDescription>A chronological log of all assessments conducted system-wide.</CardDescription>
                </CardHeader>
                <CardContent>
                {allIndividualReports.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold">No Reports Found</h3>
                        <p className="text-sm">When an assessment is completed, it will appear here.</p>
                    </div>
                ) : (
                    <ScrollArea className="h-[450px]">
                    <div className="space-y-3 pr-4">
                      {allIndividualReports.map((report) => {
                        const riskDetails = getRiskLevelDetails(report.risk_level);
                        return (
                          <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${riskDetails.bgColor}/10 ${riskDetails.color}`}>
                                    {riskDetails.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">
                                        {report.childName} - <span className="font-normal text-muted-foreground">Report #{report.id}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                                        <Calendar className="h-3 w-3" />
                                        {format(parseISO(report.created_at), 'MMM dd, yyyy, HH:mm')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <Badge variant={report.risk_level.toLowerCase() === 'high' ? 'destructive' : 'secondary'} className="capitalize">{report.risk_level} Risk</Badge>
                               <Button variant="ghost" size="icon" onClick={() => handleViewResult(report)}><Eye className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    </ScrollArea>
                )}
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="child_summary">
              <Card>
                <CardHeader>
                    <CardTitle>Summary by Child</CardTitle>
                    <CardDescription>An overview of assessment history for each child.</CardDescription>
                </CardHeader>
                <CardContent>
                {allReports.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold">No Children Found</h3>
                        <p className="text-sm">Assessment data will be grouped by child here.</p>
                    </div>
                ) : (
                    <Accordion type="single" collapsible className="w-full">
                        {allReports.map(({ child, reports }) => (
                           <AccordionItem value={child.id} key={child.id}>
                                <AccordionTrigger>
                                    <div className="flex items-center gap-3 w-full pr-4">
                                        <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground text-xs font-bold">
                                            {child.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold">{child.name}</p>
                                            <p className="text-xs text-muted-foreground font-normal">{reports.length} assessment(s)</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    {reports.length > 0 ? (
                                        <div className="space-y-2 pl-4">
                                            {reports.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(report => {
                                                const riskDetails = getRiskLevelDetails(report.risk_level);
                                                return(
                                                    <div key={report.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`${riskDetails.color}`}>{riskDetails.icon}</div>
                                                            <div>
                                                                <p className="text-sm font-medium capitalize">{report.risk_level} Risk</p>
                                                                <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3 w-3" />{format(parseISO(report.created_at), 'MMM dd, yyyy')}</p>
                                                            </div>
                                                        </div>
                                                        <Button variant="outline" size="sm" onClick={() => handleViewResult({...report, childName: child.name})}>View Details</Button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : <p className="text-sm text-muted-foreground text-center py-4">No assessments found for this child.</p>}
                                </AccordionContent>
                           </AccordionItem>
                        ))}
                    </Accordion>
                )}
                </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Assessment Analytics</h2>
            <p className="text-muted-foreground">
              Review system-wide risk levels and individual assessment results.
            </p>
          </div>
          <Button variant="outline" onClick={fetchAssessmentData} size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {renderContent()}

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
    </DashboardLayout>
  );
}
