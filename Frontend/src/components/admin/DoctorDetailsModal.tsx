// import { useState, useEffect } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { LoadingSpinner } from "@/components/ui/loading-spinner";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { useToast } from "@/hooks/use-toast";
// import { adminApi, type Doctor, type Report, type Child } from "@/services/adminApi";
// import { 
//   User, 
//   Mail, 
//   Briefcase, 
//   Calendar, 
//   Activity, 
//   Users, 
//   FileText,
//   TrendingUp,
//   Clock,
//   Shield,
//   AlertTriangle,
//   CheckCircle,
//   RefreshCw
// } from "lucide-react";
// import { format, parseISO } from "date-fns";

// interface DoctorDetailsModalProps {
//   doctor: Doctor | null;
//   isOpen: boolean;
//   onClose: () => void;
// }

// interface DoctorStats {
//   totalPatients: number;
//   totalAssessments: number;
//   recentAssessments: (Report & { childName?: string })[];
//   riskDistribution: {
//     low: number;
//     moderate: number;
//     high: number;
//   };
// }

// export function DoctorDetailsModal({ doctor, isOpen, onClose }: DoctorDetailsModalProps) {
//   const [doctorStats, setDoctorStats] = useState<DoctorStats>({
//     totalPatients: 0,
//     totalAssessments: 0,
//     recentAssessments: [],
//     riskDistribution: { low: 0, moderate: 0, high: 0 }
//   });
//   const [allPatients, setAllPatients] = useState<Child[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const { toast } = useToast();

//   useEffect(() => {
//     if (doctor && isOpen) {
//       fetchDoctorData();
//     }
//   }, [doctor, isOpen]);

//   const fetchDoctorData = async () => {
//     if (!doctor) return;

//     setIsLoading(true);
//     setError(null);

//     try {
//       // Get all children and their reports to analyze doctor's work
//       const [childrenData, systemReports] = await Promise.allSettled([
//         adminApi.getAllChildren(),
//         adminApi.getAllSystemReports()
//       ]);

//       if (childrenData.status === 'fulfilled') {
//         setAllPatients(childrenData.value.children);
//       }

//       // For now, we'll simulate doctor-specific data since we don't have doctor-patient assignments in the API
//       // In a real system, you'd have endpoints like /doctor/{id}/patients, /doctor/{id}/assessments
//       if (systemReports.status === 'fulfilled') {
//         const allReports = systemReports.value;
        
//         // Simulate some reports being associated with this doctor
//         const doctorReports: (Report & { childName?: string })[] = [];
//         let totalAssessments = 0;
//         let riskStats = { low: 0, moderate: 0, high: 0 };

//         // Take a subset of reports as if they belong to this doctor
//         const doctorReportCount = Math.min(allReports.length, Math.floor(Math.random() * 10) + 5);
        
//         for (let i = 0; i < doctorReportCount && i < allReports.length; i++) {
//           const { child, reports } = allReports[i];
//           reports.forEach(report => {
//             doctorReports.push({
//               ...report,
//               childName: child.name
//             });
//             totalAssessments++;
            
//             switch (report.risk_level.toLowerCase()) {
//               case 'low': riskStats.low++; break;
//               case 'moderate': riskStats.moderate++; break;
//               case 'high': riskStats.high++; break;
//             }
//           });
//         }

//         // Sort by date (most recent first)
//         doctorReports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

//         setDoctorStats({
//           totalPatients: doctorReportCount,
//           totalAssessments,
//           recentAssessments: doctorReports.slice(0, 10),
//           riskDistribution: riskStats
//         });
//       }

//     } catch (error) {
//       console.error('Failed to fetch doctor data:', error);
//       setError('Failed to load doctor information');
//       toast({
//         title: "Error",
//         description: "Failed to load doctor information",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleToggleStatus = async () => {
//     if (!doctor) return;

//     try {
//       await adminApi.toggleDoctorStatus(doctor.id);
//       toast({
//         title: "Status Updated",
//         description: `Dr. ${doctor.full_name}'s status has been updated.`,
//       });
//       // Refresh the data
//       await fetchDoctorData();
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to update doctor status",
//         variant: "destructive",
//       });
//     }
//   };

//   if (!doctor) return null;

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-4xl max-h-[90vh]">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <User className="h-5 w-5" />
//             Doctor Details - {doctor.full_name}
//           </DialogTitle>
//         </DialogHeader>

//         <ScrollArea className="max-h-[80vh]">
//           <div className="space-y-6">
//             {/* Doctor Profile Card */}
//             <Card>
//               <CardHeader>
//                 <div className="flex items-center justify-between">
//                   <CardTitle className="flex items-center gap-2">
//                     <User className="h-4 w-4" />
//                     Profile Information
//                   </CardTitle>
//                   <div className="flex items-center gap-2">
//                     <Badge variant={doctor.status === 'active' ? 'default' : 'secondary'}>
//                       {doctor.status === 'active' ? (
//                         <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
//                       ) : (
//                         <><Clock className="h-3 w-3 mr-1" /> Inactive</>
//                       )}
//                     </Badge>
//                     <Button size="sm" variant="outline" onClick={handleToggleStatus}>
//                       Toggle Status
//                     </Button>
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-2 gap-6">
//                   <div className="space-y-4">
//                     <div>
//                       <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
//                         <User className="h-4 w-4" />
//                         Full Name
//                       </div>
//                       <p className="text-lg font-semibold">{doctor.full_name}</p>
//                     </div>
                    
//                     <div>
//                       <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
//                         <Mail className="h-4 w-4" />
//                         Email Address
//                       </div>
//                       <p className="text-lg">{doctor.email}</p>
//                     </div>
//                   </div>
                  
//                   <div className="space-y-4">
//                     <div>
//                       <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
//                         <Briefcase className="h-4 w-4" />
//                         Specialization
//                       </div>
//                       <p className="text-lg font-semibold">{doctor.specialization}</p>
//                     </div>
                    
//                     <div>
//                       <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
//                         <Shield className="h-4 w-4" />
//                         Doctor ID
//                       </div>
//                       <p className="text-lg">#{doctor.id}</p>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Statistics Overview */}
//             {isLoading ? (
//               <div className="flex items-center justify-center py-8">
//                 <LoadingSpinner size="md" text="Loading doctor statistics..." />
//               </div>
//             ) : error ? (
//               <div className="text-center py-8">
//                 <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
//                 <p className="text-red-600 mb-4">{error}</p>
//                 <Button variant="outline" onClick={fetchDoctorData}>
//                   <RefreshCw className="h-4 w-4 mr-2" />
//                   Retry
//                 </Button>
//               </div>
//             ) : (
//               <div className="grid gap-4 md:grid-cols-4">
//                 <Card>
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
//                     <Users className="h-4 w-4 text-muted-foreground" />
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">{doctorStats.totalPatients}</div>
//                     <p className="text-xs text-muted-foreground">
//                       Under care
//                     </p>
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <CardTitle className="text-sm font-medium">Assessments</CardTitle>
//                     <Activity className="h-4 w-4 text-muted-foreground" />
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">{doctorStats.totalAssessments}</div>
//                     <p className="text-xs text-muted-foreground">
//                       Completed
//                     </p>
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <CardTitle className="text-sm font-medium">High Risk Cases</CardTitle>
//                     <TrendingUp className="h-4 w-4 text-red-600" />
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold text-red-600">{doctorStats.riskDistribution.high}</div>
//                     <p className="text-xs text-muted-foreground">
//                       Require attention
//                     </p>
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
//                     <CheckCircle className="h-4 w-4 text-green-600" />
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold text-green-600">
//                       {doctorStats.totalAssessments > 0 
//                         ? `${Math.round(((doctorStats.riskDistribution.low + doctorStats.riskDistribution.moderate) / doctorStats.totalAssessments) * 100)}%`
//                         : '0%'
//                       }
//                     </div>
//                     <p className="text-xs text-muted-foreground">
//                       Low-moderate risk
//                     </p>
//                   </CardContent>
//                 </Card>
//               </div>
//             )}

//             {/* Detailed Tabs */}
//             <Tabs defaultValue="assessments" className="w-full">
//               <TabsList className="grid w-full grid-cols-3">
//                 <TabsTrigger value="assessments">Recent Assessments</TabsTrigger>
//                 <TabsTrigger value="patients">Patient Overview</TabsTrigger>
//                 <TabsTrigger value="analytics">Analytics</TabsTrigger>
//               </TabsList>

//               <TabsContent value="assessments" className="space-y-4">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                       <FileText className="h-4 w-4" />
//                       Recent Assessment Activity
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     {doctorStats.recentAssessments.length === 0 ? (
//                       <div className="text-center py-8 text-muted-foreground">
//                         <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
//                         <p>No recent assessments found</p>
//                       </div>
//                     ) : (
//                       <ScrollArea className="h-64">
//                         <div className="space-y-3">
//                           {doctorStats.recentAssessments.map((assessment) => (
//                             <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-lg">
//                               <div className="flex-1">
//                                 <div className="flex items-center gap-3">
//                                   <div className="font-medium">Assessment #{assessment.id}</div>
//                                   <Badge 
//                                     variant={
//                                       assessment.risk_level.toLowerCase() === 'low' ? 'default' :
//                                       assessment.risk_level.toLowerCase() === 'moderate' ? 'secondary' : 'destructive'
//                                     }
//                                   >
//                                     {assessment.risk_level} Risk
//                                   </Badge>
//                                 </div>
//                                 <div className="text-sm text-muted-foreground mt-1">
//                                   <span className="flex items-center gap-2">
//                                     <Users className="h-3 w-3" />
//                                     {assessment.childName || `Patient #${assessment.child_id}`} • 
//                                     <Calendar className="h-3 w-3" />
//                                     {format(parseISO(assessment.created_at), 'MMM dd, yyyy HH:mm')}
//                                   </span>
//                                 </div>
//                               </div>
//                               <div className="text-right text-sm">
//                                 <div className="font-medium">{assessment.predicted_class}</div>
//                                 <div className="text-muted-foreground">
//                                   {(assessment.confidence * 100).toFixed(1)}% confidence
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </ScrollArea>
//                     )}
//                   </CardContent>
//                 </Card>
//               </TabsContent>

//               <TabsContent value="patients" className="space-y-4">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                       <Users className="h-4 w-4" />
//                       Patient Overview
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-center py-8 text-muted-foreground">
//                       <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
//                       <p>Patient assignment data would be shown here</p>
//                       <p className="text-sm">In a full system, this would show patients assigned to Dr. {doctor.full_name}</p>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </TabsContent>

//               <TabsContent value="analytics" className="space-y-4">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                       <TrendingUp className="h-4 w-4" />
//                       Risk Distribution Analytics
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="grid grid-cols-3 gap-4">
//                       <div className="text-center p-4 border rounded-lg">
//                         <div className="text-2xl font-bold text-green-600">{doctorStats.riskDistribution.low}</div>
//                         <div className="text-sm text-muted-foreground">Low Risk</div>
//                         <div className="text-xs text-muted-foreground mt-1">
//                           {doctorStats.totalAssessments > 0 
//                             ? `${((doctorStats.riskDistribution.low / doctorStats.totalAssessments) * 100).toFixed(1)}%`
//                             : '0%'
//                           }
//                         </div>
//                       </div>
//                       <div className="text-center p-4 border rounded-lg">
//                         <div className="text-2xl font-bold text-yellow-600">{doctorStats.riskDistribution.moderate}</div>
//                         <div className="text-sm text-muted-foreground">Moderate Risk</div>
//                         <div className="text-xs text-muted-foreground mt-1">
//                           {doctorStats.totalAssessments > 0 
//                             ? `${((doctorStats.riskDistribution.moderate / doctorStats.totalAssessments) * 100).toFixed(1)}%`
//                             : '0%'
//                           }
//                         </div>
//                       </div>
//                       <div className="text-center p-4 border rounded-lg">
//                         <div className="text-2xl font-bold text-red-600">{doctorStats.riskDistribution.high}</div>
//                         <div className="text-sm text-muted-foreground">High Risk</div>
//                         <div className="text-xs text-muted-foreground mt-1">
//                           {doctorStats.totalAssessments > 0 
//                             ? `${((doctorStats.riskDistribution.high / doctorStats.totalAssessments) * 100).toFixed(1)}%`
//                             : '0%'
//                           }
//                         </div>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </TabsContent>
//             </Tabs>
//           </div>
//         </ScrollArea>

//         <div className="flex justify-end pt-4 border-t">
//           <Button variant="outline" onClick={onClose}>
//             Close
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }


import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { adminApi, type Doctor, type Report, type Child } from "@/services/adminApi";
import { 
  User, 
  Mail, 
  Briefcase, 
  Calendar, 
  Activity, 
  Users, 
  FileText,
  TrendingUp,
  Clock,
  Shield,
  ShieldCheck,   // ✅ added
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface DoctorDetailsModalProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
}

interface DoctorStats {
  totalPatients: number;
  totalAssessments: number;
  recentAssessments: (Report & { childName?: string })[];
  riskDistribution: {
    safe: number;     // ✅ added
    low: number;
    moderate: number;
    high: number;
  };
}

export function DoctorDetailsModal({ doctor, isOpen, onClose }: DoctorDetailsModalProps) {
  const [doctorStats, setDoctorStats] = useState<DoctorStats>({
    totalPatients: 0,
    totalAssessments: 0,
    recentAssessments: [],
    riskDistribution: { safe: 0, low: 0, moderate: 0, high: 0 } // ✅ init safe
  });
  const [allPatients, setAllPatients] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (doctor && isOpen) {
      fetchDoctorData();
    }
  }, [doctor, isOpen]);

  const fetchDoctorData = async () => {
    if (!doctor) return;

    setIsLoading(true);
    setError(null);

    try {
      const [childrenData, systemReports] = await Promise.allSettled([
        adminApi.getAllChildren(),
        adminApi.getAllSystemReports()
      ]);

      if (childrenData.status === 'fulfilled') {
        setAllPatients(childrenData.value.children);
      }

      if (systemReports.status === 'fulfilled') {
        const allReports = systemReports.value;
        
        const doctorReports: (Report & { childName?: string })[] = [];
        let totalAssessments = 0;
        let riskStats = { safe: 0, low: 0, moderate: 0, high: 0 }; // ✅ include safe

        const doctorReportCount = Math.min(allReports.length, Math.floor(Math.random() * 10) + 5);
        
        for (let i = 0; i < doctorReportCount && i < allReports.length; i++) {
          const { child, reports } = allReports[i];
          reports.forEach(report => {
            doctorReports.push({
              ...report,
              childName: child.name
            });
            totalAssessments++;
            
            switch (report.risk_level.toLowerCase()) {
              case 'safe': riskStats.safe++; break;      // ✅ count safe
              case 'low': riskStats.low++; break;
              case 'moderate': riskStats.moderate++; break;
              case 'high': riskStats.high++; break;
            }
          });
        }

        doctorReports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setDoctorStats({
          totalPatients: doctorReportCount,
          totalAssessments,
          recentAssessments: doctorReports.slice(0, 10),
          riskDistribution: riskStats
        });
      }

    } catch (error) {
      console.error('Failed to fetch doctor data:', error);
      setError('Failed to load doctor information');
      toast({
        title: "Error",
        description: "Failed to load doctor information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!doctor) return;

    try {
      await adminApi.toggleDoctorStatus(doctor.id);
      toast({
        title: "Status Updated",
        description: `Dr. ${doctor.full_name}'s status has been updated.`,
      });
      await fetchDoctorData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update doctor status",
        variant: "destructive",
      });
    }
  };

  if (!doctor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Doctor Details - {doctor.full_name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <div className="space-y-6">
            {/* Doctor Profile Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile Information
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={doctor.status === 'active' ? 'default' : 'secondary'}>
                      {doctor.status === 'active' ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
                      ) : (
                        <><Clock className="h-3 w-3 mr-1" /> Inactive</>
                      )}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={handleToggleStatus}>
                      Toggle Status
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <User className="h-4 w-4" />
                        Full Name
                      </div>
                      <p className="text-lg font-semibold">{doctor.full_name}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </div>
                      <p className="text-lg">{doctor.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        Specialization
                      </div>
                      <p className="text-lg font-semibold">{doctor.specialization}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        Doctor ID
                      </div>
                      <p className="text-lg">#{doctor.id}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Overview */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" text="Loading doctor statistics..." />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button variant="outline" onClick={fetchDoctorData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-5">{/* ✅ expanded to 5 */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{doctorStats.totalPatients}</div>
                    <p className="text-xs text-muted-foreground">
                      Under care
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Assessments</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{doctorStats.totalAssessments}</div>
                    <p className="text-xs text-muted-foreground">
                      Completed
                    </p>
                  </CardContent>
                </Card>

                {/* ✅ Safe Cases */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Safe Cases</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-emerald-600">{doctorStats.riskDistribution.safe}</div>
                    <p className="text-xs text-muted-foreground">
                      No immediate concerns
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">High Risk Cases</CardTitle>
                    <TrendingUp className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{doctorStats.riskDistribution.high}</div>
                    <p className="text-xs text-muted-foreground">
                      Require attention
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {doctorStats.totalAssessments > 0 
                        ? `${Math.round(((doctorStats.riskDistribution.safe + doctorStats.riskDistribution.low + doctorStats.riskDistribution.moderate) / doctorStats.totalAssessments) * 100)}%` // ✅ include safe
                        : '0%'
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Safe–moderate cases
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Detailed Tabs */}
            <Tabs defaultValue="assessments" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="assessments">Recent Assessments</TabsTrigger>
                <TabsTrigger value="patients">Patient Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="assessments" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Recent Assessment Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {doctorStats.recentAssessments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No recent assessments found</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-64">
                        <div className="space-y-3">
                          {doctorStats.recentAssessments.map((assessment) => (
                            <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <div className="font-medium">Assessment #{assessment.id}</div>
                                  <Badge 
                                    variant={
                                      assessment.risk_level.toLowerCase() === 'safe' ? 'outline' :     // ✅ safe
                                      assessment.risk_level.toLowerCase() === 'low' ? 'default' :
                                      assessment.risk_level.toLowerCase() === 'moderate' ? 'secondary' : 'destructive'
                                    }
                                  >
                                    {assessment.risk_level} {assessment.risk_level.toLowerCase() !== 'safe' && 'Risk'} {/* ✅ label */}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  <span className="flex items-center gap-2">
                                    <Users className="h-3 w-3" />
                                    {assessment.childName || `Patient #${assessment.child_id}`} • 
                                    <Calendar className="h-3 w-3" />
                                    {format(parseISO(assessment.created_at), 'MMM dd, yyyy HH:mm')}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right text-sm">
                                <div className="font-medium">{assessment.predicted_class}</div>
                                <div className="text-muted-foreground">
                                  {(assessment.confidence * 100).toFixed(1)}% confidence
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="patients" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Patient Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Patient assignment data would be shown here</p>
                      <p className="text-sm">In a full system, this would show patients assigned to Dr. {doctor.full_name}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Risk Distribution Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">{/* ✅ expanded to 4 */}
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600">{doctorStats.riskDistribution.safe}</div>
                        <div className="text-sm text-muted-foreground">Safe</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {doctorStats.totalAssessments > 0 
                            ? `${((doctorStats.riskDistribution.safe / doctorStats.totalAssessments) * 100).toFixed(1)}%`
                            : '0%'
                          }
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{doctorStats.riskDistribution.low}</div>
                        <div className="text-sm text-muted-foreground">Low Risk</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {doctorStats.totalAssessments > 0 
                            ? `${((doctorStats.riskDistribution.low / doctorStats.totalAssessments) * 100).toFixed(1)}%`
                            : '0%'
                          }
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{doctorStats.riskDistribution.moderate}</div>
                        <div className="text-sm text-muted-foreground">Moderate Risk</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {doctorStats.totalAssessments > 0 
                            ? `${((doctorStats.riskDistribution.moderate / doctorStats.totalAssessments) * 100).toFixed(1)}%`
                            : '0%'
                          }
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{doctorStats.riskDistribution.high}</div>
                        <div className="text-sm text-muted-foreground">High Risk</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {doctorStats.totalAssessments > 0 
                            ? `${((doctorStats.riskDistribution.high / doctorStats.totalAssessments) * 100).toFixed(1)}%`
                            : '0%'
                          }
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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
