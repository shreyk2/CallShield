export type RiskLevel = 'SAFE' | 'UNCERTAIN' | 'HIGH_RISK' | 'INITIAL';

export interface RiskScore {
  level: RiskLevel;
  score: number; // 0-100
  voice_match_score: number;
  deepfake_probability: number;
  timestamp: string;
}

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
}

export interface SessionStatus {
  session_id: string;
  status: 'active' | 'completed' | 'error';
  start_time: string;
}

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  chunkSize: number;
}
