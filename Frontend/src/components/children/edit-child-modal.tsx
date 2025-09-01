// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { useChildrenStore } from "@/store/childrenStore";
// import { useAuthStore } from "@/store/authStore";
// import { useToast } from "@/hooks/use-toast";
// import { Loader2 } from "lucide-react";
// import type { Child, UpdateChildRequest } from "@/services/childrenApi";

// interface EditChildModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   child: Child | null;
// }

// export function EditChildModal({ open, onOpenChange, child }: EditChildModalProps) {
//   const [name, setName] = useState("");
//   const [dateOfBirth, setDateOfBirth] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
  
//   const { updateChild } = useChildrenStore();
//   const user = useAuthStore(state => state.user);
//   const { toast } = useToast();

//   // Populate form when child data changes
//   useEffect(() => {
//     if (child) {
//       setName(child.name);
//       setDateOfBirth(child.dob);
//     }
//   }, [child]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!name || !dateOfBirth || !user?.id || !child) {
//       toast({
//         title: "Validation Error",
//         description: "Please fill in all required fields.",
//         variant: "destructive",
//       });
//       return;
//     }

//     setIsSubmitting(true);
    
//     try {
//       const updateData: UpdateChildRequest = {
//         name,
//         dob: dateOfBirth,
//       };

//       const success = await updateChild(user.id, child.id, updateData);

//       if (success) {
//         toast({
//           title: "Child updated successfully",
//           description: `${name}'s information has been updated.`,
//         });
        
//         onOpenChange(false);
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to update child. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleCancel = () => {
//     // Reset form to original values
//     if (child) {
//       setName(child.name);
//       setDateOfBirth(child.dob);
//     }
//     onOpenChange(false);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>Edit Child Information</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="edit-name">Child's Name</Label>
//             <Input
//               id="edit-name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder="Enter child's full name"
//               disabled={isSubmitting}
//               required
//             />
//           </div>
          
//           <div className="space-y-2">
//             <Label htmlFor="edit-dob">Date of Birth</Label>
//             <Input
//               id="edit-dob"
//               type="date"
//               value={dateOfBirth}
//               onChange={(e) => setDateOfBirth(e.target.value)}
//               disabled={isSubmitting}
//               required
//             />
//           </div>
          
//           <div className="flex justify-end space-x-2 pt-4">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={handleCancel}
//               disabled={isSubmitting}
//             >
//               Cancel
//             </Button>
//             <Button type="submit" disabled={isSubmitting}>
//               {isSubmitting ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Updating...
//                 </>
//               ) : (
//                 "Update Child"
//               )}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// } 




import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useChildrenStore } from "@/store/childrenStore";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Child, UpdateChildRequest } from "@/services/childrenApi";

interface EditChildModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  child: Child | null;
}

export function EditChildModal({ open, onOpenChange, child }: EditChildModalProps) {
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { updateChild } = useChildrenStore();
  const user = useAuthStore(state => state.user);
  const { toast } = useToast();

  // Populate form when child data changes
  useEffect(() => {
    if (child) {
      setName(child.name);
      setDateOfBirth(child.dob);
      setPhotoFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [child]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !dateOfBirth || !user?.id || !child) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      let success = false;

      if (photoFile) {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("dob", dateOfBirth);
        formData.append("photo", photoFile);

        success = await updateChild(user.id, child.id, formData as any);
      } else {
        const updateData: UpdateChildRequest = {
          name,
          dob: dateOfBirth,
        };
        success = await updateChild(user.id, child.id, updateData as any);
      }

      if (success) {
        toast({
          title: "Child updated successfully",
          description: `${name}'s information has been updated.`,
        });
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update child. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (child) {
      setName(child.name);
      setDateOfBirth(child.dob);
      setPhotoFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Child Information</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Child's Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter child's full name"
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-dob">Date of Birth</Label>
            <Input
              id="edit-dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-photo">Child Photo (optional)</Label>
            <input
              id="edit-photo"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                setPhotoFile(f ?? null);
              }}
              disabled={isSubmitting}
              className="w-full text-sm"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Child"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
