import { create } from 'zustand';
import { childrenApi, type Child, type CreateChildRequest, type UpdateChildRequest } from '@/services/childrenApi';
import { useAuthStore } from './authStore';

interface ChildrenState {
  children: Child[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchChildren: (parentId: string) => Promise<void>;
  addChild: (parentId: string, data: CreateChildRequest) => Promise<boolean>;
  updateChild: (parentId: string, childId: string, data: UpdateChildRequest) => Promise<boolean>;
  deleteChild: (parentId: string, childId: string) => Promise<boolean>;
  getChildById: (childId: string) => Promise<Child | null>;
  clearError: () => void;
}

export const useChildrenStore = create<ChildrenState>((set, get) => ({
  children: [],
  isLoading: false,
  error: null,

  fetchChildren: async (parentId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const children = await childrenApi.getChildrenByParent(parentId);
      const normalized = children.map((c) => ({
        ...c,
        id: String((c as any).id),
      }));
      set({ children: normalized, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch children';
      set({ error: errorMessage, isLoading: false });
    }
  },

  addChild: async (parentId: string, data: CreateChildRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await childrenApi.addChild(parentId, data);
      
      // Fetch updated children list
      await get().fetchChildren(parentId);
      
      set({ isLoading: false });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add child';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  updateChild: async (parentId: string, childId: string, data: UpdateChildRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      await childrenApi.updateChild(parentId, childId, data);
      
      // Fetch updated children list
      await get().fetchChildren(parentId);
      
      set({ isLoading: false });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update child';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  deleteChild: async (parentId: string, childId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await childrenApi.deleteChild(parentId, childId);
      
      // Fetch updated children list
      await get().fetchChildren(parentId);
      
      set({ isLoading: false });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete child';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  getChildById: async (childId: string) => {
    try {
      const child = await childrenApi.getChildById(childId);
      return { ...child, id: String((child as any).id) };
    } catch (error) {
      console.error('Failed to get child by ID:', error);
      return null;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));