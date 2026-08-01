import React from 'react';
import { Thermometer, Droplets, Flame, Radio, Sun, AlertTriangle } from 'lucide-react';
import { SensorData } from '../types';
import { useSmartHome } from '../context/SmartHomeContext';

interface SensorCardProps {
  sensors: SensorData;
}

export const SensorCard: React.FC<SensorCardProps> = ({ sensors }) => {
  const { simulateHardware } = useSmartHome();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {/* Temperature DHT22 */}
      <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
        <p className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">Temperature</p>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-bold text-white">{sensors.temperature.toFixed(1)}°C</span>
          <span className="text-emerald-500 text-xs flex items-center gap-1 pb-1 font-semibold">
            DHT22
          </span>
        </div>
      </div>

      {/* Humidity DHT22 */}
      <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
        <p className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">Humidity</p>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-bold text-white">{sensors.humidity}%</span>
          <span className="text-slate-500 text-xs pb-1 font-semibold">Optimal</span>
        </div>
      </div>

      {/* MQ2 Gas Sensor */}
      <div
        onClick={() => simulateHardware('trigger_gas', sensors.isGasAlert ? 140 : 380)}
        className={`p-5 rounded-2xl border flex flex-col justify-between cursor-pointer hover:border-slate-700 transition-all ${
          sensors.isGasAlert
            ? 'bg-rose-950/50 border-rose-800 text-rose-200 animate-pulse'
            : 'bg-slate-900/50 border-slate-800'
        }`}
        title="Click to toggle Gas Leak simulation"
      >
        <div className="flex items-center justify-between mb-1">
          <p className="text-slate-500 text-xs uppercase tracking-wider font-bold">Gas (MQ2)</p>
          <span className="text-[10px] text-slate-500 underline">toggle</span>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-bold text-white">
            {sensors.gasLevel}
            <span className="text-sm font-normal text-slate-500 ml-1">ppm</span>
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              sensors.isGasAlert
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-emerald-500/10 text-emerald-500'
            }`}
          >
            {sensors.isGasAlert ? 'LEAK' : 'SAFE'}
          </span>
        </div>
      </div>

      {/* PIR Motion Sensor */}
      <div
        onClick={() => simulateHardware('trigger_motion', !sensors.isMotionDetected)}
        className={`p-5 rounded-2xl border flex flex-col justify-between cursor-pointer hover:border-slate-700 transition-all ${
          sensors.isMotionDetected
            ? 'bg-amber-950/50 border-amber-800'
            : 'bg-slate-900/50 border-slate-800'
        }`}
        title="Click to toggle PIR Motion"
      >
        <div className="flex items-center justify-between mb-1">
          <p className="text-slate-500 text-xs uppercase tracking-wider font-bold">PIR Motion</p>
          <span className="text-[10px] text-slate-500 underline">toggle</span>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-xl font-bold text-white">
            {sensors.isMotionDetected ? 'ACTIVE' : 'CLEAR'}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              sensors.isMotionDetected
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            PIR
          </span>
        </div>
      </div>

      {/* LDR Light Sensor */}
      <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent flex flex-col justify-between">
        <p className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">Security</p>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-bold text-blue-500">
            {sensors.isDark ? 'NIGHT' : 'DAY'}
          </span>
          <span className="text-xs text-slate-400 pb-1 font-semibold">{sensors.lightLevel} Lux</span>
        </div>
      </div>
    </div>
  );
};
