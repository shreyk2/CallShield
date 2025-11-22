export type RiskLevel = 'SAFE' | 'UNCERTAIN' | 'HIGH_RISK';

export interface RiskScore {
  level: RiskLevel;
  score: number; // 0-100
  voice_match_score: number;
  deepfake_probability: number;
  timestamp: string;
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
