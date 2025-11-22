import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { DailyData, Stats } from '../types';
import { Sparkles } from 'lucide-react';

interface AiReportProps {
  data: DailyData[];
  stats: Stats;
}

export const AiReport: React.FC<AiReportProps> = ({ data, stats }) => {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    if (!process.env.API_KEY) {
        setError("API Key 环境变量缺失。");
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Prepare a summary of data to avoid token limits
      const recentData = data.slice(-30); // Last 30 entries
      
      const prompt = `
        扮演一位浪漫关系分析师。分析这对情侣的微信沟通数据。
        
        总体统计：
        - 总语音时长：${stats.totalVoiceMinutes} 分钟
        - 总消息数：${stats.totalMessages}
        - 最长连续记录：${stats.longestStreak} 天
        - 最忙碌的一天：${stats.maxActivityDate}
        
        最近 30 条记录样本：${JSON.stringify(recentData)}

        任务：为他们写一份甜蜜、有趣且鼓舞人心的“恋爱报告”。
        1. 基于连续记录提及他们的投入程度。
        2. 评论他们是“语音派”（语音多）还是“打字派”（消息多）。
        3. 给他们下周做一个有趣的“情侣运势”预测。
        4. 字数控制在 150 字以内。使用表情符号。语气：粉红、活泼、浪漫。请用中文回答。
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setReport(response.text || "无法生成报告。");
    } catch (err) {
      console.error(err);
      setError("无法连接到恋爱卫星 (API 错误)。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-rose-100 to-pink-50 p-6 rounded-xl shadow-lg border border-rose-200 relative overflow-hidden">
       {/* Decorative background icon */}
       <div className="absolute -right-4 -top-4 text-rose-200 opacity-50">
         <Sparkles size={100} />
       </div>

      <h3 className="text-lg font-bold text-rose-800 mb-2 flex items-center gap-2">
        <Sparkles className="text-rose-500" size={20} /> 
        AI 恋爱分析师
      </h3>
      
      {!report && !loading && (
          <p className="text-rose-700 text-sm mb-4">
              使用 Gemini AI 解锁你们的关系洞察。
          </p>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-4 text-rose-500 animate-pulse">
            <Sparkles className="animate-spin mb-2" />
            <span className="text-sm font-semibold">正在咨询丘比特...</span>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm bg-red-50 p-2 rounded mb-2">{error}</p>
      )}

      {report && (
        <div className="bg-white/60 p-4 rounded-lg text-rose-900 text-sm leading-relaxed shadow-sm border border-rose-100 mb-4">
            {report}
        </div>
      )}

      {!loading && (
        <button 
            onClick={generateReport} 
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-lg shadow transition-transform active:scale-95"
        >
            {report ? '重新生成报告' : '生成恋爱报告'}
        </button>
      )}
    </div>
  );
};