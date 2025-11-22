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
};
