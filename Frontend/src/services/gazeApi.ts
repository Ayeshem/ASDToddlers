const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export type SessionStatus = {
  processing: boolean;
  session: {
    child_id: string;
    stimulus_id: string;
    session_type: string;
  } | null;
};

export type GazeResult = {
  id: number;
  child_id: string;
  predicted_class: string;
  confidence: number;
  risk_level: string;
  scanpath_path: string;
  heatmap_path: string;
  gaze_data_path: string;
  created_at: string;
};

export const gazeApi = {
  listResults: async (): Promise<GazeResult[]> => {
    const res = await fetch(`${API_BASE_URL}/results`);
    if (!res.ok) throw new Error('Failed to list results');
    return res.json();
  },
  // Start session
  startSession: async (data: {
    child_id: string;
    stimulus_id: string;
    session_type?: string;
  }) => {
    const res = await fetch(`${API_BASE_URL}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error('Failed to start gaze session');
    }

    return res.json();
  },

  // Get processing status
  getSessionStatus: async (): Promise<SessionStatus> => {
    const res = await fetch(`${API_BASE_URL}/status`);
    return res.json();
  },

  // Stop session (new)
  stopSession: async () => {
    const res = await fetch(`${API_BASE_URL}/stop`, {
      method: 'POST',
    });

    if (!res.ok) {
      throw new Error('Failed to stop session');
    }

    return res.json();
  },

  // Get results for a child
  getResult: async (childId: string): Promise<GazeResult> => {
    const res = await fetch(`${API_BASE_URL}/get-report/${childId}`);
    if (res.status === 202) {
      // Backend is still writing results; signal caller to retry
      throw new Error('PROCESSING');
    }
    if (!res.ok) {
      throw new Error('Result not found');
    }
    return res.json();
  },

  // Get scanpath image URL (optional helper)
  getScanpathImageUrl: (childId: string): string =>
    `${API_BASE_URL}/scanpath/${childId}`,
};
