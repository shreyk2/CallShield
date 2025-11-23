export type RiskLevel = 'SAFE' | 'UNCERTAIN' | 'HIGH_RISK' | 'INITIAL';

export interface SessionResponse {
  session_id: string;
  user_id: string;
  agent_prompt: string;
}

export interface RiskResponse {
  match_score: number;
  fake_score: number;
  status: RiskLevel;
  status_reason: string;
  num_verifications?: number;
}

export interface SessionStatus {
  session_id: string;
  user_id: string;
  status: 'active' | 'completed' | 'error';
  active: boolean;
  start_time: number;
  elapsed_time: number;
}

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  chunkSize: number;
}
