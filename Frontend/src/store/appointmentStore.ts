import { create } from 'zustand';
import type { Appointment } from '@/types';
import axios from 'axios';

interface AppointmentState {
  appointments: Appointment[];
  fetchAppointments: () => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  getAppointmentsByDate: (date: string) => Appointment[];
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],

  // Fetch all appointments from backend
  fetchAppointments: async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/appointments');
      if (response.status === 200) {
        const appointments: Appointment[] = response.data.map((appt: any) => ({
          id: appt.id.toString(),
          parentId: appt.parent_id,
          doctorId: appt.doctor_id,
          childId: appt.child_id,
          date: appt.date,
          time: appt.time,
          status: appt.status,
          notes: appt.notes || '',
        }));
        set({ appointments });
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  },

  addAppointment: async (appointment) => {
    const payload = {
      parent_id: appointment.parentId,
      doctor_id: appointment.doctorId,
      child_id: appointment.childId,
      date: appointment.date,
      time: appointment.time,
      notes: appointment.notes || '',
    };

    try {
      const response = await axios.post('http://127.0.0.1:8000/appointments', payload);
      if (response.status === 201) {
        const newAppointment: Appointment = {
          ...appointment,
          id: response.data.appointment_id.toString(),
        };
        set((state) => ({
          appointments: [...state.appointments, newAppointment],
        }));
      } else {
        console.error('Failed to save appointment:', response.data);
      }
    } catch (err) {
      console.error('Error saving appointment:', err);
    }
  },

  updateAppointment: async (id, updates) => {
    const payload = {
      parent_id: updates.parentId,
      doctor_id: updates.doctorId,
      child_id: updates.childId,
      date: updates.date,
      time: updates.time,
      notes: updates.notes,
      status: updates.status,
    };
    try {
      await axios.put(`http://127.0.0.1:8000/appointments/${id}`, payload);
      set((state) => ({
        appointments: state.appointments.map((appt) =>
          appt.id === id ? { ...appt, ...updates } : appt
        ),
      }));
    } catch (err) {
      console.error('Error updating appointment:', err);
    }
  },

  deleteAppointment: async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/appointments/${id}`);
      set((state) => ({
        appointments: state.appointments.filter((appt) => appt.id !== id),
      }));
    } catch (err) {
      console.error('Error deleting appointment:', err);
    }
  },

  getAppointmentsByDate: (date) => {
    return get().appointments.filter((appt) => appt.date === date);
  },
}));
