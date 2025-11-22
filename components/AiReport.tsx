import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { DailyData, Stats } from '../types';
import { Sparkles, Key } from 'lucide-react';

// Ensure TypeScript doesn't complain about process if types aren't available
declare const process: any;

interface AiReportProps {
  data: DailyData[];
  stats: Stats;
}

export const AiReport: React.FC<AiReportProps> = ({ data, stats }) => {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Safely try to get the API key from process.env without crashing browser
      let apiKey = '';
      try {
        if (typeof process !== 'undefined' && process.env) {
          apiKey = process.env.API_KEY || '';
        }
      } catch (e) {
        // Ignore ReferenceError if process is not defined
      }

      // 2. If key is missing, try the AI Studio secure key selector (Preview Environment specific)
      const aiStudio = (window as any).aistudio;
      if (!apiKey && aiStudio) {
          try {
              const hasKey = await aiStudio.hasSelectedApiKey();
              if (!hasKey) {
                  await aiStudio.openSelectKey();
              }
              // In some environments, the key is injected into process.env AFTER selection
              // In others, we might need to wait or it's handled internally by a proxy.
              // We re-check process.env safely.
              if (typeof process !== 'undefined' && process.env) {
                  apiKey = process.env.API_KEY || '';
              }
          } catch (e) {
              console.error("Key selection failed:", e);
          }
      }

      if (!apiKey) {
          if ((window as any).aistudio) {
            setError("请点击下方按钮连接 Google 账号以获取 API 权限。");
          } else {
            setError("未检测到 API Key。请确保环境变量 API_KEY 已配置。");
          }
          setLoading(false);
          return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
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
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('API key')) {
         setError("API Key 无效或未授权。");
      } else {
         setError("无法连接到恋爱卫星 (API 错误)。");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConnectKey = async () => {
      const aiStudio = (window as any).aistudio;
      if (aiStudio) {
          try {
              await aiStudio.openSelectKey();
              setError(null); 
          } catch (e) {
              console.error(e);
          }
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
      
      {!report && !loading && !error && (
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
        <div className="mb-4">
            <p className="text-red-500 text-sm bg-red-50 p-2 rounded mb-2 border border-red-100">{error}</p>
            {(window as any).aistudio && error.includes('连接') && (
                <button 
                    onClick={handleConnectKey}
                    className="text-xs flex items-center gap-1 text-rose-600 font-bold hover:underline"
                >
                    <Key size={12} /> 点击此处连接/更换 API Key
                </button>
            )}
        </div>
      )}

      {report && (
        <div className="bg-white/60 p-4 rounded-lg text-rose-900 text-sm leading-relaxed shadow-sm border border-rose-100 mb-4">
            {report}
        </div>
      )}

      {!loading && (
        <button 
            onClick={generateReport} 
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-lg shadow transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
            <Sparkles size={16} />
            {report ? '重新生成报告' : '生成恋爱报告'}
        </button>
      )}
    </div>
  );
};