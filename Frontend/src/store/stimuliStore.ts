import { create } from "zustand";
import { stimuliApi, type StimuliVideo, type CreateStimuliRequest, type UpdateStimuliRequest } from "@/services/stimuliApi";

interface StimuliState {
  stimuli: StimuliVideo[];
  isLoading: boolean;
  error: string | null;
  fetchStimuli: () => Promise<void>;
  addStimuli: (data: CreateStimuliRequest) => Promise<boolean>;
  updateStimuli: (id: string, data: UpdateStimuliRequest) => Promise<boolean>;
  deleteStimuli: (id: string) => Promise<boolean>;
  getStimuliById: (id: string) => Promise<StimuliVideo | null>;
  clearError: () => void;
}

export const useStimuliStore = create<StimuliState>((set, get) => ({
  stimuli: [],
  isLoading: false,
  error: null,

  fetchStimuli: async () => {
    set({ isLoading: true, error: null });
    try {
      const stimuli = await stimuliApi.getAllStimuli();
      // Ensure stimuli is always an array
      const stimuliArray = Array.isArray(stimuli) ? stimuli : [];
      set({ stimuli: stimuliArray, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch stimuli", 
        isLoading: false
        // Don't reset stimuli to empty array on error to prevent re-fetching
      });
    }
  },

  addStimuli: async (data: CreateStimuliRequest) => {
    set({ isLoading: true, error: null });
    try {
      await stimuliApi.createStimuli(data);
      await get().fetchStimuli(); // Refresh the list
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Failed to add stimuli", 
        isLoading: false 
      });
      return false;
    }
  },

  updateStimuli: async (id: string, data: UpdateStimuliRequest) => {
    set({ isLoading: true, error: null });
    try {
      await stimuliApi.updateStimuli(id, data);
      await get().fetchStimuli(); // Refresh the list
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Failed to update stimuli", 
        isLoading: false 
      });
      return false;
    }
  },

  deleteStimuli: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await stimuliApi.deleteStimuli(id);
      await get().fetchStimuli(); // Refresh the list
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Failed to delete stimuli", 
        isLoading: false 
      });
      return false;
    }
  },

  getStimuliById: async (id: string) => {
    try {
      const stimuli = await stimuliApi.getStimuliById(id);
      return stimuli;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Failed to get stimuli", 
        isLoading: false 
      });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));