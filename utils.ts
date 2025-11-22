import { DailyData, HeatmapCell } from './types';
import { WEIGHTS } from './constants';

export const calculateScore = (voice: number, messages: number): number => {
  return (voice * WEIGHTS.VOICE_MULTIPLIER) + (messages * WEIGHTS.MESSAGE_MULTIPLIER);
};

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const generateMockData = (): DailyData[] => {
  const data: DailyData[] = [];
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Randomize data with some "gaps" for realism
    const isActive = Math.random() > 0.1; 
    const voiceMinutes = isActive ? Math.floor(Math.random() * 120) : 0; // 0-2 hours
    const messageCount = isActive ? Math.floor(Math.random() * 300) : 0; // 0-300 msgs

    data.push({
      date: formatDate(date),
      voiceMinutes,
      messageCount,
    });
  }
  return data.reverse();
};

export const processHeatmapData = (rawData: DailyData[]): HeatmapCell[] => {
  // Create a map for quick lookup
  const dataMap = new Map(rawData.map(d => [d.date, d]));
  
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364); // Last 365 days

  // 1. Calculate max score to normalize levels
  let maxScore = 0;
  rawData.forEach(d => {
    const score = calculateScore(d.voiceMinutes, d.messageCount);
    if (score > maxScore) maxScore = score;
  });

  if (maxScore === 0) maxScore = 1; // Prevent divide by zero

  const cells: HeatmapCell[] = [];
  
  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = formatDate(d);
    const dayData = dataMap.get(dateStr);
    const voice = dayData?.voiceMinutes || 0;
    const msgs = dayData?.messageCount || 0;
    const score = calculateScore(voice, msgs);

    // Determine level (0-4)
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (score > 0) {
        const ratio = score / maxScore;
        if (ratio < 0.25) level = 1;
        else if (ratio < 0.50) level = 2;
        else if (ratio < 0.75) level = 3;
        else level = 4;
    }

    cells.push({
      date: dateStr,
      value: score,
      level,
      data: dayData || { date: dateStr, voiceMinutes: 0, messageCount: 0 },
    });
  }

  return cells;
};

export const calculateStats = (data: DailyData[]) => {
    let totalVoice = 0;
    let totalMsgs = 0;
    let maxScore = 0;
    let maxDate = '';
    let currentStreak = 0;
    let longestStreak = 0;

    // sort by date
    const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sorted.forEach(d => {
        totalVoice += d.voiceMinutes;
        totalMsgs += d.messageCount;
        
        const score = calculateScore(d.voiceMinutes, d.messageCount);
        if (score > maxScore) {
            maxScore = score;
            maxDate = d.date;
        }

        if (score > 0) {
            currentStreak++;
        } else {
            if (currentStreak > longestStreak) longestStreak = currentStreak;
            currentStreak = 0;
        }
    });
    
    // Final streak check
    if (currentStreak > longestStreak) longestStreak = currentStreak;

    return {
        totalVoiceMinutes: totalVoice,
        totalMessages: totalMsgs,
        longestStreak,
        maxActivityDate: maxDate,
        totalDaysLogged: sorted.length
    };
};

// Helper for Monthly View
export const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
};

// Helpers for Radar/Analysis Charts
export const getRadarStats = (data: DailyData[], stats: any) => {
    if (data.length === 0) return { voice: 0, msg: 0, streak: 0, intimacy: 0 };

    // 1. 话痨指数 (Messages) - Benchmarked against 200 msgs/day avg
    const avgMsgs = stats.totalMessages / (data.length || 1);
    const msgScore = Math.min(100, (avgMsgs / 200) * 100);

    // 2. 煲粥指数 (Voice) - Benchmarked against 60 mins/day avg
    const avgVoice = stats.totalVoiceMinutes / (data.length || 1);
    const voiceScore = Math.min(100, (avgVoice / 60) * 100);

    // 3. 长情指数 (Streak) - Benchmarked against 14 days streak
    const streakScore = Math.min(100, (stats.longestStreak / 14) * 100);

    // 4. 亲密指数 (Overall Intensity) - Recent 7 days intensity vs historical average
    const recentData = data.slice(-7);
    const recentAvgScore = recentData.reduce((acc, cur) => acc + calculateScore(cur.voiceMinutes, cur.messageCount), 0) / (recentData.length || 1);
    // Arbitrary max score benchmark of 100 points per day
    const intimacyScore = Math.min(100, (recentAvgScore / 100) * 100); 

    return {
        msg: Math.round(msgScore),
        voice: Math.round(voiceScore),
        streak: Math.round(streakScore),
        intimacy: Math.round(intimacyScore)
    };
};

export const getTrendData = (data: DailyData[]) => {
    // Get last 14 days
    const recent = data.slice(-14);
    // Fill gaps if data is missing for last 14 days
    // For simplicity in this mock, we just use what we have
    return recent;
};