import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  Menu,
  ShieldAlert,
  Wifi,
  Sparkles,
  Flame,
  Radio,
  User as UserIcon,
  LogOut,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { useSmartHome } from '../context/SmartHomeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { unreadAlertsCount, alerts, markAlertRead, clearAlerts, simulateHardware, criticalAlertActive } = useSmartHome();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [timeStr, setTimeStr] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showSimModal, setShowSimModal] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0f172a]/50 flex items-center justify-between px-4 sm:px-8 backdrop-blur-md sticky top-0 z-30 text-slate-200">
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Left: Mobile Toggle & Page Search */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="relative hidden md:block w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search devices, sensors, rules..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Center: System Status & Live Clock */}
        <div className="hidden sm:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="text-xs font-medium text-slate-400">ESP32 Connected</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-800" />

          <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            <span>{timeStr}</span>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Hardware Simulation Trigger */}
          <button
            onClick={() => setShowSimModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Hardware Tester</span>
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2.5 rounded-xl border transition-all ${
                criticalAlertActive
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-semibold text-sm text-white">System Notifications</h3>
                  </div>
                  {alerts.length > 0 && (
                    <button
                      onClick={clearAlerts}
                      className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                  {alerts.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      All clear! No pending alerts.
                    </div>
                  ) : (
                    alerts.slice(0, 6).map(alert => (
                      <div
                        key={alert.id}
                        onClick={() => markAlertRead(alert.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                          alert.severity === 'critical'
                            ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                            : alert.severity === 'warning'
                            ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                            : 'bg-slate-800/60 border-slate-700/50 text-slate-300'
                        } ${!alert.isRead ? 'ring-1 ring-cyan-500/50' : ''}`}
                      >
                        <div className="flex items-center justify-between font-semibold mb-1">
                          <span>{alert.title}</span>
                          <span className="text-[10px] font-mono opacity-70">
                            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="opacity-90">{alert.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1.5 pr-3 bg-slate-800/80 border border-slate-700/80 rounded-xl hover:bg-slate-700/80 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
              <span className="hidden sm:inline text-xs font-medium text-slate-200">{user?.name || 'User'}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="font-semibold text-white">{user?.name}</p>
                  <p className="text-slate-400 text-[11px] font-mono truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    navigate('/profile');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition-colors mt-1"
                >
                  <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                  My Profile & Security
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                    navigate('/login');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hardware Simulation Quick Trigger Modal */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Hardware Sensor Injection</h3>
              </div>
              <button
                onClick={() => setShowSimModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Inject live simulated hardware signals into the system to test automatic relays, MQTT topic broadcasts, and critical alerts.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => simulateHardware('trigger_gas', sensors.isGasAlert ? 140 : 380)}
                className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                  sensors.isGasAlert
                    ? 'bg-rose-950/90 border-rose-600 text-rose-200'
                    : 'bg-rose-950/50 border-rose-800/80 text-rose-300 hover:bg-rose-900/60'
                }`}
              >
                <Flame className="w-5 h-5 text-rose-400" />
                {sensors.isGasAlert ? 'Clear Gas Leak' : 'Trigger Gas Leak'}
              </button>

              <button
                onClick={() => simulateHardware('trigger_flame', !sensors.isFlameDetected)}
                className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                  sensors.isFlameDetected
                    ? 'bg-orange-950/90 border-orange-600 text-orange-200'
                    : 'bg-orange-950/50 border-orange-800/80 text-orange-300 hover:bg-orange-900/60'
                }`}
              >
                <ShieldAlert className="w-5 h-5 text-orange-400" />
                {sensors.isFlameDetected ? 'Clear Fire Sensor' : 'Trigger Fire Sensor'}
              </button>

              <button
                onClick={() => simulateHardware('trigger_motion', !sensors.isMotionDetected)}
                className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                  sensors.isMotionDetected
                    ? 'bg-amber-950/90 border-amber-600 text-amber-200'
                    : 'bg-amber-950/50 border-amber-800/80 text-amber-300 hover:bg-amber-900/60'
                }`}
              >
                <Radio className="w-5 h-5 text-amber-400" />
                {sensors.isMotionDetected ? 'Clear Motion (PIR)' : 'Simulate Motion (PIR)'}
              </button>

              <button
                onClick={async () => {
                  await simulateHardware('reset_all');
                  clearAlerts();
                }}
                className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs font-semibold flex flex-col items-center gap-2 hover:bg-emerald-900/60 transition-all"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Reset Normal Safe Sensors
              </button>
            </div>

            <button
              onClick={() => setShowSimModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors mt-2"
            >
              Close Hardware Tester
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
