import React from 'react';
import { ShieldAlert, Flame, VolumeX, CheckCircle } from 'lucide-react';
import { useSmartHome } from '../context/SmartHomeContext';

export const AlertBanner: React.FC = () => {
  const { criticalAlertActive, activeAlarmAlert, simulateHardware, clearAlerts, sensors } = useSmartHome();

  if (!criticalAlertActive) return null;

  return (
    <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white px-4 py-3 shadow-xl border-b border-rose-500/80 animate-pulse">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 text-yellow-300 animate-bounce" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm tracking-wide uppercase flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-300" />
              EMERGENCY SAFETY ALERT ACTIVATED
            </h4>
            <p className="text-xs text-rose-100 font-medium">
              {sensors.isFlameDetected
                ? 'CRITICAL: Flame sensor detected fire hazard in Kitchen!'
                : sensors.isGasAlert
                ? `CRITICAL: MQ2 Gas Sensor detected high concentration (${sensors.gasLevel} PPM)!`
                : activeAlarmAlert?.message || 'Safety hazard detected by smart home sensors.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={async () => {
              await simulateHardware('reset_all');
              clearAlerts();
            }}
            className="px-4 py-1.5 rounded-xl bg-white text-rose-700 font-bold text-xs hover:bg-rose-50 transition-colors shadow-md flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Clear & Reset Sensors
          </button>
        </div>
      </div>
    </div>
  );
};
