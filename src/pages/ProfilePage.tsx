import React, { useState } from 'react';
import { User as UserIcon, Shield, Key, Save, CheckCircle2, Home, Mail, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, token, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [homeName, setHomeName] = useState(user?.homeName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ name, homeName, phone });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-3xl shadow-xl shadow-cyan-500/20">
          {user?.name ? user.name[0].toUpperCase() : 'A'}
        </div>

        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-2xl font-extrabold text-white">{user?.name}</h1>
          <p className="text-xs text-cyan-400 font-mono flex items-center justify-center sm:justify-start gap-1">
            <Shield className="w-3.5 h-3.5" /> Role: {user?.role?.toUpperCase()} • {user?.homeName}
          </p>
          <p className="text-xs text-slate-400">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings Form */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-cyan-400" /> User Profile Information
          </h3>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Smart Home Villa Name</label>
              <div className="relative">
                <Home className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={homeName}
                  onChange={e => setHomeName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Emergency Phone Contact</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {saved && (
                <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Profile Updated!
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Save Profile
              </button>
            </div>
          </form>
        </div>

        {/* Security & JWT Token Inspector */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-purple-400" /> JWT Authentication Credentials
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold">User ID</span>
              <p className="font-mono text-cyan-300">{user?.id}</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold">Active JWT Access Token</span>
              <p className="font-mono text-[10px] text-purple-300 break-all leading-tight">
                {token || 'No active JWT'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 space-y-1">
              <span className="font-bold">Security Status</span>
              <p className="text-[11px]">
                JWT Authentication enabled. Authorization header passed with every REST API & Socket handshake.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
