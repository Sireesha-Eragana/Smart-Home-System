import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Device, SensorData, Alert, Schedule, SerialLog, SystemStats } from '../types';
import { INITIAL_DEVICES, INITIAL_SENSORS, INITIAL_ALERTS, INITIAL_SCHEDULES } from '../data/initialData';

interface SmartHomeContextType {
  devices: Device[];
  sensors: SensorData;
  telemetryHistory: SensorData[];
  alerts: Alert[];
  schedules: Schedule[];
  serialLogs: SerialLog[];
  stats: SystemStats;
  toggleDevice: (id: string, isOn: boolean) => void;
  updateDevice: (device: Device) => void;
  addDevice: (newDevice: Partial<Device>) => Promise<void>;
  deleteDevice: (id: string) => Promise<void>;
  simulateHardware: (action: string, value?: any) => Promise<void>;
  markAlertRead: (id: string) => void;
  clearAlerts: () => void;
  addSchedule: (sch: Omit<Schedule, 'id'>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  fetchAiAdvice: () => Promise<string[]>;
  unreadAlertsCount: number;
  criticalAlertActive: boolean;
  activeAlarmAlert?: Alert;
}

const SmartHomeContext = createContext<SmartHomeContextType | undefined>(undefined);

export const SmartHomeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [sensors, setSensors] = useState<SensorData>(INITIAL_SENSORS);
  const [telemetryHistory, setTelemetryHistory] = useState<SensorData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [schedules, setSchedules] = useState<Schedule[]>(INITIAL_SCHEDULES);
  const [serialLogs, setSerialLogs] = useState<SerialLog[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  const [stats, setStats] = useState<SystemStats>({
    esp32Connected: true,
    mqttStatus: 'connected',
    activeDevicesCount: INITIAL_DEVICES.filter(d => d.isOn).length,
    totalDevicesCount: INITIAL_DEVICES.length,
    totalEnergyKwh: 14.8,
    estimatedCostUsd: 2.36,
    uptimeSeconds: 86400,
  });

  useEffect(() => {
    // Connect socket
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('init:state', data => {
      if (data.devices) setDevices(data.devices);
      if (data.sensors) setSensors(data.sensors);
      if (data.alerts) setAlerts(data.alerts);
      if (data.schedules) setSchedules(data.schedules);
      if (data.serialLogs) setSerialLogs(data.serialLogs);
    });

    newSocket.on('device:update', updatedDevices => {
      setDevices(updatedDevices);
    });

    newSocket.on('sensor:update', updatedSensors => {
      setSensors(updatedSensors);
      setTelemetryHistory(prev => {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const list = [...prev, { ...updatedSensors, timestamp: timeStr }];
        return list.slice(-20);
      });
    });

    newSocket.on('alert:new', newAlert => {
      setAlerts(prev => [newAlert, ...prev]);
    });

    newSocket.on('alerts:update', updatedAlerts => {
      setAlerts(updatedAlerts);
    });

    newSocket.on('esp32:log', newLog => {
      setSerialLogs(prev => [newLog, ...prev.slice(0, 79)]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Recalculate stats when devices change
  useEffect(() => {
    const activeCount = devices.filter(d => d.isOn).length;
    const totalWatts = devices.filter(d => d.isOn).reduce((acc, d) => acc + d.powerWatts, 0);
    // Estimate kWh based on active watts
    const energy = Number((14.2 + (totalWatts / 1000) * 1.5).toFixed(1));
    const cost = Number((energy * 0.16).toFixed(2));

    setStats(prev => ({
      ...prev,
      activeDevicesCount: activeCount,
      totalDevicesCount: devices.length,
      totalEnergyKwh: energy,
      estimatedCostUsd: cost,
    }));
  }, [devices]);

  const toggleDevice = (id: string, isOn: boolean) => {
    // Optimistic UI update
    setDevices(prev =>
      prev.map(d => (d.id === id ? { ...d, isOn, lastUpdated: new Date().toISOString() } : d))
    );

    if (socket) {
      socket.emit('device:toggle', { deviceId: id, isOn });
    }

    // Fallback API call
    fetch(`/api/devices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOn }),
    }).catch(e => console.error('Failed to toggle device via REST', e));
  };

  const updateDevice = (updated: Device) => {
    setDevices(prev => prev.map(d => (d.id === updated.id ? updated : d)));
    if (socket) {
      socket.emit('device:update', updated);
    }
    fetch(`/api/devices/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(e => console.error('Failed to update device via REST', e));
  };

  const addDevice = async (newDevice: Partial<Device>) => {
    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDevice),
      });
      const data = await res.json();
      setDevices(prev => [...prev, data]);
    } catch (err) {
      console.error('Failed to add device', err);
    }
  };

  const deleteDevice = async (id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
    fetch(`/api/devices/${id}`, { method: 'DELETE' }).catch(e =>
      console.error('Failed to delete device', e)
    );
  };

  const simulateHardware = async (action: string, value?: any) => {
    try {
      const res = await fetch('/api/esp32/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, value }),
      });
      const data = await res.json();
      if (data.sensorState) setSensors(data.sensorState);
      if (data.devicesState) setDevices(data.devicesState);
      if (data.alertsState) setAlerts(data.alertsState);
    } catch (e) {
      console.error('Simulation request failed', e);
      if (action === 'reset_all') {
        setSensors(prev => ({
          ...prev,
          gasLevel: 140,
          isGasAlert: false,
          isFlameDetected: false,
          isMotionDetected: false,
        }));
        setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
      }
    }
  };

  const markAlertRead = (id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, isRead: true } : a)));
    fetch(`/api/notifications/${id}/read`, { method: 'PUT' }).catch(() => {});
  };

  const clearAlerts = () => {
    setAlerts([]);
    fetch('/api/notifications', { method: 'DELETE' }).catch(() => {});
  };

  const addSchedule = async (sch: Omit<Schedule, 'id'>) => {
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sch),
      });
      const data = await res.json();
      setSchedules(prev => [...prev, data]);
    } catch (e) {
      console.error('Failed to add schedule', e);
    }
  };

  const deleteSchedule = async (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
    fetch(`/api/schedules/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const fetchAiAdvice = async (): Promise<string[]> => {
    try {
      const res = await fetch('/api/ai/optimize', { method: 'POST' });
      const data = await res.json();
      return data.advice || [];
    } catch {
      return [
        '⚡ Lower AC target temperature by 1°C during hot afternoons to save electricity.',
        '💡 Ensure Garden lights are set to auto-mode so they switch off at daylight.',
        '🛡️ Maintain gas sensor threshold below 250 PPM for kitchen safety.',
      ];
    }
  };

  const unreadAlertsCount = alerts.filter(a => !a.isRead).length;
  const activeAlarmAlert = alerts.find(a => (a.type === 'gas_leak' || a.type === 'fire_alert') && !a.isRead);
  const criticalAlertActive = !!activeAlarmAlert || sensors.isGasAlert || sensors.isFlameDetected;

  return (
    <SmartHomeContext.Provider
      value={{
        devices,
        sensors,
        telemetryHistory,
        alerts,
        schedules,
        serialLogs,
        stats,
        toggleDevice,
        updateDevice,
        addDevice,
        deleteDevice,
        simulateHardware,
        markAlertRead,
        clearAlerts,
        addSchedule,
        deleteSchedule,
        fetchAiAdvice,
        unreadAlertsCount,
        criticalAlertActive,
        activeAlarmAlert,
      }}
    >
      {children}
    </SmartHomeContext.Provider>
  );
};

export const useSmartHome = () => {
  const context = useContext(SmartHomeContext);
  if (!context) throw new Error('useSmartHome must be used within a SmartHomeProvider');
  return context;
};
