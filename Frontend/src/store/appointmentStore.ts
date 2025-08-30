import { create } from 'zustand';
import type { Appointment } from '@/types';

interface AppointmentState {
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  getAppointmentsByDate: (date: string) => Appointment[];
}

// Mock data
const mockAppointments: Appointment[] = [
  {
    id: '1',
    doctorId: '2',
    childId: '1',
    parentId: '1',
    date: '2024-07-15',
    time: '10:00',
    status: 'scheduled',
    notes: 'Follow-up assessment',
  },
  {
    id: '2',
    doctorId: '2',
    childId: '2',
    parentId: '1',
    date: '2024-07-16',
    time: '14:30',
    status: 'scheduled',
    notes: 'Initial consultation',
  },
];

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: mockAppointments,
  
  addAppointment: (appointment) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString(),
    };
    set(state => ({
      appointments: [...state.appointments, newAppointment],
    }));
  },
  
  updateAppointment: (id, updates) => {
    set(state => ({
      appointments: state.appointments.map(appointment =>
        appointment.id === id ? { ...appointment, ...updates } : appointment
      ),
    }));
  },
  
  deleteAppointment: (id) => {
    set(state => ({
      appointments: state.appointments.filter(appointment => appointment.id !== id),
    }));
  },
  
  getAppointmentsByDate: (date) => {
    return get().appointments.filter(appointment => appointment.date === date);
  },
}));