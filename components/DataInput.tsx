import React, { useState } from 'react';
import { DailyData } from '../types';
import { PlusCircle, FileJson, Save } from 'lucide-react';

interface DataInputProps {
  onAddData: (data: DailyData) => void;
  onImportJson: (data: DailyData[]) => void;
}

export const DataInput: React.FC<DataInputProps> = ({ onAddData, onImportJson }) => {
  const [activeTab, setActiveTab] = useState<'single' | 'json'>('single');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [voice, setVoice] = useState('');
  const [msgs, setMsgs] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || (!voice && !msgs)) {
        setError('请填写日期，并至少填写一项数值。');
        return;
    }
    onAddData({
        date,
        voiceMinutes: parseInt(voice) || 0,
        messageCount: parseInt(msgs) || 0
    });
    setVoice('');
    setMsgs('');
    setError('');
  };

  const handleJsonImport = () => {
      try {
          const parsed = JSON.parse(jsonInput);
          if (Array.isArray(parsed)) {
              onImportJson(parsed);
              setJsonInput('');
              setError('成功！数据已导入。');
              setTimeout(() => setError(''), 3000);
          } else {
              setError('JSON 必须是对象数组。');
          }
      } catch (e) {
          setError('JSON 格式无效。');
      }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-rose-100">
      <div className="flex gap-4 mb-6 border-b border-rose-100 pb-2">
        <button 
            onClick={() => setActiveTab('single')}
            className={`pb-2 font-semibold text-sm flex items-center gap-2 transition-colors ${activeTab === 'single' ? 'text-rose-600 border-b-2 border-rose-600' : 'text-gray-400 hover:text-rose-400'}`}
        >
            <PlusCircle size={16} /> 每日记录
        </button>
        <button 
            onClick={() => setActiveTab('json')}
            className={`pb-2 font-semibold text-sm flex items-center gap-2 transition-colors ${activeTab === 'json' ? 'text-rose-600 border-b-2 border-rose-600' : 'text-gray-400 hover:text-rose-400'}`}
        >
            <FileJson size={16} /> 批量导入 (JSON)
        </button>
      </div>

      {activeTab === 'single' ? (
        <form onSubmit={handleSingleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-bold text-rose-700 mb-1">日期</label>
                    <input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-2 rounded-lg border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-rose-50 text-rose-900"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-rose-700 mb-1">语音时长 (分钟)</label>
                    <input 
                        type="number" 
                        value={voice}
                        onChange={(e) => setVoice(e.target.value)}
                        placeholder="例如 45"
                        min="0"
                        className="w-full p-2 rounded-lg border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-rose-50 text-rose-900"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-rose-700 mb-1">消息数量 (条)</label>
                    <input 
                        type="number" 
                        value={msgs}
                        onChange={(e) => setMsgs(e.target.value)}
                        placeholder="例如 120"
                        min="0"
                        className="w-full p-2 rounded-lg border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-rose-50 text-rose-900"
                    />
                </div>
            </div>
            <button type="submit" className="mt-2 bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-lg font-bold shadow-md flex items-center justify-center gap-2 transition-all">
                <Save size={18} /> 记录爱意
            </button>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
            <p className="text-xs text-gray-500">
                粘贴 JSON 数组：<code className="bg-gray-100 px-1 rounded">[{"date": "2023-10-25", "voiceMinutes": 30, "messageCount": 100}, ...]</code>
            </p>
            <textarea 
                rows={5}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full p-3 rounded-lg border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-rose-50 font-mono text-xs text-rose-900"
                placeholder='[{"date": "...", "voiceMinutes": 0, "messageCount": 0}]'
            />
            <button onClick={handleJsonImport} className="bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-lg font-bold shadow-md transition-all">
                导入 JSON
            </button>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-500 font-semibold">{error}</p>}
    </div>
  );
};