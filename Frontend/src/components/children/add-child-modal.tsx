// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { useChildrenStore } from "@/store/childrenStore";
// import { useAuthStore } from "@/store/authStore";
// import { useToast } from "@/hooks/use-toast";
// import { Loader2 } from "lucide-react";

// interface AddChildModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

// export function AddChildModal({ open, onOpenChange }: AddChildModalProps) {
//   const [name, setName] = useState("");
//   const [dateOfBirth, setDateOfBirth] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
  
//   const { addChild } = useChildrenStore();
//   const user = useAuthStore(state => state.user);
//   const { toast } = useToast();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!name || !dateOfBirth || !user?.id) {
//       toast({
//         title: "Validation Error",
//         description: "Please fill in all required fields.",
//         variant: "destructive",
//       });
//       return;
//     }

//     setIsSubmitting(true);
    
//     try {
//       const success = await addChild(user.id, {
//         name,
//         dob: dateOfBirth,
//       });

//       if (success) {
//         toast({
//           title: "Child added successfully",
//           description: `${name} has been added to your profile.`,
//         });
        
//         // Reset form
//         setName("");
//         setDateOfBirth("");
//         onOpenChange(false);
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to add child. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>Add New Child</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="name">Child's Name</Label>
//             <Input
//               id="name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder="Enter child's full name"
//               disabled={isSubmitting}
//               required
//             />
//           </div>
          
//           <div className="space-y-2">
//             <Label htmlFor="dob">Date of Birth</Label>
//             <Input
//               id="dob"
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
//               onClick={() => onOpenChange(false)}
//               disabled={isSubmitting}
//             >
//               Cancel
//             </Button>
//             <Button type="submit" disabled={isSubmitting}>
//               {isSubmitting ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Adding...
//                 </>
//               ) : (
//                 "Add Child"
//               )}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }




import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useChildrenStore } from "@/store/childrenStore";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AddChildModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddChildModal({ open, onOpenChange }: AddChildModalProps) {
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { addChild } = useChildrenStore();
  const user = useAuthStore((state) => state.user);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !dateOfBirth || !user?.id) {
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

      // If a photo file is chosen, send multipart/form-data
      if (photoFile) {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("dob", dateOfBirth);
        formData.append("photo", photoFile);

        // pass FormData to addChild; store should handle FormData type
        // cast to any to keep compatibility with existing typing if needed
        success = await addChild(user.id, formData as any);
      } else {
        // No photo -> keep previous JSON behavior
        success = await addChild(user.id, {
          name,
          dob: dateOfBirth,
        } as any);
      }

      if (success) {
        toast({
          title: "Child added successfully",
          description: `${name} has been added to your profile.`,
        });

        // Reset form
        setName("");
        setDateOfBirth("");
        setPhotoFile(null);

        // Clear file input DOM value
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add child. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Child</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Child's Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter child's full name"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Child Photo (optional)</Label>
            <input
              id="photo"
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
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Child"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
