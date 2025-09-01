import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/ui/risk-badge";
// Import Tooltip components
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  Target,
  AlertCircle
} from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Child, Report } from "@/services/doctorPatientApi";

interface PatientCardProps {
  patient: Child & { latestReport?: Report };
  onViewDetails: (patient: Child) => void;
  onDownloadReport: (patient: Child) => void;
  onSchedule: (patient: Child) => void;
}

export function PatientCard({ 
  patient, 
  onViewDetails, 
  onDownloadReport, 
  onSchedule 
}: PatientCardProps) {
  const calculateAge = (dob: string) => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const { latestReport } = patient;

  return (
    <Card className="flex flex-col h-full w-full max-w-sm overflow-hidden rounded-lg border hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-5">
            <img
              src={patient.photoUrl ?? '/default-baby.png'}
              alt={`${patient.name}'s photo`}
              className="w-24 h-24 rounded-full object-cover border-4 border-muted"
            />
            <div>
              <CardTitle className="text-2xl mb-1">{patient.name}</CardTitle>
              <CardDescription className="text-sm">
                {calculateAge(patient.dob)} years old
                <span className="mx-1.5">·</span>
                ID: #{patient.id}
              </CardDescription>
            </div>
          </div>
          {patient.riskLevel && <RiskBadge level={patient.riskLevel} />}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow space-y-4 px-5">
        <div className="text-sm font-medium text-foreground">Latest Assessment</div>
        
        {latestReport ? (
          <div className="space-y-3 rounded-md border bg-muted/40 p-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2.5 flex-shrink-0" />
              <span className="font-semibold text-foreground">
                {format(parseISO(latestReport.created_at), 'MMM dd, yyyy')}
              </span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-2.5 flex-shrink-0" />
              <span>
                Confidence: <span className="font-semibold text-foreground">{(latestReport.confidence * 100).toFixed(1)}%</span>
              </span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Target className="h-4 w-4 mr-2.5 flex-shrink-0" />
              <span>
                Prediction: <span className="font-semibold text-foreground">{latestReport.predicted_class}</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center text-center p-4 rounded-md border border-dashed bg-muted/40 text-muted-foreground">
            <AlertCircle className="h-5 w-5 mr-2"/>
            <p className="text-sm">No assessment data available.</p>
          </div>
        )}
      </CardContent>
      
      {/* --- MODIFIED: Corrected button layout --- */}
      <CardFooter className="bg-muted/20 p-3 mt-auto">
        <TooltipProvider>
          <div className="flex w-full items-center gap-2">
            <Button
              size="sm"
              onClick={() => onViewDetails(patient)}
              className="flex-grow" // Use flex-grow to take up remaining space
            >
              <FileText className="h-4 w-4 mr-2" />
              View Details
            </Button>
            
            {/* <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownloadReport(patient)}
                  disabled={!latestReport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Report
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download Report</p>
              </TooltipContent>
            </Tooltip> */}
            
            <Tooltip>
              <TooltipTrigger asChild>
                {/* Changed to icon-only button to save space */}
                <Button
                  variant="outline"
                  size="icon" 
                  onClick={() => onSchedule(patient)}
                >
                  <Calendar className="h-4 w-4" />
                  <span className="sr-only">Schedule Appointment</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Schedule Appointment</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}