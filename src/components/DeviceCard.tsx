import React, { useState } from 'react';
import {
  Lightbulb,
  Fan,
  Wind,
  Snowflake,
  Lock,
  Camera,
  Siren,
  Droplets,
  Sliders,
  Sparkles,
  Power,
  Trash2,
} from 'lucide-react';
import { Device, DeviceType } from '../types';
import { useSmartHome } from '../context/SmartHomeContext';

interface DeviceCardProps {
  device: Device;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ device }) => {
  const { toggleDevice, updateDevice, deleteDevice } = useSmartHome();
  const [showDetails, setShowDetails] = useState(false);

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'light':
        return Lightbulb;
      case 'fan':
        return Fan;
      case 'exhaust':
      case 'purifier':
        return Wind;
      case 'ac':
        return Snowflake;
      case 'lock':
        return Lock;
      case 'camera':
        return Camera;
      case 'alarm':
        return Siren;
      case 'sprinkler':
        return Droplets;
      default:
        return Sliders;
    }
  };

  const Icon = getDeviceIcon(device.type);

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
        device.isOn
          ? 'bg-[#0f172a] border-blue-500/40 shadow-lg shadow-blue-600/10'
          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                device.isOn
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-semibold text-sm text-white leading-snug">{device.name}</h3>
              <p className="text-[11px] text-slate-400">{device.room}</p>
            </div>
          </div>

          {/* Toggle Power Button */}
          <button
            onClick={() => toggleDevice(device.id, !device.isOn)}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
              device.isOn
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            <Power className="w-5 h-5" />
          </button>
        </div>

        {/* Status Tags */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                device.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-600'
              }`}
            />
            GPIO {device.pin}
          </span>

          <span className="text-blue-400 font-medium">{device.powerWatts}W</span>
        </div>
      </div>

      {/* Auto vs Manual Mode Switch */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
        <button
          onClick={() => updateDevice({ ...device, isAuto: !device.isAuto })}
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
            device.isAuto
              ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          {device.isAuto ? 'AUTO MODE' : 'MANUAL'}
        </button>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-[11px] text-slate-400 hover:text-blue-400 transition-colors"
        >
          {showDetails ? 'Hide Controls' : 'Controls ›'}
        </button>
      </div>

      {/* Detailed Interactive Sliders */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-3 text-xs text-slate-300">
          {/* Light Controls */}
          {device.type === 'light' && (
            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <span className="text-slate-400">Brightness</span>
                <span className="text-cyan-400 font-mono">{device.brightness || 100}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={device.brightness || 100}
                onChange={e => updateDevice({ ...device, brightness: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          )}

          {/* Fan Controls */}
          {(device.type === 'fan' || device.type === 'exhaust') && (
            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <span className="text-slate-400">Fan Speed Level</span>
                <span className="text-cyan-400 font-mono">Speed {device.speed || 3}</span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => updateDevice({ ...device, speed: lvl })}
                    className={`flex-1 py-1 rounded-lg font-mono text-xs border transition-all ${
                      device.speed === lvl
                        ? 'bg-cyan-500 text-white border-cyan-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AC Controls */}
          {device.type === 'ac' && (
            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <span className="text-slate-400">Target Temperature</span>
                <span className="text-cyan-400 font-mono">{device.targetTemp || 22}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateDevice({ ...device, targetTemp: Math.max(16, (device.targetTemp || 22) - 1) })
                  }
                  className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold hover:bg-slate-700"
                >
                  -
                </button>
                <div className="flex-1 text-center font-mono font-bold text-sm text-cyan-300">
                  {device.targetTemp || 22}°C
                </div>
                <button
                  onClick={() =>
                    updateDevice({ ...device, targetTemp: Math.min(30, (device.targetTemp || 22) + 1) })
                  }
                  className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold hover:bg-slate-700"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={() => deleteDevice(device.id)}
              className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Delete Device
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
