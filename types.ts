export interface DailyData {
  date: string; // YYYY-MM-DD
  voiceMinutes: number;
  messageCount: number;
}

export interface Stats {
  totalVoiceMinutes: number;
  totalMessages: number;
  longestStreak: number;
  maxActivityDate: string;
  totalDaysLogged: number;
}

export interface ContributionLevel {
  level: 0 | 1 | 2 | 3 | 4;
  color: string;
  minScore: number;
}

export interface HeatmapCell {
  date: string;
  value: number;
  level: 0 | 1 | 2 | 3 | 4;
  data?: DailyData;
}
