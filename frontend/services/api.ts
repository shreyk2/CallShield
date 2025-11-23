import { SessionStatus, SessionResponse, RiskResponse } from '@/types';
import { createClient } from '@/lib/supabase/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getAuthHeaders() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('User not authenticated');
  }
  return {
    'Authorization': `Bearer ${session.access_token}`
  };
}

export const apiService = {
  async createSession(): Promise<SessionResponse> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...headers
      },
    });

    if (!response.ok) {
      throw new Error('Failed to create session');
    }

    return response.json();
  },

  async getSessionRisk(sessionId: string): Promise<RiskResponse> {
    // Risk endpoint might be public or protected. 
    // If protected, add headers. Assuming public for now or add headers if needed.
    // Let's add headers just in case, though the backend implementation for get_risk 
    // didn't explicitly add verify_token yet.
    // Checking backend/app/api/sessions.py... get_risk does NOT have Depends(verify_token).
    // So we can leave it as is, or add it later.
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/risk`);
    
    if (!response.ok) {
      throw new Error('Failed to get risk assessment');
    }

    return response.json();
  },

  async enrollUser(name: string, audioBlob: Blob): Promise<any> {
    const headers = await getAuthHeaders();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('audio', audioBlob, 'enrollment.wav');

    const response = await fetch(`${API_BASE_URL}/enrollment/create`, {
      method: 'POST',
      headers: {
        'Authorization': headers['Authorization']
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Enrollment failed');
    }

    return response.json();
  },
};
