import { SessionStatus } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiService = {
  async createSession(): Promise<SessionStatus> {
    // TODO: Implement session creation
    return {
      session_id: 'mock-session-id',
      status: 'active',
      start_time: new Date().toISOString(),
    };
  },

  async getSessionStatus(sessionId: string): Promise<SessionStatus> {
    // TODO: Implement status polling
    return {
      session_id: sessionId,
      status: 'active',
      start_time: new Date().toISOString(),
    };
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
