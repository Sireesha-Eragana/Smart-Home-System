import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Siren,
  Flame,
  Radio,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useSmartHome } from '../context/SmartHomeContext';
import { Alert } from '../types';

export const NotificationsPage: React.FC = () => {
  const { alerts, markAlertRead, clearAlerts, simulateHardware } = useSmartHome();
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter === 'all') return true;
    return a.severity === severityFilter;
  });

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'gas_leak':
        return AlertTriangle;
      case 'fire_alert':
        return Flame;
      case 'motion_alert':
        return Radio;
      default:
        return Info;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Bell className="w-7 h-7 text-rose-400" />
            Safety Alerts & Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time logs of gas leaks, fire alarms, PIR motion detections, and system connectivity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => simulateHardware('trigger_gas', 380)}
            className="px-3.5 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold hover:bg-rose-500/30 flex items-center gap-1.5"
          >
            <Siren className="w-4 h-4 text-rose-400" /> Test Alarm Siren
          </button>

          {alerts.length > 0 && (
            <button
              onClick={clearAlerts}
              className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-700 flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4 text-slate-400" /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800 text-xs">
        <button
          onClick={() => setSeverityFilter('all')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            severityFilter === 'all'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Alerts ({alerts.length})
        </button>

        <button
          onClick={() => setSeverityFilter('critical')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            severityFilter === 'critical'
              ? 'bg-rose-500 text-white'
              : 'text-rose-400 hover:bg-rose-950/40'
          }`}
        >
          Critical ({alerts.filter(a => a.severity === 'critical').length})
        </button>

        <button
          onClick={() => setSeverityFilter('warning')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            severityFilter === 'warning'
              ? 'bg-amber-500 text-white'
              : 'text-amber-400 hover:bg-amber-950/40'
          }`}
        >
          Warnings ({alerts.filter(a => a.severity === 'warning').length})
        </button>

        <button
          onClick={() => setSeverityFilter('info')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            severityFilter === 'info'
              ? 'bg-cyan-500 text-white'
              : 'text-cyan-400 hover:bg-cyan-950/40'
          }`}
        >
          Info ({alerts.filter(a => a.severity === 'info').length})
        </button>
      </div>

      {/* Alert Feed List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="py-16 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
            <p className="text-sm font-semibold text-slate-200">No notifications found</p>
            <p className="text-xs">Your smart home system is currently clear of any active warnings.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const Icon = getAlertIcon(alert.type);
            return (
              <div
                key={alert.id}
                onClick={() => markAlertRead(alert.id)}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer ${
                  alert.severity === 'critical'
                    ? 'bg-rose-950/40 border-rose-800/80 text-rose-100 hover:bg-rose-900/50'
                    : alert.severity === 'warning'
                    ? 'bg-amber-950/40 border-amber-800/80 text-amber-100 hover:bg-amber-900/50'
                    : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-850'
                } ${!alert.isRead ? 'ring-2 ring-cyan-500/60' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                    alert.severity === 'critical'
                      ? 'bg-rose-500 text-white'
                      : alert.severity === 'warning'
                      ? 'bg-amber-500 text-white'
                      : 'bg-cyan-500 text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-sm text-white">{alert.title}</h3>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
