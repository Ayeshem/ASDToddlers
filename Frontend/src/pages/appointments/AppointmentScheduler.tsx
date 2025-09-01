import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAppointmentStore } from "@/store/appointmentStore";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { adminApi, type Doctor, type Child } from "@/services/adminApi";
import { Calendar as CalendarIcon, Clock, Plus, CheckCircle, XCircle, Trash2, AlertTriangle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import type { Appointment } from "@/types";

export default function AppointmentScheduler() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newAppointment, setNewAppointment] = useState({
    doctorId: "",
    childId: "",
    time: "",
    notes: "",
  });

  const user = useAuthStore(state => state.user);
  const { appointments, fetchAppointments, addAppointment, updateAppointment, deleteAppointment, getAppointmentsByDate } = useAppointmentStore();
  const { toast } = useToast();

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  // Fetch all necessary data in correct order
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch doctors & children
        const [doctorsData, childrenData] = await Promise.allSettled([
          adminApi.getAllDoctors(),
          adminApi.getAllChildren()
        ]);

        if (doctorsData.status === 'fulfilled') setDoctors(doctorsData.value);
        else console.error('Failed to fetch doctors:', doctorsData.reason);

        if (childrenData.status === 'fulfilled') setChildren(childrenData.value.children);
        else console.error('Failed to fetch children:', childrenData.reason);

        // Fetch appointments after doctors & children
        await fetchAppointments();
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load appointment data.');
        toast({
          title: "Error",
          description: "Failed to load doctors, children, or appointments.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchAppointments, toast]);

  // Filter children for current user
  const availableChildren = user?.role === 'parent'
    ? children.filter(c => c.parent_id === user.id)
    : children;

  const activeDoctors = doctors.filter(d => d.status === 'active');

  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
  const dayAppointments = (children.length > 0 && doctors.length > 0)
  ? getAppointmentsByDate(selectedDateString)
  : [];

  const getChildName = (childId: string) =>
    children.length === 0
      ? 'Unknown Child'
      : children.find(c => String(c.id) === String(childId))?.name ?? 'Unknown Child';
  
  const getDoctorName = (doctorId: string) =>
    doctors.length === 0
      ? 'Unknown Doctor'
      : doctors.find(d => String(d.id) === String(doctorId))?.full_name ?? 'Unknown Doctor';
    
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-pastel-blue text-blue-700';
      case 'completed': return 'bg-risk-low-bg text-risk-low';
      case 'cancelled': return 'bg-risk-high-bg text-risk-high';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleScheduleAppointment = async () => {
    if (!newAppointment.doctorId || !newAppointment.childId || !newAppointment.time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const child = children.find(c => c.id === newAppointment.childId);
    await addAppointment({
      ...newAppointment,
      parentId: child?.parent_id || '',
      date: selectedDateString,
      status: 'scheduled',
    });

    toast({
      title: "Appointment scheduled",
      description: `Appointment has been scheduled for ${format(selectedDate, 'MMMM dd, yyyy')} at ${newAppointment.time}.`,
    });

    setNewAppointment({ doctorId: "", childId: "", time: "", notes: "" });
    setShowScheduleModal(false);
  };

  const handleUpdateAppointmentStatus = async (appointment: Appointment, newStatus: 'completed' | 'cancelled') => {
    await updateAppointment(appointment.id, { status: newStatus });
    toast({
      title: `Appointment ${newStatus}`,
      description: `The appointment has been marked as ${newStatus}.`,
    });
  };

  const handleDeleteAppointment = async (appointment: Appointment) => {
    await deleteAppointment(appointment.id);
    toast({
      title: "Appointment deleted",
      description: "The appointment has been removed.",
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" text="Loading appointment data..." />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <AlertTriangle className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }




  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Appointment Scheduler</h1>
            <p className="text-muted-foreground">
              Schedule and manage appointments • {activeDoctors.length} active doctors • {availableChildren.length} children
            </p>
          </div>
  
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchAppointments()} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
  
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                Week
              </Button>
              <Button
                variant={viewMode === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('month')}
              >
                Month
              </Button>
            </div>
  
            <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule New Appointment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <div className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
                      <CalendarIcon className="h-4 w-4" />
                      {format(selectedDate, 'MMMM dd, yyyy')}
                    </div>
                  </div>
  
                  <div className="space-y-2">
                    <Label htmlFor="doctor">Doctor *</Label>
                    <Select 
                      value={newAppointment.doctorId} 
                      onValueChange={(value) => setNewAppointment({...newAppointment, doctorId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeDoctors.length === 0 ? (
                          <SelectItem value="" disabled>No active doctors available</SelectItem>
                        ) : (
                          activeDoctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              {doctor.full_name} - {doctor.specialization}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
  
                  <div className="space-y-2">
                    <Label htmlFor="child">Child/Patient *</Label>
                    <Select 
                      value={newAppointment.childId} 
                      onValueChange={(value) => setNewAppointment({...newAppointment, childId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select child" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableChildren.length === 0 ? (
                          <SelectItem value="" disabled>
                            {user?.role === 'parent' ? 'No children found for your account' : 'No children available'}
                          </SelectItem>
                        ) : (
                          availableChildren.map((child) => (
                            <SelectItem key={child.id} value={child.id}>
                              {child.name} {user?.role !== 'parent' && `(Parent ID: ${child.parent_id})`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
  
                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <Select 
                      value={newAppointment.time} 
                      onValueChange={(value) => setNewAppointment({...newAppointment, time: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem 
                            key={time} 
                            value={time}
                            disabled={dayAppointments.some(apt => apt.time === time)}
                          >
                            {time} {dayAppointments.some(apt => apt.time === time) && '(Booked)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newAppointment.notes}
                      onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                      placeholder="Additional notes or instructions"
                    />
                  </div>
  
                  <div className="flex gap-2">
                    <Button onClick={handleScheduleAppointment} className="flex-1">
                      Schedule Appointment
                    </Button>
                    <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
  
        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
  
          {/* Selected Day Schedule */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Schedule for {format(selectedDate, 'MMMM dd, yyyy')}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dayAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No appointments scheduled for this day.</p>
                  <Button variant="outline" className="mt-3" onClick={() => setShowScheduleModal(true)}>
                    Schedule Appointment
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {dayAppointments
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium text-lg">{appointment.time}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        <p className="font-medium">{getChildName(appointment.childId)}</p>
                        <p className="text-sm text-muted-foreground">{getDoctorName(appointment.doctorId)}</p>
                        {appointment.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{appointment.notes}</p>
                        )}
                      </div>
  
                      <div className="flex gap-1">
                        {appointment.status === 'scheduled' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateAppointmentStatus(appointment, 'completed')}
                              className="text-risk-low hover:text-risk-low"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateAppointmentStatus(appointment, 'cancelled')}
                              className="text-risk-high hover:text-risk-high"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAppointment(appointment)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
  
        {/* Upcoming Appointments Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.filter(apt => new Date(apt.date) >= new Date() && apt.status === 'scheduled').length === 0 ? (
              <p className="text-muted-foreground">No upcoming appointments.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {appointments
                  .filter(apt => new Date(apt.date) >= new Date() && apt.status === 'scheduled')
                  .slice(0, 6)
                  .map((appointment) => (
                    <div key={appointment.id} className="p-3 border rounded-lg">
                      <p className="font-medium">{appointment.time}</p>
                      <p className="text-sm text-muted-foreground">{getChildName(appointment.childId)}</p>
                      <p className="text-sm text-muted-foreground">{getDoctorName(appointment.doctorId)}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(appointment.date), 'MMMM dd, yyyy')}</p>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}  