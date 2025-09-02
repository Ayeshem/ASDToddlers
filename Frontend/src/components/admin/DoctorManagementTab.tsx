// import { useState, useEffect } from "react";
// import { DashboardLayout } from "@/components/layout/dashboard-layout";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { LoadingSpinner } from "@/components/ui/loading-spinner";
// import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/hooks/use-toast";
// import { adminApi, type Doctor } from "@/services/adminApi";
// import { DoctorDetailsModal } from "./DoctorDetailsModal";
// import { 
//   UserPlus, 
//   Video, 
//   RefreshCw, 
//   Edit, 
//   Trash2, 
//   Eye, 
//   Users, 
//   AlertTriangle,
//   CheckCircle,
//   Clock,
//   Briefcase,
//   Mail
// } from "lucide-react";

// export function DoctorManagementTab() {
//   const [doctors, setDoctors] = useState<Doctor[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
//   const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
//   const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [newDoctor, setNewDoctor] = useState({
//     name: "",
//     email: "",
//     specialization: "",
//     status: "active",
//   });

//   const { toast } = useToast();

//   useEffect(() => {
//     fetchDoctors();
//   }, []);

//   const fetchDoctors = async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const doctorsData = await adminApi.getAllDoctors();
//       setDoctors(doctorsData);
//     } catch (error) {
//       console.error('Failed to fetch doctors:', error);
//       setError('Failed to load doctors data');
//       toast({
//         title: "Error",
//         description: "Failed to load doctors data. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleAddDoctor = async () => {
//     if (!newDoctor.name || !newDoctor.email || !newDoctor.specialization) {
//       toast({
//         title: "Error",
//         description: "Please fill in all required fields.",
//         variant: "destructive",
//       });
//       return;
//     }

//     try {
//       await adminApi.addDoctor({
//         ...newDoctor,
//         password: "defaultPassword123"
//       });
//       toast({
//         title: "Doctor added",
//         description: `${newDoctor.name} has been added successfully. They will need to reset their password on first login.`,
//       });
//       setNewDoctor({ name: "", email: "", specialization: "", status: "active" });
//       setShowAddDoctorModal(false);
//       await fetchDoctors();
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to add doctor. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleUpdateDoctor = async (doctor: Doctor) => {
//     try {
//       await adminApi.updateDoctor(doctor.id, {
//         name: doctor.full_name,
//         email: doctor.email,
//         specialization: doctor.specialization,
//         status: doctor.status
//       });
      
//       toast({
//         title: "Doctor updated",
//         description: `${doctor.full_name}'s profile has been updated.`,
//       });
//       setEditingDoctor(null);
//       await fetchDoctors();
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to update doctor. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleDeleteDoctor = async (id: string, name: string) => {
//     try {
//       await adminApi.deleteDoctor(id);
//       toast({
//         title: "Doctor removed",
//         description: `${name} has been removed from the system.`,
//       });
//       await fetchDoctors();
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to delete doctor. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleToggleActiveStatus = async (doctor: Doctor) => {
//     try {
//       await adminApi.toggleDoctorStatus(doctor.id);
//       toast({
//         title: doctor.status === 'active' ? "Doctor deactivated" : "Doctor activated",
//         description: `${doctor.full_name} has been ${doctor.status === 'active' ? 'deactivated' : 'activated'}.`,
//       });
//       await fetchDoctors();
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to toggle doctor status. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleViewDetails = (doctor: Doctor) => {
//     setSelectedDoctor(doctor);
//     setShowDetailsModal(true);
//   };

//   const handleTriggerRetraining = async () => {
//     toast({
//       title: "Model retraining initiated",
//       description: "The ML model retraining process has been started.",
//     });
//   };

//   const activeDoctors = doctors.filter(doc => doc.status === 'active');
//   const inactiveDoctors = doctors.filter(doc => doc.status === 'inactive');

//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         {/* Header with Statistics */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h3 className="text-lg font-semibold">Doctor Management</h3>
//             <p className="text-sm text-muted-foreground">
//               {doctors.length} total doctors • {activeDoctors.length} active • {inactiveDoctors.length} inactive
//             </p>
//           </div>
//           <Button variant="outline" onClick={fetchDoctors} size="sm">
//             <RefreshCw className="h-4 w-4 mr-2" />
//             Refresh
//           </Button>
//         </div>

//         {/* Main Content */}
//         {isLoading ? (
//           <div className="flex items-center justify-center py-12">
//             <LoadingSpinner size="lg" text="Loading doctors..." />
//           </div>
//         ) : error ? (
//           <div className="text-center py-12">
//             <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
//             <p className="text-red-600 mb-4">{error}</p>
//             <Button variant="outline" onClick={fetchDoctors}>
//               <RefreshCw className="h-4 w-4 mr-2" />
//               Try Again
//             </Button>
//           </div>
//         ) : (
//           <>
//             {/* Quick Stats */}
//             <div className="grid gap-4 md:grid-cols-3">
//               <Card>
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
//                   <Users className="h-4 w-4 text-muted-foreground" />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">{doctors.length}</div>
//                   <p className="text-xs text-muted-foreground">Healthcare professionals</p>
//                 </CardContent>
//               </Card>
              
//               <Card>
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
//                   <CheckCircle className="h-4 w-4 text-green-600" />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold text-green-600">{activeDoctors.length}</div>
//                   <p className="text-xs text-muted-foreground">Currently practicing</p>
//                 </CardContent>
//               </Card>
              
//               <Card>
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-sm font-medium">Specializations</CardTitle>
//                   <Briefcase className="h-4 w-4 text-muted-foreground" />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">
//                     {new Set(doctors.map(d => d.specialization)).size}
//                   </div>
//                   <p className="text-xs text-muted-foreground">Unique specialties</p>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex gap-4">
//               <Dialog open={showAddDoctorModal} onOpenChange={setShowAddDoctorModal}>
//                 <DialogTrigger asChild>
//                   <Button>
//                     <UserPlus className="h-4 w-4 mr-2" />
//                     Add Doctor
//                   </Button>
//                 </DialogTrigger>
//                 <DialogContent>
//                   <DialogHeader>
//                     <DialogTitle>Add New Doctor</DialogTitle>
//                   </DialogHeader>
//                   <div className="space-y-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="name">Full Name</Label>
//                       <Input
//                         id="name"
//                         value={newDoctor.name}
//                         onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
//                         placeholder="Dr. John Smith"
//                       />
//                     </div>
                    
//                     <div className="space-y-2">
//                       <Label htmlFor="email">Email</Label>
//                       <Input
//                         id="email"
//                         type="email"
//                         value={newDoctor.email}
//                         onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
//                         placeholder="john.smith@clinic.com"
//                       />
//                     </div>
                    
//                     <div className="space-y-2">
//                       <Label htmlFor="specialization">Specialization</Label>
//                       <Input
//                         id="specialization"
//                         value={newDoctor.specialization}
//                         onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})}
//                         placeholder="Pediatric Psychology"
//                       />
//                     </div>
                    
//                     <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                       <p className="text-sm text-blue-800">
//                         <strong>Note:</strong> A default password will be generated for the new doctor. 
//                         They will need to reset their password on first login for security.
//                       </p>
//                     </div>
                    
//                     <div className="flex gap-2">
//                       <Button onClick={handleAddDoctor} className="flex-1">
//                         Add Doctor
//                       </Button>
//                       <Button variant="outline" onClick={() => setShowAddDoctorModal(false)}>
//                         Cancel
//                       </Button>
//                     </div>
//                   </div>
//                 </DialogContent>
//               </Dialog>
              
//               <Button variant="outline" onClick={() => window.location.href = '/stimuli-library'}>
//                 <Video className="h-4 w-4 mr-2" />
//                 Manage Stimuli
//               </Button>
              
//               <Button variant="outline" onClick={handleTriggerRetraining}>
//                 <RefreshCw className="h-4 w-4 mr-2" />
//                 Retrain Model
//               </Button>
//             </div>

//             {/* Doctors List */}
//             <Card>
//               <CardHeader>
//                 <div className="flex items-center justify-between">
//                   <CardTitle className="flex items-center gap-2">
//                     <Users className="h-5 w-5" />
//                     All Doctors ({doctors.length})
//                   </CardTitle>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 {doctors.length === 0 ? (
//                   <div className="text-center py-12 text-muted-foreground">
//                     <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
//                     <p className="text-lg mb-2">No doctors found</p>
//                     <p className="text-sm">Add your first doctor to get started</p>
//                     <Button 
//                       className="mt-4" 
//                       onClick={() => setShowAddDoctorModal(true)}
//                     >
//                       <UserPlus className="h-4 w-4 mr-2" />
//                       Add First Doctor
//                     </Button>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {doctors.map((doctor) => (
//                       <div key={doctor.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
//                         <div className="flex items-center gap-4 flex-1">
//                           <div className="flex-1">
//                             <div className="flex items-center gap-3">
//                               <h3 className="font-semibold text-lg">{doctor.full_name}</h3>
//                               <Badge variant={doctor.status === 'active' ? 'default' : 'secondary'}>
//                                 {doctor.status === 'active' ? (
//                                   <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
//                                 ) : (
//                                   <><Clock className="h-3 w-3 mr-1" /> Inactive</>
//                                 )}
//                               </Badge>
//                             </div>
//                             <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
//                               <span className="flex items-center gap-1">
//                                 <Mail className="h-3 w-3" />
//                                 {doctor.email}
//                               </span>
//                               <span className="flex items-center gap-1">
//                                 <Briefcase className="h-3 w-3" />
//                                 {doctor.specialization}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
                        
//                         <div className="flex items-center gap-2">
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => handleViewDetails(doctor)}
//                             title="View Details"
//                           >
//                             <Eye className="h-4 w-4" />
//                           </Button>
                          
//                           <div className="flex items-center space-x-2">
//                             <Switch
//                               checked={doctor.status === 'active'}
//                               onCheckedChange={() => handleToggleActiveStatus(doctor)}
//                             />
//                           </div>
                          
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => setEditingDoctor(doctor)}
//                             title="Edit Doctor"
//                           >
//                             <Edit className="h-4 w-4" />
//                           </Button>
                          
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => handleDeleteDoctor(doctor.id, doctor.full_name)}
//                             className="text-destructive hover:text-destructive"
//                             title="Delete Doctor"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </>
//         )}

//         {/* Doctor Details Modal */}
//         <DoctorDetailsModal
//           doctor={selectedDoctor}
//           isOpen={showDetailsModal}
//           onClose={() => {
//             setShowDetailsModal(false);
//             setSelectedDoctor(null);
//           }}
//         />

//         {/* Edit Doctor Modal */}
//         {editingDoctor && (
//           <Dialog open={true} onOpenChange={() => setEditingDoctor(null)}>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Edit Doctor</DialogTitle>
//               </DialogHeader>
//               <div className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="edit-name">Full Name</Label>
//                   <Input
//                     id="edit-name"
//                     value={editingDoctor.full_name}
//                     onChange={(e) => setEditingDoctor({...editingDoctor, full_name: e.target.value})}
//                   />
//                 </div>
                
//                 <div className="space-y-2">
//                   <Label htmlFor="edit-email">Email</Label>
//                   <Input
//                     id="edit-email"
//                     type="email"
//                     value={editingDoctor.email}
//                     onChange={(e) => setEditingDoctor({...editingDoctor, email: e.target.value})}
//                   />
//                 </div>
                
//                 <div className="space-y-2">
//                   <Label htmlFor="edit-specialization">Specialization</Label>
//                   <Input
//                     id="edit-specialization"
//                     value={editingDoctor.specialization}
//                     onChange={(e) => setEditingDoctor({...editingDoctor, specialization: e.target.value})}
//                   />
//                 </div>
                
//                 <div className="flex gap-2">
//                   <Button onClick={() => handleUpdateDoctor(editingDoctor)} className="flex-1">
//                     Update Doctor
//                   </Button>
//                   <Button variant="outline" onClick={() => setEditingDoctor(null)}>
//                     Cancel
//                   </Button>
//                 </div>
//               </div>
//             </DialogContent>
//           </Dialog>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// }


import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { adminApi, type Doctor } from "@/services/adminApi";
import { DoctorDetailsModal } from "./DoctorDetailsModal";
import {
  UserPlus,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Briefcase,
  Mail,
  MoreVertical,
} from "lucide-react";

export function DoctorManagementTab() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    email: "",
    specialization: "",
    status: "active",
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const doctorsData = await adminApi.getAllDoctors();
      setDoctors(doctorsData);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      setError("Failed to load doctors data");
      toast({
        title: "Error",
        description: "Failed to load doctors data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDoctor = async () => {
    if (!newDoctor.name || !newDoctor.email || !newDoctor.specialization) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await adminApi.addDoctor({
        ...newDoctor,
        password: "defaultPassword123", // A secure random password should be generated server-side
      });
      toast({
        title: "Doctor Added",
        description: `${newDoctor.name} has been added successfully.`,
      });
      setNewDoctor({ name: "", email: "", specialization: "", status: "active" });
      setShowAddDoctorModal(false);
      await fetchDoctors();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add doctor. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateDoctor = async (doctor: Doctor) => {
    try {
      await adminApi.updateDoctor(doctor.id, {
        name: doctor.full_name,
        email: doctor.email,
        specialization: doctor.specialization,
        status: doctor.status,
      });

      toast({
        title: "Doctor Updated",
        description: `${doctor.full_name}'s profile has been updated.`,
      });
      setEditingDoctor(null);
      await fetchDoctors();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update doctor. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDoctor = async (id: string, name: string) => {
    // Ideally, add a confirmation dialog here before deleting
    try {
      await adminApi.deleteDoctor(id);
      toast({
        title: "Doctor Removed",
        description: `${name} has been removed from the system.`,
      });
      await fetchDoctors();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete doctor. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActiveStatus = async (doctor: Doctor) => {
    try {
      await adminApi.toggleDoctorStatus(doctor.id);
      toast({
        title: doctor.status === "active" ? "Doctor Deactivated" : "Doctor Activated",
        description: `${doctor.full_name} has been ${
          doctor.status === "active" ? "deactivated" : "activated"
        }.`,
      });
      await fetchDoctors();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle doctor status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowDetailsModal(true);
  };

  const activeDoctors = doctors.filter((doc) => doc.status === "active");
  const inactiveDoctors = doctors.filter((doc) => doc.status === "inactive");
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Doctor Management</h2>
            <p className="text-muted-foreground">
              Manage doctor profiles, statuses, and system access.
            </p>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="outline" onClick={fetchDoctors} size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Dialog open={showAddDoctorModal} onOpenChange={setShowAddDoctorModal}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Doctor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Doctor</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to add a new doctor to the system.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Full Name</Label>
                    <Input id="name" value={newDoctor.name} onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })} className="col-span-3" placeholder="Dr. Jane Doe"/>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input id="email" type="email" value={newDoctor.email} onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })} className="col-span-3" placeholder="jane.doe@clinic.com"/>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="specialization" className="text-right">Specialization</Label>
                    <Input id="specialization" value={newDoctor.specialization} onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })} className="col-span-3" placeholder="Neuropsychology"/>
                  </div>
                </div>
                 <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> A temporary password will be set. The new doctor will be required to change it upon first login.
                    </p>
                  </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowAddDoctorModal(false)}>Cancel</Button>
                  <Button onClick={handleAddDoctor} className="flex-1">Add Doctor</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" text="Loading doctors..." />
          </div>
        ) : error ? (
          <Card className="text-center py-16 bg-red-50 border-red-200">
            <CardContent>
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-xl font-semibold text-red-800">Failed to Load Data</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <Button variant="destructive" onClick={fetchDoctors}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
                </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{doctors.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{activeDoctors.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Specializations</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{new Set(doctors.map((d) => d.specialization)).size}</div>
                </CardContent>
              </Card>
            </div>

            {/* Doctors List */}
            <Card>
              <CardHeader>
                <CardTitle>All Doctors ({doctors.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {doctors.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Doctors Found</h3>
                    <p className="text-sm mb-4">Get started by adding the first doctor to your system.</p>
                    <Button onClick={() => setShowAddDoctorModal(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add First Doctor
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {doctors.map((doctor) => (
                      <div key={doctor.id} className="flex items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4 flex-grow cursor-pointer" onClick={() => handleViewDetails(doctor)}>
                           <div className="flex items-center justify-center h-12 w-12 rounded-full bg-secondary text-secondary-foreground font-semibold">
                                {getInitials(doctor.full_name)}
                           </div>
                           <div className="grid gap-1">
                                <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-base">{doctor.full_name}</h3>
                                <Badge variant={doctor.status === 'active' ? 'default' : 'outline'}>
                                    {doctor.status === 'active' ? (
                                    <><CheckCircle className="h-3 w-3 mr-1.5 text-green-400" /> Active</>
                                    ) : (
                                    <><Clock className="h-3 w-3 mr-1.5" /> Inactive</>
                                    )}
                                </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{doctor.email}</span>
                                    <span className="flex items-center gap-1.5"><Briefcase className="h-3 w-3" />{doctor.specialization}</span>
                                </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                           <Switch
                              checked={doctor.status === 'active'}
                              onCheckedChange={() => handleToggleActiveStatus(doctor)}
                              aria-label={`Toggle status for ${doctor.full_name}`}
                            />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleViewDetails(doctor)}>
                                        <Eye className="mr-2 h-4 w-4"/> View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setEditingDoctor(doctor)}>
                                        <Edit className="mr-2 h-4 w-4"/> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleDeleteDoctor(doctor.id, doctor.full_name)} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4"/> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Doctor Details Modal */}
        <DoctorDetailsModal
          doctor={selectedDoctor}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedDoctor(null);
          }}
        />

        {/* Edit Doctor Modal */}
        {editingDoctor && (
          <Dialog open={true} onOpenChange={() => setEditingDoctor(null)}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Doctor Profile</DialogTitle>
                <DialogDescription>Make changes to {editingDoctor.full_name}'s profile.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-name" className="text-right">Full Name</Label>
                    <Input id="edit-name" value={editingDoctor.full_name} onChange={(e) => setEditingDoctor({ ...editingDoctor, full_name: e.target.value })} className="col-span-3"/>
                 </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-email" className="text-right">Email</Label>
                    <Input id="edit-email" type="email" value={editingDoctor.email} onChange={(e) => setEditingDoctor({ ...editingDoctor, email: e.target.value })} className="col-span-3"/>
                 </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-specialization" className="text-right">Specialization</Label>
                    <Input id="edit-specialization" value={editingDoctor.specialization} onChange={(e) => setEditingDoctor({ ...editingDoctor, specialization: e.target.value })} className="col-span-3"/>
                 </div>
              </div>
              <div className="flex gap-2 pt-2">
                 <Button variant="outline" onClick={() => setEditingDoctor(null)}>Cancel</Button>
                 <Button onClick={() => handleUpdateDoctor(editingDoctor)} className="flex-1">Save Changes</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}