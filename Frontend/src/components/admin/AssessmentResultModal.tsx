// import { useState } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { LoadingSpinner } from "@/components/ui/loading-spinner";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { useToast } from "@/hooks/use-toast";
// import { 
//   FileText, 
//   Image, 
//   Download, 
//   Calendar,
//   Brain,
//   Target,
//   TrendingUp,
//   AlertTriangle,
//   CheckCircle,
//   ShieldCheck,   // ✅ added
//   Users,
//   BarChart3,
//   Eye,
//   Zap,
//   Activity
// } from "lucide-react";
// import { format, parseISO } from "date-fns";

// export interface AssessmentResult {
//   id: number;
//   child_id: string;
//   predicted_class: string;
//   confidence: number;
//   risk_level: string;
//   scanpath_path: string;
//   heatmap_path: string;
//   gaze_data_path: string;
//   created_at: string;
//   childName?: string;
// }

// interface AssessmentResultModalProps {
//   result: AssessmentResult | null;
//   isOpen: boolean;
//   onClose: () => void;
// }

// export function AssessmentResultModal({ result, isOpen, onClose }: AssessmentResultModalProps) {
//   const [imageLoading, setImageLoading] = useState({ scanpath: true, heatmap: true });
//   const [imageErrors, setImageErrors] = useState({ scanpath: false, heatmap: false });
//   const { toast } = useToast();

//   const handleImageLoad = (type: 'scanpath' | 'heatmap') => {
//     setImageLoading(prev => ({ ...prev, [type]: false }));
//   };

//   const handleImageError = (type: 'scanpath' | 'heatmap') => {
//     setImageLoading(prev => ({ ...prev, [type]: false }));
//     setImageErrors(prev => ({ ...prev, [type]: true }));
//   };

//   const handleDownload = async (url: string, filename: string) => {
//     try {
//       const response = await fetch(url);
//       const blob = await response.blob();
//       const downloadUrl = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = downloadUrl;
//       link.download = filename;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(downloadUrl);
      
//       toast({
//         title: "Download started",
//         description: `${filename} is being downloaded.`,
//       });
//     } catch (error) {
//       toast({
//         title: "Download failed",
//         description: "Failed to download the file. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   const getRiskColor = (riskLevel: string) => {
//     switch (riskLevel.toLowerCase()) {
//       case 'safe': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
//       case 'low': return 'text-green-600 bg-green-50 border-green-200';
//       case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
//       case 'high': return 'text-red-600 bg-red-50 border-red-200';
//       default: return 'text-gray-600 bg-gray-50 border-gray-200';
//     }
//   };

//   const getRiskIcon = (riskLevel: string) => {
//     switch (riskLevel.toLowerCase()) {
//       case 'safe': return <ShieldCheck className="h-4 w-4" />;
//       case 'low': return <CheckCircle className="h-4 w-4" />;
//       case 'moderate': return <AlertTriangle className="h-4 w-4" />;
//       case 'high': return <AlertTriangle className="h-4 w-4" />;
//       default: return <Brain className="h-4 w-4" />;
//     }
//   };

//   if (!result) return null;

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-6xl max-h-[95vh]">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <Brain className="h-5 w-5" />
//             Assessment Result #{result.id}
//           </DialogTitle>
//         </DialogHeader>

//         <ScrollArea className="max-h-[85vh]">
//           <div className="space-y-6">
//             {/* Assessment Overview */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <FileText className="h-4 w-4" />
//                   Assessment Overview
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//                   <div>
//                     <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
//                       <Users className="h-4 w-4" />
//                       Patient
//                     </div>
//                     <p className="text-lg font-semibold">
//                       {result.childName || `Child #${result.child_id}`}
//                     </p>
//                   </div>
                  
//                   <div>
//                     <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
//                       <Calendar className="h-4 w-4" />
//                       Assessment Date
//                     </div>
//                     <p className="text-lg">
//                       {format(parseISO(result.created_at), 'MMM dd, yyyy')}
//                     </p>
//                     <p className="text-sm text-muted-foreground">
//                       {format(parseISO(result.created_at), 'HH:mm:ss')}
//                     </p>
//                   </div>
                  
//                   <div>
//                     <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
//                       <Target className="h-4 w-4" />
//                       Prediction
//                     </div>
//                     <p className="text-lg font-semibold">{result.predicted_class}</p>
//                   </div>
                  
//                   <div>
//                     <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
//                       <TrendingUp className="h-4 w-4" />
//                       Confidence
//                     </div>
//                     <p className="text-lg font-semibold">{(result.confidence * 100).toFixed(1)}%</p>
//                   </div>
//                 </div>

//                 {/* Risk Level Banner */}
//                 <div className={`mt-6 p-4 rounded-lg border-2 ${getRiskColor(result.risk_level)}`}>
//                   <div className="flex items-center gap-3">
//                     {getRiskIcon(result.risk_level)}
//                     <div>
//                       <div className="font-semibold text-lg">
//                         Risk Level: {result.risk_level}
//                       </div>
//                       <div className="text-sm opacity-80">
//                         {result.risk_level.toLowerCase() === 'safe' && 'No immediate concerns detected. Continue regular monitoring and healthy practices.'}
//                         {result.risk_level.toLowerCase() === 'low' && 'Low probability of ASD. Continue regular monitoring.'}
//                         {result.risk_level.toLowerCase() === 'moderate' && 'Moderate probability of ASD. Consider additional evaluation.'}
//                         {result.risk_level.toLowerCase() === 'high' && 'High probability of ASD. Recommend immediate professional evaluation.'}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Visual Analysis */}
//             <Tabs defaultValue="images" className="w-full">
//               <TabsList className="grid w-full grid-cols-3">
//                 <TabsTrigger value="images">Visual Analysis</TabsTrigger>
//                 <TabsTrigger value="data">Gaze Data</TabsTrigger>
//                 <TabsTrigger value="interpretation">Interpretation</TabsTrigger>
//               </TabsList>

//               <TabsContent value="images" className="space-y-4">
//                 <div className="grid md:grid-cols-2 gap-6">
//                   {/* Scanpath Image */}
//                   <Card>
//                     <CardHeader>
//                       <div className="flex items-center justify-between">
//                         <CardTitle className="flex items-center gap-2">
//                           <Eye className="h-4 w-4" />
//                           Scanpath Analysis
//                         </CardTitle>
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => handleDownload(result.scanpath_path, `scanpath_${result.id}.png`)}
//                         >
//                           <Download className="h-4 w-4 mr-2" />
//                           Download
//                         </Button>
//                       </div>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="relative bg-gray-50 rounded-lg min-h-[300px] flex items-center justify-center">
//                         {imageLoading.scanpath && (
//                           <div className="absolute inset-0 flex items-center justify-center">
//                             <LoadingSpinner size="md" text="Loading scanpath..." />
//                           </div>
//                         )}
//                         {imageErrors.scanpath ? (
//                           <div className="text-center text-muted-foreground">
//                             <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
//                             <p>Failed to load scanpath image</p>
//                             <Button 
//                               variant="outline" 
//                               size="sm" 
//                               className="mt-2"
//                               onClick={() => window.open(result.scanpath_path, '_blank')}
//                             >
//                               Open in new tab
//                             </Button>
//                           </div>
//                         ) : (
//                           <img
//                             src={result.scanpath_path}
//                             alt="Scanpath Analysis"
//                             className="max-w-full max-h-[400px] object-contain rounded"
//                             onLoad={() => handleImageLoad('scanpath')}
//                             onError={() => handleImageError('scanpath')}
//                           />
//                         )}
//                       </div>
//                       <p className="text-sm text-muted-foreground mt-2">
//                         Visual representation of eye movement patterns during the assessment
//                       </p>
//                     </CardContent>
//                   </Card>

//                   {/* Heatmap Image */}
//                   <Card>
//                     <CardHeader>
//                       <div className="flex items-center justify-between">
//                         <CardTitle className="flex items-center gap-2">
//                           <Activity className="h-4 w-4" />
//                           Attention Heatmap
//                         </CardTitle>
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => handleDownload(result.heatmap_path, `heatmap_${result.id}.png`)}
//                         >
//                           <Download className="h-4 w-4 mr-2" />
//                           Download
//                         </Button>
//                       </div>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="relative bg-gray-50 rounded-lg min-h-[300px] flex items-center justify-center">
//                         {imageLoading.heatmap && (
//                           <div className="absolute inset-0 flex items-center justify-center">
//                             <LoadingSpinner size="md" text="Loading heatmap..." />
//                           </div>
//                         )}
//                         {imageErrors.heatmap ? (
//                           <div className="text-center text-muted-foreground">
//                             <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
//                             <p>Failed to load heatmap image</p>
//                             <Button 
//                               variant="outline" 
//                               size="sm" 
//                               className="mt-2"
//                               onClick={() => window.open(result.heatmap_path, '_blank')}
//                             >
//                               Open in new tab
//                             </Button>
//                           </div>
//                         ) : (
//                           <img
//                             src={result.heatmap_path}
//                             alt="Attention Heatmap"
//                             className="max-w-full max-h-[400px] object-contain rounded"
//                             onLoad={() => handleImageLoad('heatmap')}
//                             onError={() => handleImageError('heatmap')}
//                           />
//                         )}
//                       </div>
//                       <p className="text-sm text-muted-foreground mt-2">
//                         Heat visualization showing areas of visual attention focus
//                       </p>
//                     </CardContent>
//                   </Card>
//                 </div>
//               </TabsContent>

//               <TabsContent value="data" className="space-y-4">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                       <BarChart3 className="h-4 w-4" />
//                       Gaze Data Analysis
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-4">
//                       <div className="flex items-center justify-between p-4 border rounded-lg">
//                         <div>
//                           <h4 className="font-medium">Raw Gaze Data</h4>
//                           <p className="text-sm text-muted-foreground">
//                             Complete eye tracking data in Excel format
//                           </p>
//                         </div>
//                         <Button
//                           variant="outline"
//                           onClick={() => handleDownload(result.gaze_data_path, `gaze_data_${result.id}.xlsx`)}
//                         >
//                           <Download className="h-4 w-4 mr-2" />
//                           Download Excel
//                         </Button>
//                       </div>

//                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                         <div className="text-center p-4 bg-blue-50 rounded-lg">
//                           <div className="text-2xl font-bold text-blue-600">{result.id}</div>
//                           <div className="text-sm text-blue-600">Assessment ID</div>
//                         </div>
//                         <div className="text-center p-4 bg-green-50 rounded-lg">
//                           <div className="text-2xl font-bold text-green-600">
//                             {(result.confidence * 100).toFixed(0)}%
//                           </div>
//                           <div className="text-sm text-green-600">Confidence</div>
//                         </div>
//                         <div className="text-center p-4 bg-purple-50 rounded-lg">
//                           <div className="text-2xl font-bold text-purple-600">
//                             {result.predicted_class}
//                           </div>
//                           <div className="text-sm text-purple-600">Classification</div>
//                         </div>
//                         <div className="text-center p-4 bg-orange-50 rounded-lg">
//                           <div className="text-2xl font-bold text-orange-600">
//                             {result.risk_level}
//                           </div>
//                           <div className="text-sm text-orange-600">Risk Level</div>
//                         </div>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </TabsContent>

//               <TabsContent value="interpretation" className="space-y-4">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                       <Brain className="h-4 w-4" />
//                       Clinical Interpretation
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-4">
//                       <div className="p-4 bg-blue-50 rounded-lg">
//                         <h4 className="font-semibold text-blue-900 mb-2">Assessment Results</h4>
//                         <p className="text-blue-800">
//                           <strong>Classification:</strong> {result.predicted_class}
//                         </p>
//                         <p className="text-blue-800">
//                           <strong>Confidence Level:</strong> {(result.confidence * 100).toFixed(1)}%
//                         </p>
//                         <p className="text-blue-800">
//                           <strong>Risk Assessment:</strong> {result.risk_level} risk level
//                         </p>
//                       </div>

//                       <div className="p-4 bg-gray-50 rounded-lg">
//                         <h4 className="font-semibold text-gray-900 mb-2">Next Steps</h4>
//                         <div className="space-y-2 text-gray-700">
//                         {result.risk_level.toLowerCase() === 'safe' && (
//                             <>
//                               <p>• No concerns detected at this stage</p>
//                               <p>• Maintain healthy daily routines and environment</p>
//                               <p>• Continue regular monitoring as a precaution</p>
//                             </>
//                           )}
//                           {result.risk_level.toLowerCase() === 'low' && (
//                             <>
//                               <p>• Continue regular developmental monitoring</p>
//                               <p>• Schedule follow-up assessments as recommended</p>
//                               <p>• No immediate intervention required</p>
//                             </>
//                           )}
//                           {result.risk_level.toLowerCase() === 'moderate' && (
//                             <>
//                               <p>• Consider additional comprehensive evaluation</p>
//                               <p>• Consult with developmental specialist</p>
//                               <p>• Monitor for emerging signs and symptoms</p>
//                             </>
//                           )}
//                           {result.risk_level.toLowerCase() === 'high' && (
//                             <>
//                               <p>• Immediate referral to autism specialist recommended</p>
//                               <p>• Comprehensive diagnostic evaluation needed</p>
//                               <p>• Early intervention services may be beneficial</p>
//                             </>
//                           )}
//                         </div>
//                       </div>

//                       <div className="p-4 bg-amber-50 rounded-lg">
//                         <h4 className="font-semibold text-amber-900 mb-2">Important Note</h4>
//                         <p className="text-amber-800 text-sm">
//                           This assessment is a screening tool and should not be used as the sole basis for diagnosis. 
//                           Always consult with qualified healthcare professionals for comprehensive evaluation and diagnosis.
//                         </p>
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





import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { 
  FileText, Image, Download, Calendar, Brain, Target, TrendingUp, AlertTriangle, CheckCircle, 
  ShieldCheck, Users, BarChart3, Eye, Zap, Activity, Lightbulb, ListChecks
} from "lucide-react";

//==========================================================================
// Interfaces & Type Definitions
//==========================================================================
export interface AssessmentResult {
  id: number;
  child_id: string;
  predicted_class: string;
  confidence: number;
  risk_level: string;
  scanpath_path: string;
  heatmap_path: string;
  gaze_data_path: string;
  created_at: string;
  childName?: string;
}

interface AssessmentResultModalProps {
  result: AssessmentResult | null;
  isOpen: boolean;
  onClose: () => void;
}

//==========================================================================
// Centralized Risk Level Configuration
//==========================================================================
const RISK_LEVEL_CONFIG = {
  safe: {
    color: "text-emerald-800",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    shadow: "shadow-emerald-500/20",
    icon: <ShieldCheck className="h-5 w-5" />,
    description: "No immediate concerns detected. Healthy development observed.",
    recommendations: [
      "Maintain a stimulating and supportive environment.",
      "Continue with regular developmental check-ups.",
      "Encourage social interaction and play-based learning.",
    ],
  },
  low: {
    color: "text-green-800",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    shadow: "shadow-green-500/20",
    icon: <CheckCircle className="h-5 w-5" />,
    description: "Low probability of ASD indicators. Continue routine monitoring.",
    recommendations: [
      "Continue regular developmental monitoring with a pediatrician.",
      "Observe social communication and interaction skills.",
      "No immediate intervention is typically required.",
    ],
  },
  moderate: {
    color: "text-yellow-800",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
    shadow: "shadow-yellow-500/20",
    icon: <AlertTriangle className="h-5 w-5" />,
    description: "Some indicators suggest a moderate probability of ASD. Further evaluation is advised.",
    recommendations: [
      "Consult with a developmental specialist or pediatrician for a follow-up.",
      "Consider a more comprehensive developmental evaluation.",
      "Keep a log of observed behaviors and milestones.",
    ],
  },
  high: {
    color: "text-red-800",
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
    shadow: "shadow-red-500/20",
    icon: <AlertTriangle className="h-5 w-5" />,
    description: "Strong indicators for ASD are present. Immediate professional evaluation is recommended.",
    recommendations: [
      "Seek an immediate referral to an autism specialist for a diagnostic evaluation.",
      "Discuss early intervention services with healthcare providers.",
      "Gather all relevant developmental history for the specialist.",
    ],
  },
  default: {
    color: "text-gray-800",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-200",
    shadow: "shadow-gray-500/10",
    icon: <Brain className="h-5 w-5" />,
    description: "Assessment data processed.",
    recommendations: ["Please review the detailed data and consult with a specialist."],
  },
};

//==========================================================================
// Main Modal Component
//==========================================================================
export function AssessmentResultModal({ result, isOpen, onClose }: AssessmentResultModalProps) {
  const { toast } = useToast();

  const riskConfig = useMemo(() => {
    const riskKey = result?.risk_level.toLowerCase() as keyof typeof RISK_LEVEL_CONFIG;
    return RISK_LEVEL_CONFIG[riskKey] || RISK_LEVEL_CONFIG.default;
  }, [result]);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok.");
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast({ title: "Download started", description: `${filename} is downloading.` });
    } catch (error) {
      toast({ title: "Download failed", description: "Could not download the file.", variant: "destructive" });
    }
  };

  if (!result) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* START OF SCROLLING FIX:
        The DialogContent is now a flex container with a fixed height.
        This allows us to create a scrollable area within it.
      */}
      <DialogContent className="max-w-4xl w-full h-[95vh] flex flex-col">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText />
            Assessment Result #{result.id}
          </DialogTitle>
        </DialogHeader>

        {/* This wrapper div grows to fill the space between the header and footer.
          'min-h-0' is the critical part that enables scrolling within a flex container.
        */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              {/* All card content goes inside the scroll area */}
              
              <ResultHeader result={result} riskConfig={riskConfig} />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  icon={<Calendar />}
                  label="Assessment Date"
                  value={
                    <>
                      <p>{format(parseISO(result.created_at), 'MMM dd, yyyy')}</p>
                      <p className="text-sm font-normal text-muted-foreground">
                        {format(parseISO(result.created_at), 'p')}
                      </p>
                    </>
                  }
                />
                <MetricCard
                  icon={<Target />}
                  label="Prediction"
                  value={<p>{result.predicted_class}</p>}
                />
                <MetricCard
                  icon={<TrendingUp />}
                  label="Confidence"
                  value={<p>{(result.confidence * 100).toFixed(1)}%</p>}
                />
                 <MetricCard
                  icon={<Users />}
                  label="Patient ID"
                  value={<p className="truncate">{result.child_id}</p>}
                />
              </div>
              
              <Tabs defaultValue="visuals" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="visuals">Visual Analysis</TabsTrigger>
                  <TabsTrigger value="data">Gaze Data</TabsTrigger>
                  <TabsTrigger value="interpretation">Interpretation & Next Steps</TabsTrigger>
                </TabsList>
                
                <TabsContent value="visuals" className="mt-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <ImageAnalysisCard
                      title="Scanpath Analysis"
                      icon={<Eye />}
                      imageUrl={result.scanpath_path}
                      description="Visual representation of eye movement patterns."
                      onDownload={() => handleDownload(result.scanpath_path, `scanpath_${result.id}.png`)}
                    />
                    <ImageAnalysisCard
                      title="Attention Heatmap"
                      icon={<Activity />}
                      imageUrl={result.heatmap_path}
                      description="Heat visualization showing areas of visual attention focus."
                      onDownload={() => handleDownload(result.heatmap_path, `heatmap_${result.id}.png`)}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="data" className="mt-4">
                   <Card>
                    <CardHeader><CardTitle>Quantitative Data</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Raw Gaze Data File</h4>
                          <p className="text-sm text-muted-foreground">Complete eye tracking dataset in .xlsx format.</p>
                        </div>
                        <Button onClick={() => handleDownload(result.gaze_data_path, `gaze_data_${result.id}.xlsx`)}>
                          <Download className="h-4 w-4 mr-2" /> Download Excel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="interpretation" className="mt-4">
                  <Card>
                    <CardHeader><CardTitle>Clinical Interpretation</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                      <InterpretationSection
                        icon={<Lightbulb />}
                        title="Key Findings"
                        color="blue"
                      >
                        The assessment classified the result as <strong>{result.predicted_class}</strong> with a confidence of <strong>{(result.confidence * 100).toFixed(1)}%</strong>, leading to a <strong>{result.risk_level}</strong> risk assessment.
                      </InterpretationSection>
                      
                      <InterpretationSection
                        icon={<ListChecks />}
                        title="Recommended Next Steps"
                        color="green"
                      >
                        <ul className="list-disc list-inside space-y-1">
                          {riskConfig.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                        </ul>
                      </InterpretationSection>
                      
                       <div className="p-4 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20 rounded-r-lg">
                          <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Disclaimer</h4>
                          <p className="text-sm text-amber-700 dark:text-amber-400">
                            This is a screening tool, not a diagnostic instrument. A formal diagnosis must be made by a qualified healthcare professional.
                          </p>
                        </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </div>

        {/* This footer is now fixed at the bottom, outside of the scrollable area. */}
        <div className="flex justify-end p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

//==========================================================================
// Internal Helper Components (These are unchanged)
//==========================================================================

function ResultHeader({ result, riskConfig }: { result: AssessmentResult; riskConfig: any }) {
  return (
    <div className={`p-6 rounded-lg border-2 ${riskConfig.bgColor} ${riskConfig.borderColor} ${riskConfig.color} shadow-lg ${riskConfig.shadow}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium opacity-80">Patient</p>
          <h2 className="text-2xl lg:text-3xl font-bold">{result.childName || `Child #${result.child_id}`}</h2>
        </div>
        <div className="md:text-right">
          <div className="flex items-center gap-2 md:justify-end font-semibold text-lg lg:text-xl">
            {riskConfig.icon}
            <span>Risk Level: {result.risk_level}</span>
          </div>
          <p className="mt-1 text-sm opacity-80">{riskConfig.description}</p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon} {label}
      </div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </Card>
  );
}

function ImageAnalysisCard({ title, icon, imageUrl, description, onDownload }: {
  title: string; icon: React.ReactNode; imageUrl: string; description: string; onDownload: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">{icon} {title}</CardTitle>
          <Button variant="outline" size="sm" onClick={onDownload}><Download className="h-4 w-4 mr-2" /> Download</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video w-full bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
          {isLoading && <LoadingSpinner size="md" />}
          {hasError ? (
            <div className="text-center text-muted-foreground p-4">
              <Image className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Could not load image</p>
              <Button variant="link" size="sm" className="mt-1" onClick={() => window.open(imageUrl, '_blank')}>Try opening in new tab</Button>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={title}
              className={`object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setIsLoading(false)}
              onError={() => { setIsLoading(false); setHasError(true); }}
            />
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </CardContent>
    </Card>
  );
}

function InterpretationSection({ icon, title, color, children }: {
  icon: React.ReactNode; title: string; color: string; children: React.ReactNode;
}) {
  const colorClasses = {
    blue: "border-blue-500 text-blue-800 dark:text-blue-300",
    green: "border-green-500 text-green-800 dark:text-green-300",
  }[color] || "border-gray-500 text-gray-800 dark:text-gray-300";

  return (
    <div className={`border-l-4 pl-4 ${colorClasses}`}>
      <div className="flex items-center gap-2 font-semibold mb-2">
        {icon} {title}
      </div>
      <div className="text-sm text-foreground/80">{children}</div>
    </div>
  );
}