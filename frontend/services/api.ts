import { SessionStatus, SessionResponse, RiskResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiService = {
  async createSession(userId: string): Promise<SessionResponse> {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create session');
    }

    return response.json();
  },

  async getSessionRisk(sessionId: string): Promise<RiskResponse> {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/risk`);
    
    if (!response.ok) {
      throw new Error('Failed to get risk assessment');
    }

    return response.json();
  },

  async enrollUser(userId: string, name: string, audioBlob: Blob): Promise<any> {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('name', name);
    formData.append('audio', audioBlob, 'enrollment.wav');

    const response = await fetch(`${API_BASE_URL}/enrollment/create`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Enrollment failed');
    }

    return response.json();
  },
};
