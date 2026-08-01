import React, { useState } from 'react';
import {
  BarChart3,
  Zap,
  Sparkles,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Cpu,
  PieChart as PieIcon,
} from 'lucide-react';
import { useSmartHome } from '../context/SmartHomeContext';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { devices, telemetryHistory, stats, fetchAiAdvice } = useSmartHome();
  const [aiAdvice, setAiAdvice] = useState<string[]>([]);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  const handleGenerateAi = async () => {
    setLoadingAi(true);
    const advice = await fetchAiAdvice();
    setAiAdvice(advice);
    setLoadingAi(false);
  };

  // Device wattage breakdown for chart
  const devicePowerData = devices.map(d => ({
    name: d.name,
    power: d.isOn ? d.powerWatts : 0,
    rated: d.powerWatts,
    room: d.room,
  }));

  const COLORS = ['#06b6d4', '#3b82f6', '#a855f7', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-purple-400" />
            Home Telemetry & Power Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Analyze historical sensor telemetry, power draw per room, and AI energy optimizations.
          </p>
        </div>

        <button
          onClick={handleGenerateAi}
          disabled={loadingAi}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold text-xs shadow-lg shadow-purple-500/25 hover:opacity-95 transition-all flex items-center gap-2"
        >
          {loadingAi ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-purple-200" />
          )}
          {loadingAi ? 'Analyzing Gemini AI...' : 'Run AI Energy Optimization'}
        </button>
      </div>

      {/* AI Advice Banner */}
      {aiAdvice.length > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-800/80 shadow-2xl space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-purple-200">Gemini AI Smart Energy Report</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {aiAdvice.map((tip, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-900/80 border border-purple-800/40 text-xs text-purple-100/90 space-y-1"
              >
                <p className="font-bold text-purple-300 font-mono">Insight #{idx + 1}</p>
                <p className="leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Energy & Cost KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Daily Energy Usage</p>
            <p className="text-2xl font-bold text-white font-mono">{stats.totalEnergyKwh} kWh</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Est. Monthly Electricity Cost</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono">
              ${(stats.estimatedCostUsd * 30).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Active Load</p>
            <p className="text-2xl font-bold text-purple-300 font-mono">
              {devices.filter(d => d.isOn).reduce((a, b) => a + b.powerWatts, 0)} W
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Humidity & Temperature Trends */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="font-bold text-base text-white">24h Temperature & Humidity</h3>
            <p className="text-xs text-slate-400">DHT22 Digital sensor log</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="temperature" name="Temp °C" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                <Area type="monotone" dataKey="humidity" name="Humidity %" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Wattage Bar Chart */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="font-bold text-base text-white">Device Power Load Distribution (Watts)</h3>
            <p className="text-xs text-slate-400">Real-time active wattage per connected relay</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={devicePowerData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="power" name="Active Watts">
                  {devicePowerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
