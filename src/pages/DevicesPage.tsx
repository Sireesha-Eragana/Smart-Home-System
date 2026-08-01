import React, { useState } from 'react';
import {
  Zap,
  Plus,
  Filter,
  Grid,
  List,
  Search,
  CheckCircle2,
  Power,
  X,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useSmartHome } from '../context/SmartHomeContext';
import { DeviceCard } from '../components/DeviceCard';
import { DeviceType, RoomType } from '../types';

export const DevicesPage: React.FC = () => {
  const { devices, addDevice, toggleDevice } = useSmartHome();

  const [selectedRoom, setSelectedRoom] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'on' | 'off'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form state for new device
  const [name, setName] = useState('');
  const [type, setType] = useState<DeviceType>('light');
  const [room, setRoom] = useState<RoomType>('Living Room');
  const [pin, setPin] = useState<number>(16);
  const [powerWatts, setPowerWatts] = useState<number>(20);

  const rooms = ['All', 'Living Room', 'Kitchen', 'Bedroom', 'Outdoor', 'Garage', 'Bathroom'];

  const filteredDevices = devices.filter(device => {
    const matchesRoom = selectedRoom === 'All' || device.room === selectedRoom;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'on' && device.isOn) ||
      (statusFilter === 'off' && !device.isOn);
    const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRoom && matchesStatus && matchesSearch;
  });

  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addDevice({
      name,
      type,
      room,
      pin,
      powerWatts,
      isOn: false,
      isAuto: false,
      brightness: 100,
      status: 'online',
    });

    setName('');
    setShowAddModal(false);
  };

  const turnAllOn = () => {
    devices.forEach(d => toggleDevice(d.id, true));
  };

  const turnAllOff = () => {
    devices.forEach(d => toggleDevice(d.id, false));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Zap className="w-7 h-7 text-cyan-400" />
            Device Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Control relay channels, GPIO pins, brightness, speeds, and auto modes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={turnAllOn}
            className="px-3 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold hover:bg-cyan-500/30 transition-all"
          >
            All Power ON
          </button>
          <button
            onClick={turnAllOff}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-all"
          >
            All Power OFF
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Device
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search device by name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Room Filter Pills */}
        <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {rooms.map(rm => (
            <button
              key={rm}
              onClick={() => setSelectedRoom(rm)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedRoom === rm
                  ? 'bg-cyan-500 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {rm}
            </button>
          ))}
        </div>

        {/* Status Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium ${
              statusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('on')}
            className={`px-3 py-1.5 rounded-lg font-medium ${
              statusFilter === 'on' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400'
            }`}
          >
            Active ON
          </button>
          <button
            onClick={() => setStatusFilter('off')}
            className={`px-3 py-1.5 rounded-lg font-medium ${
              statusFilter === 'off' ? 'bg-slate-800 text-slate-400' : 'text-slate-400'
            }`}
          >
            OFF
          </button>
        </div>
      </div>

      {/* Devices Grid */}
      {filteredDevices.length === 0 ? (
        <div className="py-16 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-500 space-y-2">
          <Zap className="w-10 h-10 mx-auto text-slate-700" />
          <p className="text-sm font-semibold text-slate-300">No devices match your search filter</p>
          <p className="text-xs">Try selecting a different room or adding a new device.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map(device => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      )}

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Add New Smart Device</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDevice} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Device Name</label>
                <input
                  type="text"
                  placeholder="e.g. Master Bedroom Ceiling Fan"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Device Category</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as DeviceType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="light">Light Bulb / LED</option>
                    <option value="fan">Ceiling Fan</option>
                    <option value="ac">Air Conditioner</option>
                    <option value="exhaust">Exhaust Fan</option>
                    <option value="purifier">Air Purifier</option>
                    <option value="lock">Smart Lock</option>
                    <option value="camera">IP Security Camera</option>
                    <option value="alarm">Siren Alarm</option>
                    <option value="sprinkler">Water Sprinkler</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Room Location</label>
                  <select
                    value={room}
                    onChange={e => setRoom(e.target.value as RoomType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Living Room">Living Room</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Bedroom">Bedroom</option>
                    <option value="Bathroom">Bathroom</option>
                    <option value="Outdoor">Outdoor</option>
                    <option value="Garage">Garage</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    ESP32 Relay GPIO Pin
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="39"
                    value={pin}
                    onChange={e => setPin(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Rated Power (Watts)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={powerWatts}
                    onChange={e => setPowerWatts(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold shadow-lg shadow-cyan-500/20"
                >
                  Save Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
