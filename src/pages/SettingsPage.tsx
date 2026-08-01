import React, { useState } from 'react';
import { Settings, Wifi, ShieldAlert, Save, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useSmartHome } from '../context/SmartHomeContext';

export const SettingsPage: React.FC = () => {
  const { simulateHardware } = useSmartHome();

  const [mqttServer, setMqttServer] = useState('broker.hivemq.com');
  const [mqttPort, setMqttPort] = useState(1883);
  const [gasThreshold, setGasThreshold] = useState(250);
  const [tempHighLimit, setTempHighLimit] = useState(32);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Settings className="w-7 h-7 text-cyan-400" />
          System Settings & MQTT Config
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure MQTT message broker parameters, safety alarm thresholds, and notification gateways.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* MQTT Config Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Wifi className="w-5 h-5 text-cyan-400" /> MQTT Message Broker Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">MQTT Server Host</label>
              <input
                type="text"
                value={mqttServer}
                onChange={e => setMqttServer(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">MQTT Port</label>
              <input
                type="number"
                value={mqttPort}
                onChange={e => setMqttPort(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Safety Thresholds Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" /> Safety Sensor Alert Thresholds
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Gas Warning Limit (PPM)
              </label>
              <input
                type="number"
                value={gasThreshold}
                onChange={e => setGasThreshold(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Values exceeding this PPM will automatically trigger the Kitchen Exhaust Fan & Siren.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                High Temperature Alert (°C)
              </label>
              <input
                type="number"
                value={tempHighLimit}
                onChange={e => setTempHighLimit(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Save & Reset */}
        <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => simulateHardware('reset_all')}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" /> Reset Hardware State
          </button>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Settings Saved!
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Save Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
