import { create } from 'zustand';
import { doctorApi, type Doctor, type CreateDoctorRequest, type UpdateDoctorRequest } from '@/services/doctorApi';

interface DoctorState {
  doctors: Doctor[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchDoctors: () => Promise<void>;
  addDoctor: (data: CreateDoctorRequest) => Promise<boolean>;
  updateDoctor: (id: string, updates: UpdateDoctorRequest) => Promise<boolean>;
  deleteDoctor: (id: string) => Promise<boolean>;
  toggleDoctorStatus: (id: string) => Promise<boolean>;
  getDoctorById: (id: string) => Promise<Doctor | null>;
  clearError: () => void;
}

export const useDoctorStore = create<DoctorState>((set, get) => ({
  doctors: [],
  isLoading: false,
  error: null,

  fetchDoctors: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const doctors = await doctorApi.getAllDoctors();
      set({ doctors, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch doctors';
      set({ error: errorMessage, isLoading: false });
    }
  },

  addDoctor: async (data: CreateDoctorRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      await doctorApi.createDoctor(data);
      
      // Fetch updated doctors list
      await get().fetchDoctors();
      
      set({ isLoading: false });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add doctor';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  updateDoctor: async (id: string, updates: UpdateDoctorRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      await doctorApi.updateDoctor(id, updates);
      
      // Fetch updated doctors list
      await get().fetchDoctors();
      
      set({ isLoading: false });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update doctor';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  deleteDoctor: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await doctorApi.deleteDoctor(id);
      
      // Fetch updated doctors list
      await get().fetchDoctors();
      
      set({ isLoading: false });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete doctor';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  toggleDoctorStatus: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await doctorApi.toggleDoctorStatus(id);
      
      // Fetch updated doctors list
      await get().fetchDoctors();
      
      set({ isLoading: false });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle doctor status';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  getDoctorById: async (id: string) => {
    try {
      const doctor = await doctorApi.getDoctorById(id);
      return doctor;
    } catch (error) {
      console.error('Failed to get doctor by ID:', error);
      return null;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));