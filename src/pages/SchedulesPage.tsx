import React, { useState } from 'react';
import {
  CalendarClock,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Zap,
  X,
} from 'lucide-react';
import { useSmartHome } from '../context/SmartHomeContext';

export const SchedulesPage: React.FC = () => {
  const { schedules, devices, addSchedule, deleteSchedule } = useSmartHome();
  const [showModal, setShowModal] = useState(false);

  const [deviceId, setDeviceId] = useState(devices[0]?.id || '');
  const [action, setAction] = useState<'turn_on' | 'turn_off'>('turn_on');
  const [time, setTime] = useState('07:30');
  const [days, setDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);

  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (d: string) => {
    if (days.includes(d)) {
      setDays(days.filter(x => x !== d));
    } else {
      setDays([...days, d]);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const dev = devices.find(d => d.id === deviceId);
    if (!dev) return;

    await addSchedule({
      deviceId,
      deviceName: dev.name,
      action,
      time,
      days,
      enabled: true,
    });

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <CalendarClock className="w-7 h-7 text-cyan-400" />
            Automations & Device Schedules
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Set automated timers for lights, garden sprinklers, AC cooling, and emergency relays.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add New Timer Schedule
        </button>
      </div>

      {/* Active Rules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schedules.map(sch => (
          <div
            key={sch.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {sch.time}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    sch.action === 'turn_on'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {sch.action.replace('_', ' ')}
                </span>
              </div>

              <h3 className="font-bold text-sm text-white">{sch.deviceName}</h3>

              <div className="flex flex-wrap gap-1 mt-3">
                {allDays.map(d => (
                  <span
                    key={d}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      sch.days.includes(d)
                        ? 'bg-slate-800 text-cyan-400 font-bold'
                        : 'bg-slate-950 text-slate-600'
                    }`}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex justify-end">
              <button
                onClick={() => deleteSchedule(sch.id)}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Schedule
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-cyan-400" /> Create Timer Schedule
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Smart Device</label>
                <select
                  value={deviceId}
                  onChange={e => setDeviceId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  {devices.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.room})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Relay Action</label>
                  <select
                    value={action}
                    onChange={e => setAction(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="turn_on">Turn Power ON</option>
                    <option value="turn_off">Turn Power OFF</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Trigger Time (24h)</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Repeat Days</label>
                <div className="flex flex-wrap gap-1.5">
                  {allDays.map(d => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => toggleDay(d)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                        days.includes(d)
                          ? 'bg-cyan-500 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold shadow-lg shadow-cyan-500/20"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
