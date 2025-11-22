import React, { useMemo } from 'react';
import { DailyData, Stats } from '../types';
import { getRadarStats, getTrendData, formatDate } from '../utils';
import { TrendingUp, Activity } from 'lucide-react';

interface AnalysisChartsProps {
  data: DailyData[];
  stats: Stats;
}

export const AnalysisCharts: React.FC<AnalysisChartsProps> = ({ data, stats }) => {
  const radar = useMemo(() => getRadarStats(data, stats), [data, stats]);
  const trendData = useMemo(() => getTrendData(data), [data]);

  // --- Radar Chart Helpers ---
  // Center 100, 100. Radius 80.
  const angleToPoint = (angle: number, value: number) => {
    const r = (value / 100) * 80;
    const x = 100 + r * Math.cos(angle - Math.PI / 2);
    const y = 100 + r * Math.sin(angle - Math.PI / 2);
    return `${x},${y}`;
  };

  const radarPoints = [
    angleToPoint(0, radar.streak),          // Top: 连续 (Streak)
    angleToPoint(Math.PI / 2, radar.msg),   // Right: 消息 (Msg)
    angleToPoint(Math.PI, radar.intimacy),  // Bottom: 亲密 (Intimacy)
    angleToPoint(3 * Math.PI / 2, radar.voice) // Left: 语音 (Voice)
  ].join(' ');

  // --- Trend Chart Helpers ---
  // Width 100%, Height 100px. 
  const trendMax = Math.max(
      ...trendData.map(d => Math.max(d.voiceMinutes, d.messageCount / 5)), // Scale messages down by 5 for visibility overlap
      10
  );
  
  const getX = (i: number) => (i / (trendData.length - 1 || 1)) * 100;
  const getY = (val: number) => 100 - (val / trendMax) * 80; // Leave 20px padding bottom

  const voicePoints = trendData.map((d, i) => `${getX(i)},${getY(d.voiceMinutes)}`).join(' ');
  const msgPoints = trendData.map((d, i) => `${getX(i)},${getY(d.messageCount / 5)}`).join(' '); // Scale messages for display

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Card 1: 4D Radar */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-rose-100 flex flex-col items-center relative overflow-hidden">
            <h3 className="text-rose-800 font-bold mb-4 flex items-center gap-2 w-full">
                <Activity size={18} className="text-rose-500"/> 四维恋爱指数
            </h3>
            
            <div className="relative w-64 h-52">
                <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
                    {/* Background Grid */}
                    {[20, 40, 60, 80, 100].map(r => (
                        <circle key={r} cx="100" cy="100" r={r * 0.8} fill="none" stroke="#ffe4e6" strokeWidth="1" />
                    ))}
                    {/* Axes */}
                    <line x1="100" y1="20" x2="100" y2="180" stroke="#ffe4e6" strokeWidth="1" />
                    <line x1="20" y1="100" x2="180" y2="100" stroke="#ffe4e6" strokeWidth="1" />

                    {/* Data Shape */}
                    <polygon points={radarPoints} fill="rgba(244, 63, 94, 0.2)" stroke="#e11d48" strokeWidth="2" />
                    
                    {/* Labels */}
                    <text x="100" y="15" textAnchor="middle" className="text-[10px] fill-rose-600 font-bold">长情 (streak)</text>
                    <text x="190" y="105" textAnchor="start" className="text-[10px] fill-rose-600 font-bold">话痨 (msg)</text>
                    <text x="100" y="195" textAnchor="middle" className="text-[10px] fill-rose-600 font-bold">亲密 (score)</text>
                    <text x="10" y="105" textAnchor="end" className="text-[10px] fill-rose-600 font-bold">煲粥 (voice)</text>

                    {/* Value dots */}
                     {[
                        {val: radar.streak, angle: 0},
                        {val: radar.msg, angle: Math.PI/2},
                        {val: radar.intimacy, angle: Math.PI},
                        {val: radar.voice, angle: 3*Math.PI/2}
                    ].map((p, i) => {
                        const coords = angleToPoint(p.angle, p.val);
                        const [cx, cy] = coords.split(',');
                        return <circle key={i} cx={cx} cy={cy} r="3" fill="#be123c" />
                    })}
                </svg>
            </div>
            <div className="mt-2 text-xs text-rose-400 text-center">
                基于近30天数据与历史平均值对比分析
            </div>
        </div>

        {/* Card 2: Trend Line */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-rose-100 flex flex-col">
            <h3 className="text-rose-800 font-bold mb-6 flex items-center gap-2">
                <TrendingUp size={18} className="text-rose-500"/> 近14天走势
            </h3>
            
            <div className="flex-1 w-full h-40 relative">
                 {trendData.length > 1 ? (
                     <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                        {/* Grid Lines */}
                        <line x1="0" y1="20" x2="100" y2="20" stroke="#fff1f2" strokeWidth="0.5" />
                        <line x1="0" y1="60" x2="100" y2="60" stroke="#fff1f2" strokeWidth="0.5" />
                        <line x1="0" y1="100" x2="100" y2="100" stroke="#ffe4e6" strokeWidth="1" />

                        {/* Voice Line */}
                        <polyline points={voicePoints} fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        
                        {/* Messages Line */}
                        <polyline points={msgPoints} fill="none" stroke="#fda4af" strokeWidth="2" strokeLinecap="round" strokeDasharray="4,2" strokeLinejoin="round" />

                        {/* Dots at ends */}
                         {(() => {
                             const lastIdx = trendData.length - 1;
                             const lastV = trendData[lastIdx].voiceMinutes;
                             const lastM = trendData[lastIdx].messageCount / 5;
                             return (
                                 <>
                                    <circle cx="100" cy={getY(lastV)} r="2" fill="#e11d48" />
                                    <circle cx="100" cy={getY(lastM)} r="2" fill="#fda4af" />
                                 </>
                             )
                         })()}
                     </svg>
                 ) : (
                     <div className="h-full flex items-center justify-center text-rose-300 text-sm">需要更多数据...</div>
                 )}
            </div>

            <div className="mt-4 flex justify-center gap-6 text-xs font-bold">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-1 bg-rose-600 rounded-full"></span>
                    <span className="text-rose-700">语音时长</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-1 bg-rose-300 border border-rose-300 border-dashed rounded-full"></span>
                    <span className="text-rose-400">消息数量 (÷5)</span>
                </div>
            </div>
        </div>
    </div>
  );
};