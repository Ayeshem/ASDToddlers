// src/components/ChildCard.tsx

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Play, FileText, MoreVertical } from "lucide-react";
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let months = (today.getFullYear() - birth.getFullYear()) * 12;
    months -= birth.getMonth();
    months += today.getMonth();
    if (today.getDate() < birth.getDate()) {
        months--;
    }
    if (months <= 0) return "0 months";
    if (months < 12) return `${months} months`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths > 0 ? `${years}y ${remainingMonths}m` : `${years} years`;
  };

  return (
    <>
      <Card className="flex flex-col hover:shadow-lg transition-shadow">
        {child.photoUrl && (
          <img
            src={child.photoUrl}
            alt={`${child.name}'s photo`}
            className="w-full h-40 object-cover rounded-t-lg"
          />
        )}
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl font-bold">{child.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Age: {calculateAge(child.dob)}
              </p>
            </div>
            {/* Dropdown now only contains Edit and Delete */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 self-start">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(child)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete Profile</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        {/* Use mt-auto to push this content to the bottom of the card */}
        <CardContent className="mt-auto pt-4">
          {/* Action buttons are now in a flex container */}
          <div className="flex w-full items-center gap-2">
            <Button
              size="sm"
              onClick={() => onStartSession(child)}
              className="flex-grow" // Let the primary button take more space
            >
              <Play className="h-4 w-4 mr-2" />
              Start Session
            </Button>
            <Button
              variant="outline"
              size="icon" // Use "icon" size for a compact square button
              onClick={() => onViewReports(child)}
              aria-label="View Reports"
            >
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* The Delete Confirmation Dialog remains unchanged */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the profile for{' '}
              <span className="font-semibold">{child.name}</span> and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => onDelete(child.id)}
            >
              Yes, delete profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}