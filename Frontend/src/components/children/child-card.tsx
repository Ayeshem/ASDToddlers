import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Play, FileText } from "lucide-react";
import type { Child } from "@/services/childrenApi";
import { format } from "date-fns";

interface ChildCardProps {
  child: Child;
  onEdit: (child: Child) => void;
  onDelete: (id: string) => void;
  onStartSession: (child: Child) => void;
  onViewReports: (child: Child) => void;
}

export function ChildCard({ child, onEdit, onDelete, onStartSession, onViewReports }: ChildCardProps) {
  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + 
                  (today.getMonth() - birth.getMonth());
    
    if (months < 12) {
      return `${months} months`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return remainingMonths > 0 ? `${years}y ${remainingMonths}m` : `${years} years`;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{child.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Age: {calculateAge(child.dob)}
            </p>
            <p className="text-xs text-muted-foreground">
              DOB: {format(new Date(child.dob), 'MMM dd, yyyy')}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(child)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => onStartSession(child)}
            className="flex-1"
          >
            <Play className="h-4 w-4 mr-1" />
            Start Session
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewReports(child)}
          >
            <FileText className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(child.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}