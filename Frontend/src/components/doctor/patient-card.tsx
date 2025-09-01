//with babypicture
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/ui/risk-badge";
import { FileText, Download, Calendar, User } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Child, Report } from "@/services/doctorPatientApi";

interface PatientCardProps {
  patient: Child & { latestReport?: Report };
  onViewDetails: (patient: Child) => void;
  onDownloadPDF: (patient: Child) => void;
  onSchedule: (patient: Child) => void;
}

export function PatientCard({ 
  patient, 
  onViewDetails, 
  onDownloadPDF, 
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 flex items-center gap-3">
            {/* Baby Photo (only if available) */}
            {patient.photoUrl && (
              <img
                src={patient.photoUrl}
                alt={`${patient.name}'s photo`}
                className="w-12 h-12 rounded-full object-cover border"
              />
            )}
            <div>
              <CardTitle className="text-lg">{patient.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Age: {calculateAge(patient.dob)} years old
              </p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <User className="h-3 w-3" />
                <span>Patient ID: #{patient.id}</span>
              </div>
            </div>
          </div>
          {patient.riskLevel && <RiskBadge level={patient.riskLevel} />}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Last Assessment:</span>
            <p className="font-medium">
              {patient.latestReport 
                ? format(parseISO(patient.latestReport.created_at), 'MMM dd, yyyy')
                : 'No assessments'
              }
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Risk Level:</span>
            <p className="font-medium">
              {patient.latestReport 
                ? patient.latestReport.risk_level
                : 'Not assessed'
              }
            </p>
          </div>
        </div>

        {patient.latestReport && (
          <div className="p-2 bg-muted/30 rounded-md">
            <div className="text-xs text-muted-foreground">Latest Assessment</div>
            <div className="text-sm font-medium">
              Confidence: {(patient.latestReport.confidence * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              Class: {patient.latestReport.predicted_class}
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => onViewDetails(patient)}
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-1" />
            View Details
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownloadPDF(patient)}
            disabled={!patient.latestReport}
          >
            <Download className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSchedule(patient)}
          >
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
