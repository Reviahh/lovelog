import React, { useState, useEffect, useMemo } from 'react';
import { DailyData } from './types';
import { Heatmap } from './components/Heatmap';
import { DataInput } from './components/DataInput';
import { AnalysisCharts } from './components/AnalysisCharts';
import { calculateStats, generateMockData } from './utils';
import { Heart, Phone, MessageCircle, Flame, Calendar } from 'lucide-react';

const App = () => {
  const [data, setData] = useState<DailyData[]>([]);

  // Initialize with some mock data if empty (optional, for UX)
  useEffect(() => {
    const saved = localStorage.getItem('lovelog_data');
    if (saved) {
        setData(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
      if (data.length > 0) {
        localStorage.setItem('lovelog_data', JSON.stringify(data));
      }
  }, [data]);

  const handleAddData = (newData: DailyData) => {
    setData(prev => {
        // Remove existing entry for same date if exists
        const filtered = prev.filter(d => d.date !== newData.date);
        return [...filtered, newData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
  };

  const handleImport = (newData: DailyData[]) => {
      // Naive merge
      setData(newData);
  };
  
  const loadDemoData = () => {
      const mock = generateMockData();
      setData(mock);
  };

  const stats = useMemo(() => calculateStats(data), [data]);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-rose-600 flex items-center justify-center gap-3 mb-2">
          <Heart className="fill-rose-500 animate-pulse" size={40} />
          LoveLog 恋爱日志
        </h1>
        <p className="text-rose-400 font-medium">可视化我们故事的每一分钟和每一条消息。</p>
      </header>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-rose-100 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
            <div className="bg-rose-100 p-3 rounded-full mb-2 text-rose-500">
                <Phone size={24} />
            </div>
            <span className="text-2xl font-bold text-rose-800">
                {Math.floor(stats.totalVoiceMinutes / 60)}小时 {stats.totalVoiceMinutes % 60}分
            </span>
            <span className="text-xs text-rose-400 uppercase tracking-wider font-bold">语音时长</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-rose-100 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
            <div className="bg-pink-100 p-3 rounded-full mb-2 text-pink-500">
                <MessageCircle size={24} />
            </div>
            <span className="text-2xl font-bold text-rose-800">{stats.totalMessages.toLocaleString()}</span>
            <span className="text-xs text-rose-400 uppercase tracking-wider font-bold">消息数量</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-rose-100 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
            <div className="bg-red-100 p-3 rounded-full mb-2 text-red-500">
                <Flame size={24} />
            </div>
            <span className="text-2xl font-bold text-rose-800">{stats.longestStreak} 天</span>
            <span className="text-xs text-rose-400 uppercase tracking-wider font-bold">最长连续记录</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-rose-100 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
            <div className="bg-rose-100 p-3 rounded-full mb-2 text-rose-500">
                <Calendar size={24} />
            </div>
            <span className="text-xl font-bold text-rose-800">{stats.maxActivityDate || '-'}</span>
            <span className="text-xs text-rose-400 uppercase tracking-wider font-bold">最活跃的一天</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left: Heatmap & Analysis (Takes up 2/3 space on large screens) */}
          <div className="lg:col-span-3">
             <div className="flex justify-between items-center mb-4">
                {/* Replaced by component internal header */}
             </div>
             {/* 1. The Heatmap with Toggle */}
             <div className="mb-8">
                 <Heatmap data={data} />
                 {data.length === 0 && (
                    <button onClick={loadDemoData} className="mt-2 text-sm text-rose-500 hover:underline">点击加载演示数据 (Demo)</button>
                 )}
             </div>
             
             {/* 2. The New Analysis Charts */}
             <AnalysisCharts data={data} stats={stats} />
          </div>

          {/* Bottom: Data Management */}
          <div className="lg:col-span-3">
            <h2 className="text-xl font-bold text-rose-800 mb-4">数据管理</h2>
            <DataInput data={data} onAddData={handleAddData} onImportJson={handleImport} />
          </div>
      </div>
      
      <footer className="text-center text-rose-300 text-sm pb-8">
        <p>Made with ❤️ using React & Tailwind</p>
      </footer>
    </div>
  );
};

export default App;