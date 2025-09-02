import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Search,
} from "lucide-react";

// --- Custom hook for debouncing input ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export function DoctorManagementTab() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

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

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => 
        doctor.full_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        doctor.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [doctors, debouncedSearchQuery]);

  const renderContent = () => {
      if (isLoading) {
          return (
              <div className="flex items-center justify-center py-16">
                  <LoadingSpinner size="lg" text="Loading doctors..." />
              </div>
          );
      }

      if (error) {
          return (
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
          );
      }

      if (doctors.length === 0) {
          return (
              <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Doctors Found</h3>
                  <p className="text-sm mb-4">Get started by adding the first doctor to your system.</p>
                  <Button onClick={() => setShowAddDoctorModal(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add First Doctor
                  </Button>
              </div>
          );
      }

      if (filteredDoctors.length === 0) {
        return (
          <div className="text-center py-16 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Matching Doctors</h3>
              <p className="text-sm mb-4">Try adjusting your search criteria.</p>
          </div>
        );
      }
      
      return (
          <div className="space-y-4">
              {filteredDoctors.map((doctor) => (
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
      );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Doctor Stats Cards - These are already consistent */}
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
                    <div className="text-2xl font-bold text-green-600">{doctors.filter(d => d.status === 'active').length}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Specializations</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{new Set(doctors.map(d => d.specialization)).size}</div>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[250px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, or specialization..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <Button variant="outline" onClick={fetchDoctors} disabled={isLoading}>
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
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
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>

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