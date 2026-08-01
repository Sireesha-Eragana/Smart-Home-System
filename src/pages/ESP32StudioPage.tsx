import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Terminal,
  Code2,
  Copy,
  Download,
  Check,
  Flame,
  Radio,
  Sun,
  ShieldAlert,
  Zap,
  Play,
  RotateCcw,
  Wifi,
} from 'lucide-react';
import { useSmartHome } from '../context/SmartHomeContext';

export const ESP32StudioPage: React.FC = () => {
  const { serialLogs, simulateHardware, sensors, devices } = useSmartHome();
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'serial' | 'pinout'>('simulator');
  const [inoCode, setInoCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/esp32/code')
      .then(res => res.text())
      .then(text => setInoCode(text))
      .catch(() => setInoCode('// Failed to load Arduino C++ sketch from server'));
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadIno = () => {
    const blob = new Blob([inoCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smart_home.ino';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Cpu className="w-7 h-7 text-cyan-400" />
            ESP32 Hardware & Firmware Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Interactive micro-controller simulator, live serial log monitor, and complete Arduino C++ source code.
          </p>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex flex-wrap gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" /> Hardware Simulator
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> Arduino C++ Code
          </button>

          <button
            onClick={() => setActiveTab('serial')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'serial'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> Serial Monitor
          </button>

          <button
            onClick={() => setActiveTab('pinout')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'pinout'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> Pinout Map
          </button>
        </div>
      </div>

      {/* TAB 1: Hardware Simulator */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulated ESP32 Micro-controller Board */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold font-mono">
                  ESP32
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Interactive ESP32 NodeMCU Board</h3>
                  <p className="text-xs text-slate-400 font-mono">Status: WiFi Connected (192.168.1.105)</p>
                </div>
              </div>
              <button
                onClick={() => simulateHardware('reset_all')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" /> Reset Sensors
              </button>
            </div>

            {/* Sensor Sliders & Hardware Trigger Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* MQ2 Gas Sensor Control */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-400" /> MQ2 Gas & Smoke
                  </span>
                  <span className="font-mono font-bold text-cyan-400">{sensors.gasLevel} PPM</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="600"
                  value={sensors.gasLevel}
                  onChange={e => simulateHardware('trigger_gas', Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => simulateHardware('trigger_gas', 140)}
                    className="flex-1 py-1 rounded-lg bg-slate-800 text-[11px] font-semibold text-slate-300 hover:bg-slate-700"
                  >
                    Safe (140 PPM)
                  </button>
                  <button
                    onClick={() => simulateHardware('trigger_gas', 380)}
                    className="flex-1 py-1 rounded-lg bg-rose-950/60 border border-rose-800 text-[11px] font-semibold text-rose-300 hover:bg-rose-900/60"
                  >
                    Leak (380 PPM)
                  </button>
                </div>
              </div>

              {/* PIR Motion Sensor */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-amber-400" /> PIR Motion Pin 16
                  </span>
                  <span className={`font-mono font-bold ${sensors.isMotionDetected ? 'text-amber-400' : 'text-slate-500'}`}>
                    {sensors.isMotionDetected ? 'HIGH (Detected)' : 'LOW (Clear)'}
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => simulateHardware('trigger_motion', true)}
                    className="flex-1 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30"
                  >
                    Trigger Motion
                  </button>
                  <button
                    onClick={() => simulateHardware('trigger_motion', false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    Clear Motion
                  </button>
                </div>
              </div>

              {/* DHT22 Temperature Control */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">DHT22 Temp (Pin 23)</span>
                  <span className="font-mono font-bold text-cyan-400">{sensors.temperature}°C</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="45"
                  step="0.5"
                  value={sensors.temperature}
                  onChange={e => simulateHardware('set_temp', Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* LDR Light Level */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-yellow-400" /> LDR Solar (Pin 34)
                  </span>
                  <span className="font-mono font-bold text-yellow-400">{sensors.lightLevel} Lux</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1024"
                  value={sensors.lightLevel}
                  onChange={e => simulateHardware('set_light', Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
              </div>
            </div>

            {/* Simulated Relays LED Row */}
            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-xs font-semibold text-slate-300 mb-3">4-Channel Relay Module Output States</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {devices.slice(0, 4).map(d => (
                  <div
                    key={d.id}
                    className={`p-3 rounded-2xl border text-xs font-mono flex flex-col items-center justify-center gap-1.5 ${
                      d.isOn
                        ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${d.isOn ? 'bg-cyan-400 shadow-md shadow-cyan-400/80 animate-pulse' : 'bg-slate-700'}`} />
                    <span className="font-bold">Relay GPIO {d.pin}</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-full">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MQTT Topics Monitor */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Wifi className="w-5 h-5 text-cyan-400" /> MQTT Message Broker Topics
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-cyan-400 font-bold">PUB smarthome/sensors</span>
                <p className="text-[11px] text-slate-400 break-all leading-tight">
                  {JSON.stringify(sensors)}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-purple-400 font-bold">SUB smarthome/commands</span>
                <p className="text-[11px] text-slate-400">
                  {"{\"relay\": 2, \"state\": true}"}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-rose-400 font-bold">PUB smarthome/alerts</span>
                <p className="text-[11px] text-slate-400">
                  {sensors.isGasAlert ? '{"type":"gas_leak","ppm":380}' : '{"status":"ok"}'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Arduino C++ Source Code Viewer */}
      {activeTab === 'code' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-cyan-400" /> Complete Arduino ESP32 C++ Code
              </h3>
              <p className="text-xs text-slate-400 font-mono">/esp32/smart_home.ino</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>

              <button
                onClick={handleDownloadIno}
                className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download .ino File
              </button>
            </div>
          </div>

          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 max-h-[500px] overflow-y-auto font-mono text-xs text-cyan-300/90 leading-relaxed">
            <pre className="whitespace-pre-wrap">{inoCode}</pre>
          </div>
        </div>
      )}

      {/* TAB 3: Serial Monitor */}
      {activeTab === 'serial' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" /> Live Serial Terminal (115200 Baud)
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Showing last {serialLogs.length} events
            </span>
          </div>

          <div className="rounded-2xl bg-black border border-slate-800 p-4 max-h-[450px] overflow-y-auto font-mono text-xs space-y-1.5">
            {serialLogs.map(log => (
              <div key={log.id} className="flex items-start gap-3">
                <span className="text-slate-600 text-[10px] shrink-0">{log.timestamp}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    log.source === 'ESP32'
                      ? 'bg-cyan-950 text-cyan-400'
                      : log.source === 'MQTT'
                      ? 'bg-purple-950 text-purple-400'
                      : 'bg-emerald-950 text-emerald-400'
                  }`}
                >
                  [{log.source}]
                </span>
                <span
                  className={`break-all ${
                    log.level === 'ERROR'
                      ? 'text-rose-400 font-bold'
                      : log.level === 'WARN'
                      ? 'text-amber-300'
                      : 'text-slate-300'
                  }`}
                >
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Pinout Diagram Guide */}
      {activeTab === 'pinout' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 text-xs">
          <h3 className="font-bold text-base text-white">ESP32 Hardware Schematic & Pinout Guide</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-cyan-400 text-sm">Input Sensors Wiring</h4>
              <ul className="space-y-1.5 text-slate-300 font-mono">
                <li>• DHT22 Temp & Humidity → GPIO 23</li>
                <li>• PIR Motion Sensor → GPIO 16</li>
                <li>• MQ2 Gas Sensor → ADC 35</li>
                <li>• LDR Light Sensor → ADC 34</li>
                <li>• Flame Sensor → GPIO 32</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-purple-400 text-sm">Relay & Actuators Wiring</h4>
              <ul className="space-y-1.5 text-slate-300 font-mono">
                <li>• Relay 1 (Living Room Light) → GPIO 2</li>
                <li>• Relay 2 (Ceiling Fan) → GPIO 4</li>
                <li>• Relay 3 (Exhaust Fan) → GPIO 5</li>
                <li>• Relay 4 (AC / Auxiliary) → GPIO 13</li>
                <li>• Buzzer / Siren Alarm → GPIO 19</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
