import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SmartHomeProvider } from './context/SmartHomeContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { AlertBanner } from './components/AlertBanner';

import { DashboardPage } from './pages/DashboardPage';
import { DevicesPage } from './pages/DevicesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ESP32StudioPage } from './pages/ESP32StudioPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SchedulesPage } from './pages/SchedulesPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SmartHomeProvider>
      <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        <AlertBanner />
        <div className="flex flex-1">
          <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

          <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
            <Navbar onToggleSidebar={() => setIsMobileOpen(!isMobileOpen)} />

            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/devices" element={<DevicesPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/hardware" element={<ESP32StudioPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/schedules" element={<SchedulesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Bottom Status Bar */}
            <footer className="h-8 bg-blue-600 flex items-center px-4 sm:px-8 justify-between text-[10px] font-bold text-blue-100 uppercase tracking-widest sticky bottom-0 z-20 shadow-md">
              <div className="flex gap-4 sm:gap-6">
                <span>Broker: broker.hivemq.com</span>
                <span className="hidden sm:inline">Latency: 24ms</span>
              </div>
              <div className="flex gap-4 sm:gap-6">
                <span>Database: Firestore Cloud</span>
                <span>Build v2.4.1-Stable</span>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </SmartHomeProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
