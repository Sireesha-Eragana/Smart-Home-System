import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  BarChart3,
  Bell,
  CalendarClock,
  User,
  Settings,
  Flame,
  Zap,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useSmartHome } from '../context/SmartHomeContext';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const { unreadAlertsCount, criticalAlertActive, stats } = useSmartHome();
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Smart Devices', path: '/devices', icon: Zap, badge: `${stats.activeDevicesCount}/${stats.totalDevicesCount}` },
    { label: 'Analytics & AI', path: '/analytics', icon: BarChart3, highlight: true },
    { label: 'ESP32 Hardware', path: '/hardware', icon: Cpu },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadAlertsCount > 0 ? `${unreadAlertsCount}` : undefined, danger: criticalAlertActive },
    { label: 'Automations', path: '/schedules', icon: CalendarClock },
    { label: 'User Profile', path: '/profile', icon: User },
    { label: 'System Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0f172a] text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-tight">DOMOS IoT</h1>
              <p className="text-[11px] text-blue-400 font-medium">Smart Home Gateway</p>
            </div>
          </div>
        </div>

        {/* Home Info Card */}
        <div className="mx-4 mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.homeName || 'Smart Villa'}</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" /> ESP32 Connected
              </p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `group flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20 font-medium'
                    : 'text-slate-400 hover:bg-slate-800 rounded-xl transition-colors'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 transition-colors" />
                <span>{item.label}</span>
              </div>

              {item.highlight && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3" /> AI
                </span>
              )}

              {item.badge && (
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    item.danger
                      ? 'bg-rose-500 text-white animate-bounce'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Hardware Status Footprint */}
        <div className="p-4 border-t border-slate-800 bg-[#0f172a]">
          <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'JD'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'John Doe'}</p>
              <p className="text-xs text-slate-400 truncate">ESP32 Firmware v2.4</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
