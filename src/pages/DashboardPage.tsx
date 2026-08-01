import React, { useState } from 'react';
import {
  Zap,
  TrendingUp,
  Activity,
  ShieldCheck,
  Flame,
  AlertTriangle,
  Sliders,
  Sparkles,
  ArrowUpRight,
  Tv,
} from 'lucide-react';
import { useSmartHome } from '../context/SmartHomeContext';
import { SensorCard } from '../components/SensorCard';
import { DeviceCard } from '../components/DeviceCard';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const DashboardPage: React.FC = () => {
  const { devices, sensors, telemetryHistory, stats, simulateHardware, alerts } = useSmartHome();
  const [selectedRoom, setSelectedRoom] = useState<string>('All');

  const rooms = ['All', 'Living Room', 'Kitchen', 'Bedroom', 'Outdoor'];

  const filteredDevices =
    selectedRoom === 'All'
      ? devices
      : devices.filter(d => d.room === selectedRoom);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Overview */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#0f172a] p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" /> ESP32 Gateway Active
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: ESP32-GATEWAY-01</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            System Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time IoT telemetry, device relay states, and safety threshold monitors.
          </p>
        </div>

        {/* Hero KPI Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full lg:w-auto">
          <div className="p-3 sm:p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Active Devices</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-400 font-mono mt-0.5">
              {stats.activeDevicesCount} / {stats.totalDevicesCount}
            </p>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Est. Energy</p>
            <p className="text-xl sm:text-2xl font-bold text-white font-mono mt-0.5">
              {stats.totalEnergyKwh} <span className="text-xs font-normal text-slate-400">kWh</span>
            </p>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Safety Status</p>
            <p className={`text-sm sm:text-base font-bold mt-1 font-mono ${sensors.isGasAlert ? 'text-rose-400 animate-pulse' : 'text-emerald-500'}`}>
              {sensors.isGasAlert ? '⚠️ LEAK' : 'SAFE'}
            </p>
          </div>
        </div>
      </div>

      {/* Live Sensors Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Live Hardware Telemetry (ESP32)
          </h2>
          <span className="text-xs text-slate-400 font-mono">Updates every 3s via Socket.io</span>
        </div>
        <SensorCard sensors={sensors} />
      </div>

      {/* Live Chart & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Telemetry Chart */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-slate-800 rounded-2xl flex flex-col p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Temperature History & Gas Telemetry
              </h3>
              <p className="text-xs text-slate-400">Streamed DHT22 °C and MQ2 Gas PPM history</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Temp (°C)
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Gas (PPM)
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryHistory}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area type="monotone" dataKey="temperature" name="Temp °C" stroke="#2563eb" fillOpacity={1} fill="url(#colorTemp)" />
                <Area type="monotone" dataKey="gasLevel" name="Gas PPM" stroke="#f43f5e" fillOpacity={1} fill="url(#colorGas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hardware Quick Actions & Alerts Box */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2 mb-1">
              <Sliders className="w-5 h-5 text-blue-400" />
              Hardware Test Bench
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Simulate sensor spikes to verify auto-relays & notification alarms.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => simulateHardware('trigger_gas', sensors.isGasAlert ? 140 : 380)}
                className={`w-full p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  sensors.isGasAlert
                    ? 'bg-rose-950/80 border-rose-600 text-rose-200 hover:bg-rose-900/80 shadow-md shadow-rose-900/20'
                    : 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  {sensors.isGasAlert ? 'Clear Gas Leak (Safe 140 PPM)' : 'Simulate Gas Leak (380 PPM)'}
                </span>
                <ArrowUpRight className="w-4 h-4 text-rose-400" />
              </button>

              <button
                onClick={() => simulateHardware('trigger_motion', !sensors.isMotionDetected)}
                className={`w-full p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  sensors.isMotionDetected
                    ? 'bg-amber-950/80 border-amber-600 text-amber-200 hover:bg-amber-900/80 shadow-md shadow-amber-900/20'
                    : 'bg-amber-950/40 border-amber-800/60 text-amber-300 hover:bg-amber-900/50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  {sensors.isMotionDetected ? 'Clear Motion Signal (Set CLEAR)' : 'Trigger PIR Motion (Set HIGH)'}
                </span>
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
              </button>

              <button
                onClick={async () => {
                  await simulateHardware('reset_all');
                  clearAlerts();
                }}
                className="w-full p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-center justify-between hover:bg-emerald-900/50 transition-all"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Reset Sensors to Normal
                </span>
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
            <p className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Active System Rule:
            </p>
            <p className="text-slate-400 text-[11px]">
              If Gas &gt; 250 PPM → Kitchen Exhaust Fan turns ON + Buzzer Sounds.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Device Controls */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Device Controls & Relays
            </h2>
            <p className="text-xs text-slate-400">Toggle relays or set automatic sensor modes</p>
          </div>

          {/* Room Filter Pills */}
          <div className="flex flex-wrap gap-1.5 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
            {rooms.map(rm => (
              <button
                key={rm}
                onClick={() => setSelectedRoom(rm)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedRoom === rm
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {rm}
              </button>
            ))}
          </div>
        </div>

        {/* Devices Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map(device => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      </div>
    </div>
  );
};
