import React, { useMemo, useState } from 'react';
import { HeatmapCell, DailyData } from '../types';
import { COLOR_SCALE } from '../constants';
import { processHeatmapData, getDaysInMonth, formatDate, calculateScore } from '../utils';
import { Grid, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeatmapProps {
  data: DailyData[];
}

const DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'year' | 'month'>('year');
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  // --- Year View Logic ---
  const cells = useMemo(() => processHeatmapData(data), [data]);
  const weeks = useMemo(() => {
    const weeksArray: HeatmapCell[][] = [];
    let currentWeek: HeatmapCell[] = [];
    
    // Pad the beginning if the first day isn't Sunday
    if (cells.length > 0) {
        const firstDay = new Date(cells[0].date).getDay();
        for(let i=0; i<firstDay; i++) {
           currentWeek.push({ date: `pad-${i}`, value: -1, level: 0 }); // Padding
        }
    }

    cells.forEach((cell) => {
      currentWeek.push(cell);
      if (currentWeek.length === 7) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    });
    
    if (currentWeek.length > 0) {
      weeksArray.push(currentWeek);
    }
    return weeksArray;
  }, [cells]);

  // --- Month View Logic ---
  const monthCells = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    
    // Create a map of the *entire* dataset for lookup
    const dataMap = new Map<string, DailyData>();
    data.forEach(d => dataMap.set(d.date, d));

    // Determine Max Score for this month (relative scaling) or global? Let's use global max from utils logic to keep colors consistent
    // Re-using the logic from processHeatmapData roughly for levels:
    let maxScore = 0;
    data.forEach(d => {
        const s = calculateScore(d.voiceMinutes, d.messageCount);
        if (s > maxScore) maxScore = s;
    });
    if (maxScore === 0) maxScore = 1;

    const processedDays: HeatmapCell[] = daysInMonth.map(date => {
        const dateStr = formatDate(date);
        const dayData = dataMap.get(dateStr);
        const voice = dayData?.voiceMinutes || 0;
        const msgs = dayData?.messageCount || 0;
        const score = calculateScore(voice, msgs);

        let level: 0|1|2|3|4 = 0;
        if (score > 0) {
            const ratio = score / maxScore;
            if (ratio < 0.25) level = 1;
            else if (ratio < 0.50) level = 2;
            else if (ratio < 0.75) level = 3;
            else level = 4;
        }

        return {
            date: dateStr,
            value: score,
            level,
            data: dayData || { date: dateStr, voiceMinutes: 0, messageCount: 0 }
        };
    });

    // Padding for start of month
    const firstDayOfWeek = daysInMonth[0].getDay();
    const paddedDays = Array(firstDayOfWeek).fill(null).concat(processedDays);
    return paddedDays;

  }, [data, currentMonthDate]);

  const handlePrevMonth = () => {
      const newDate = new Date(currentMonthDate);
      newDate.setMonth(newDate.getMonth() - 1);
      setCurrentMonthDate(newDate);
  };

  const handleNextMonth = () => {
      const newDate = new Date(currentMonthDate);
      newDate.setMonth(newDate.getMonth() + 1);
      setCurrentMonthDate(newDate);
  };

  return (
    <div className="w-full p-4 bg-white rounded-xl shadow-lg border border-rose-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-rose-800">恋爱记录</h2>
        <div className="flex bg-rose-50 p-1 rounded-lg border border-rose-100">
            <button 
                onClick={() => setViewMode('year')}
                className={`p-2 rounded-md transition-all flex items-center gap-2 text-sm font-bold ${viewMode === 'year' ? 'bg-white text-rose-600 shadow-sm' : 'text-rose-400 hover:text-rose-500'}`}
            >
                <Grid size={16} /> 年度
            </button>
            <button 
                onClick={() => setViewMode('month')}
                className={`p-2 rounded-md transition-all flex items-center gap-2 text-sm font-bold ${viewMode === 'month' ? 'bg-white text-rose-600 shadow-sm' : 'text-rose-400 hover:text-rose-500'}`}
            >
                <CalendarIcon size={16} /> 月历
            </button>
        </div>
      </div>

      {viewMode === 'year' ? (
          /* YEAR VIEW (GitHub Style) */
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[800px]">
                <div className="flex">
                <div className="flex flex-col justify-around pt-6 pr-2 text-xs font-semibold text-rose-400 h-[140px]">
                    <span>周一</span>
                    <span>周三</span>
                    <span>周五</span>
                </div>

                <div className="flex flex-col flex-1">
                    <div className="flex mb-2 text-xs text-rose-400 font-semibold relative h-4">
                        {weeks.map((week, i) => {
                            const firstDayOfWeek = week.find(d => d.value !== -1);
                            if (!firstDayOfWeek) return null;
                            const date = new Date(firstDayOfWeek.date);
                            if (date.getDate() <= 7) {
                                return <span key={i} style={{ left: `${i * 15}px` }} className="absolute">{MONTHS[date.getMonth()]}</span>
                            }
                            return null;
                        })}
                    </div>

                    <div className="flex gap-[3px]">
                        {weeks.map((week, i) => (
                        <div key={i} className="flex flex-col gap-[3px]">
                            {week.map((cell, j) => {
                                if (cell.value === -1) return <div key={j} className="w-3 h-3" />;
                                return (
                                    <div
                                        key={cell.date}
                                        className={`w-3 h-3 rounded-sm transition-all duration-200 cursor-pointer ${COLOR_SCALE[cell.level]} hover:ring-2 hover:ring-rose-400 hover:scale-150 z-0 hover:z-10 relative`}
                                        onMouseEnter={() => setHoveredCell(cell)}
                                        onMouseLeave={() => setHoveredCell(null)}
                                    />
                                );
                            })}
                        </div>
                        ))}
                    </div>
                </div>
                </div>
            </div>
          </div>
      ) : (
          /* MONTH VIEW (Calendar Style) */
          <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-4 px-2">
                  <button onClick={handlePrevMonth} className="p-1 hover:bg-rose-100 rounded-full text-rose-500"><ChevronLeft /></button>
                  <span className="font-bold text-rose-800 text-lg">
                      {currentMonthDate.getFullYear()}年 {MONTHS[currentMonthDate.getMonth()]}
                  </span>
                  <button onClick={handleNextMonth} className="p-1 hover:bg-rose-100 rounded-full text-rose-500"><ChevronRight /></button>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center mb-2">
                  {DAYS.map(d => <div key={d} className="text-xs font-bold text-rose-400">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-2">
                  {monthCells.map((cell, i) => {
                      if (!cell) return <div key={i} className="aspect-square" />;
                      return (
                          <div 
                            key={cell.date}
                            className={`aspect-square rounded-lg border border-transparent transition-all duration-200 relative group cursor-pointer flex flex-col items-center justify-center gap-1 ${cell.level > 0 ? COLOR_SCALE[cell.level] : 'bg-gray-50 hover:bg-rose-50'}`}
                            onMouseEnter={() => setHoveredCell(cell)}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                              <span className={`text-xs font-bold ${cell.level > 2 ? 'text-white' : 'text-rose-900'}`}>
                                  {parseInt(cell.date.split('-')[2])}
                              </span>
                              {cell.level > 0 && (
                                  <div className="flex gap-0.5 justify-center">
                                      {cell.data?.voiceMinutes && cell.data.voiceMinutes > 30 ? <div className="w-1 h-1 rounded-full bg-white/80" /> : null}
                                      {cell.data?.messageCount && cell.data.messageCount > 50 ? <div className="w-1 h-1 rounded-full bg-white/80" /> : null}
                                  </div>
                              )}
                          </div>
                      )
                  })}
              </div>
          </div>
      )}

      {/* Footer Legend & Tooltip */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4 border-t border-rose-50 pt-4">
        <div className="flex items-center gap-2 text-xs text-rose-500">
            <span>少</span>
            <div className="flex gap-1">
                {[0,1,2,3,4].map(l => <div key={l} className={`w-3 h-3 rounded-sm ${COLOR_SCALE[l as 0|1|2|3|4]}`}></div>)}
            </div>
            <span>多</span>
        </div>

        <div className="h-6 text-center">
            {hoveredCell && hoveredCell.data && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600 text-white text-xs rounded-full shadow-sm animate-fade-in">
                    <span className="font-bold">{hoveredCell.date}</span>
                    <span className="w-px h-3 bg-white/40 mx-1"></span>
                    <span>通话 {hoveredCell.data.voiceMinutes}m</span>
                    <span>消息 {hoveredCell.data.messageCount}</span>
                </span>
            )}
        </div>
      </div>
    </div>
  );
};