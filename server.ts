import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

import {
  INITIAL_DEVICES,
  INITIAL_SENSORS,
  INITIAL_ALERTS,
  INITIAL_SCHEDULES,
  INITIAL_AUTOMATIONS,
} from './src/data/initialData';
import { Device, SensorData, Alert, Schedule, AutomationRule, SerialLog, User } from './src/types';

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'smarthome_super_secret_jwt_key_2026';

// In-Memory Database collections
let usersDatabase: (User & { passwordHash: string })[] = [
  {
    id: 'usr_admin',
    name: 'Admin Owner',
    email: 'admin@smarthome.io',
    passwordHash: bcrypt.hashSync('admin123', 8),
    role: 'admin',
    homeName: 'Villa Sentinel Smart Home',
    phone: '+1 (555) 019-2831',
    createdAt: new Date().toISOString(),
  },
];

let devicesState: Device[] = [...INITIAL_DEVICES];
let sensorState: SensorData = { ...INITIAL_SENSORS };
let alertsState: Alert[] = [...INITIAL_ALERTS];
let schedulesState: Schedule[] = [...INITIAL_SCHEDULES];
let automationsState: AutomationRule[] = [...INITIAL_AUTOMATIONS];
let serialLogs: SerialLog[] = [
  {
    id: 'log_1',
    timestamp: new Date().toISOString(),
    source: 'ESP32',
    level: 'INFO',
    message: 'System Boot complete. Initializing WiFi connection to gateway...',
  },
  {
    id: 'log_2',
    timestamp: new Date().toISOString(),
    source: 'MQTT',
    level: 'INFO',
    message: 'Connected to broker. Subscribed to smarthome/commands',
  },
];

// Telemetry history for charts
let telemetryHistory: SensorData[] = Array.from({ length: 15 }).map((_, i) => ({
  timestamp: new Date(Date.now() - (15 - i) * 1000 * 60 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  temperature: Number((22 + Math.sin(i * 0.5) * 2.5).toFixed(1)),
  humidity: Math.round(52 + Math.cos(i * 0.5) * 6),
  gasLevel: Math.round(135 + Math.random() * 20),
  isGasAlert: false,
  isMotionDetected: i === 12,
  isFlameDetected: false,
  lightLevel: Math.round(550 + Math.sin(i * 0.2) * 200),
  isDark: false,
}));

// Gemini AI Setup
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  app.use(cors());
  app.use(express.json());

  // Initialize Socket.io
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  // Helper function to log and broadcast serial event
  const addSerialLog = (source: SerialLog['source'], level: SerialLog['level'], message: string) => {
    const log: SerialLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      timestamp: new Date().toLocaleTimeString(),
      source,
      level,
      message,
    };
    serialLogs.unshift(log);
    if (serialLogs.length > 80) serialLogs.pop();
    io.emit('esp32:log', log);
  };

  // Helper to trigger alert
  const triggerAlert = (
    type: Alert['type'],
    severity: Alert['severity'],
    title: string,
    message: string
  ) => {
    // Check if duplicate active unread alert exists recently
    const existing = alertsState.find(a => a.type === type && !a.isRead && (Date.now() - new Date(a.timestamp).getTime()) < 30000);
    if (existing) return;

    const alert: Alert = {
      id: 'alt_' + Date.now(),
      type,
      severity,
      title,
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    alertsState.unshift(alert);
    io.emit('alert:new', alert);
    addSerialLog('SERVER', severity === 'critical' ? 'ERROR' : 'WARN', `ALERT: ${title} - ${message}`);
  };

  // Middleware to authenticate JWT
  const authenticateToken = (req: any, res: Response, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Invalid or expired token' });
      req.user = user;
      next();
    });
  };

  // =========================================================================
  // REST API ENDPOINTS
  // =========================================================================

  // Auth: Register
  app.post('/register', async (req: Request, res: Response) => {
    const { name, email, password, homeName } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = usersDatabase.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 8);
    const newUser: User & { passwordHash: string } = {
      id: 'usr_' + Date.now(),
      name,
      email,
      passwordHash,
      role: 'admin',
      homeName: homeName || 'My Smart Home',
      createdAt: new Date().toISOString(),
    };

    usersDatabase.push(newUser);
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    const { passwordHash: _, ...profile } = newUser;
    res.json({ token, user: profile });
  });

  // Auth: Login
  app.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = usersDatabase.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash: _, ...profile } = user;
    res.json({ token, user: profile });
  });

  // User Profile
  app.get('/api/profile', authenticateToken, (req: any, res: Response) => {
    const user = usersDatabase.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { passwordHash, ...profile } = user;
    res.json(profile);
  });

  app.put('/api/profile', authenticateToken, (req: any, res: Response) => {
    const user = usersDatabase.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (req.body.name) user.name = req.body.name;
    if (req.body.homeName) user.homeName = req.body.homeName;
    if (req.body.phone) user.phone = req.body.phone;

    const { passwordHash, ...updated } = user;
    res.json(updated);
  });

  // Sensors API
  app.get('/api/sensors', (req: Request, res: Response) => {
    res.json({
      current: sensorState,
      history: telemetryHistory,
    });
  });

  app.post('/api/sensors', (req: Request, res: Response) => {
    const { temperature, humidity, gasLevel, isMotionDetected, isFlameDetected, lightLevel } = req.body;
    
    if (temperature !== undefined) sensorState.temperature = temperature;
    if (humidity !== undefined) sensorState.humidity = humidity;
    if (gasLevel !== undefined) sensorState.gasLevel = gasLevel;
    if (isMotionDetected !== undefined) sensorState.isMotionDetected = isMotionDetected;
    if (isFlameDetected !== undefined) sensorState.isFlameDetected = isFlameDetected;
    if (lightLevel !== undefined) sensorState.lightLevel = lightLevel;

    sensorState.isGasAlert = sensorState.gasLevel > 250;
    sensorState.isDark = sensorState.lightLevel < 300;
    sensorState.timestamp = new Date().toISOString();

    io.emit('sensor:update', sensorState);
    addSerialLog('MQTT', 'INFO', `Sensor payload received via API POST`);
    res.json({ success: true, sensorState });
  });

  // Devices API
  app.get('/api/devices', (req: Request, res: Response) => {
    res.json(devicesState);
  });

  app.post('/api/devices', authenticateToken, (req: Request, res: Response) => {
    const { name, type, room, pin, powerWatts } = req.body;
    const newDevice: Device = {
      id: 'dev_' + Date.now(),
      name: name || 'New Smart Device',
      type: type || 'light',
      room: room || 'Living Room',
      pin: pin || 16,
      isOn: false,
      isAuto: false,
      brightness: 100,
      powerWatts: powerWatts || 20,
      status: 'online',
      lastUpdated: new Date().toISOString(),
    };

    devicesState.push(newDevice);
    io.emit('device:update', devicesState);
    addSerialLog('SERVER', 'INFO', `Added new device: ${newDevice.name} (Pin ${newDevice.pin})`);
    res.json(newDevice);
  });

  app.put('/api/devices/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const deviceIndex = devicesState.findIndex(d => d.id === id);
    if (deviceIndex === -1) return res.status(404).json({ error: 'Device not found' });

    const device = devicesState[deviceIndex];
    const updates = req.body;

    devicesState[deviceIndex] = {
      ...device,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };

    const updatedDevice = devicesState[deviceIndex];
    io.emit('device:update', devicesState);
    
    addSerialLog(
      'MQTT',
      'INFO',
      `PUB smarthome/commands -> {"relay": ${updatedDevice.pin}, "state": ${updatedDevice.isOn}}`
    );

    res.json(updatedDevice);
  });

  app.delete('/api/devices/:id', authenticateToken, (req: Request, res: Response) => {
    const { id } = req.params;
    devicesState = devicesState.filter(d => d.id !== id);
    io.emit('device:update', devicesState);
    res.json({ success: true });
  });

  // Notifications API
  app.get('/api/notifications', (req: Request, res: Response) => {
    res.json(alertsState);
  });

  app.put('/api/notifications/:id/read', (req: Request, res: Response) => {
    const { id } = req.params;
    const alert = alertsState.find(a => a.id === id);
    if (alert) alert.isRead = true;
    io.emit('alerts:update', alertsState);
    res.json({ success: true });
  });

  app.delete('/api/notifications', (req: Request, res: Response) => {
    alertsState = [];
    io.emit('alerts:update', alertsState);
    res.json({ success: true });
  });

  // Schedules API
  app.get('/api/schedules', (req: Request, res: Response) => {
    res.json(schedulesState);
  });

  app.post('/api/schedules', authenticateToken, (req: Request, res: Response) => {
    const { deviceId, deviceName, action, time, days } = req.body;
    const schedule: Schedule = {
      id: 'sch_' + Date.now(),
      deviceId,
      deviceName,
      action,
      time,
      days: days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      enabled: true,
    };
    schedulesState.push(schedule);
    io.emit('schedules:update', schedulesState);
    res.json(schedule);
  });

  app.delete('/api/schedules/:id', authenticateToken, (req: Request, res: Response) => {
    const { id } = req.params;
    schedulesState = schedulesState.filter(s => s.id !== id);
    io.emit('schedules:update', schedulesState);
    res.json({ success: true });
  });

  // AI Smart Energy Advisor via Gemini API
  app.post('/api/ai/optimize', async (req: Request, res: Response) => {
    const aiClient = getGeminiClient();
    if (!aiClient) {
      return res.json({
        advice: [
          '⚡ Temperature is optimal at 24.5°C. Keep AC target set to 24°C to save 12% electricity.',
          '💡 Outdoor Garden Light auto-mode is active. It will automatically switch off at sunrise.',
          '💨 Kitchen Exhaust Fan automatically triggers on gas detection to protect your indoor air quality.',
        ],
      });
    }

    try {
      const activeDevices = devicesState.filter(d => d.isOn).map(d => `${d.name} (${d.powerWatts}W)`).join(', ');
      const prompt = `You are a Smart Home Energy Optimization & Safety AI Advisor.
Current Home Telemetry:
- Temperature: ${sensorState.temperature}°C
- Humidity: ${sensorState.humidity}%
- Gas Level: ${sensorState.gasLevel} PPM
- Motion Detected: ${sensorState.isMotionDetected}
- Light Level: ${sensorState.lightLevel} Lux
- Active Devices: ${activeDevices || 'None'}

Provide 3 concise, actionable, bulleted smart home optimization and energy-saving tips for the home owner. Format as JSON array of string messages.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text || '';
      let jsonAdvice: string[] = [];
      try {
        const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
        jsonAdvice = JSON.parse(clean);
      } catch {
        jsonAdvice = text.split('\n').filter(line => line.trim().length > 0).slice(0, 3);
      }

      res.json({ advice: jsonAdvice });
    } catch (err: any) {
      console.error('Gemini error:', err);
      res.json({
        advice: [
          '⚡ Consider lowering AC power during peak hours to optimize home power draw.',
          '💡 Switch unused lights off in empty rooms to save up to 15 kWh monthly.',
          '🛡️ Gas levels are currently safe at ' + sensorState.gasLevel + ' PPM.',
        ],
      });
    }
  });

  // ESP32 Source Code Endpoint
  app.get('/api/esp32/code', (req: Request, res: Response) => {
    const inoPath = path.join(process.cwd(), 'esp32', 'smart_home.ino');
    if (fs.existsSync(inoPath)) {
      const code = fs.readFileSync(inoPath, 'utf-8');
      res.setHeader('Content-Type', 'text/plain');
      res.send(code);
    } else {
      res.status(404).send('ESP32 code file not found');
    }
  });

  // Hardware Simulation Endpoint
  app.post('/api/esp32/simulate', (req: Request, res: Response) => {
    const { action, value } = req.body;

    if (action === 'trigger_gas') {
      sensorState.gasLevel = value !== undefined ? value : 380; // Leak!
      sensorState.isGasAlert = sensorState.gasLevel > 250;
      if (sensorState.isGasAlert) {
        triggerAlert(
          'gas_leak',
          'critical',
          'Gas Leak Detected (MQ2)',
          `Gas concentration spiked to ${sensorState.gasLevel} PPM in Kitchen!`
        );
        // Auto turn on Kitchen Exhaust Fan
        const exhaust = devicesState.find(d => d.type === 'exhaust');
        if (exhaust && exhaust.isAuto) {
          exhaust.isOn = true;
        }
        // Auto turn on alarm siren
        const siren = devicesState.find(d => d.type === 'alarm');
        if (siren && siren.isAuto) {
          siren.isOn = true;
        }
      } else {
        // Gas level returned to safe range
        alertsState.forEach(a => {
          if (a.type === 'gas_leak') a.isRead = true;
        });
        io.emit('alerts:update', alertsState);
      }
    } else if (action === 'trigger_flame') {
      sensorState.isFlameDetected = value !== undefined ? value : true;
      if (sensorState.isFlameDetected) {
        triggerAlert(
          'fire_alert',
          'critical',
          'FIRE / FLAME ALERT',
          'Flame sensor activated in Kitchen! Emergency alarm triggered.'
        );
        const siren = devicesState.find(d => d.type === 'alarm');
        if (siren) siren.isOn = true;
      } else {
        alertsState.forEach(a => {
          if (a.type === 'fire_alert') a.isRead = true;
        });
        io.emit('alerts:update', alertsState);
      }
    } else if (action === 'trigger_motion') {
      sensorState.isMotionDetected = value !== undefined ? value : true;
      if (sensorState.isMotionDetected) {
        triggerAlert('motion_alert', 'warning', 'Motion Detected', 'PIR sensor detected activity.');
      } else {
        alertsState.forEach(a => {
          if (a.type === 'motion_alert') a.isRead = true;
        });
        io.emit('alerts:update', alertsState);
      }
    } else if (action === 'reset_all') {
      sensorState.gasLevel = 140;
      sensorState.isGasAlert = false;
      sensorState.isFlameDetected = false;
      sensorState.isMotionDetected = false;
      sensorState.temperature = 24.0;
      sensorState.humidity = 55;

      const siren = devicesState.find(d => d.type === 'alarm');
      if (siren) siren.isOn = false;
      const exhaust = devicesState.find(d => d.type === 'exhaust');
      if (exhaust) exhaust.isOn = false;

      // Wipe emergency alerts completely
      alertsState = alertsState.filter(a => a.type !== 'gas_leak' && a.type !== 'fire_alert' && a.type !== 'motion_alert');

      io.emit('alerts:update', alertsState);
      addSerialLog('WEB_SIMULATOR', 'INFO', 'Simulated hardware sensors reset to normal safe limits.');
    } else if (action === 'set_temp') {
      sensorState.temperature = value;
    } else if (action === 'set_light') {
      sensorState.lightLevel = value;
      sensorState.isDark = sensorState.lightLevel < 300;
    }

    sensorState.timestamp = new Date().toISOString();
    io.emit('sensor:update', sensorState);
    io.emit('device:update', devicesState);

    res.json({
      success: true,
      sensorState,
      devicesState,
      alertsState,
    });
  });

  // =========================================================================
  // SOCKET.IO REALTIME EVENTS
  // =========================================================================
  io.on('connection', socket => {
    addSerialLog('SERVER', 'INFO', `WebSocket Client Connected: ${socket.id}`);

    // Initial state push
    socket.emit('init:state', {
      devices: devicesState,
      sensors: sensorState,
      alerts: alertsState,
      schedules: schedulesState,
      serialLogs: serialLogs,
    });

    socket.on('device:toggle', ({ deviceId, isOn }) => {
      const dev = devicesState.find(d => d.id === deviceId);
      if (dev) {
        dev.isOn = isOn;
        dev.lastUpdated = new Date().toISOString();
        io.emit('device:update', devicesState);
        addSerialLog('MQTT', 'INFO', `PUB smarthome/commands -> device: ${dev.name}, relay: ${dev.pin}, state: ${isOn}`);
      }
    });

    socket.on('device:update', updatedDev => {
      const index = devicesState.findIndex(d => d.id === updatedDev.id);
      if (index !== -1) {
        devicesState[index] = { ...updatedDev, lastUpdated: new Date().toISOString() };
        io.emit('device:update', devicesState);
      }
    });

    socket.on('disconnect', () => {
      addSerialLog('SERVER', 'INFO', `Client Disconnected: ${socket.id}`);
    });
  });

  // =========================================================================
  // BACKGROUND TELEMETRY & AUTOMATION SIMULATION LOOP
  // =========================================================================
  setInterval(() => {
    // Natural subtle ambient variation unless in alert state
    if (!sensorState.isGasAlert) {
      sensorState.gasLevel = Math.round(130 + Math.sin(Date.now() / 10000) * 15 + Math.random() * 5);
    }
    sensorState.temperature = Number((24.0 + Math.sin(Date.now() / 20000) * 1.5).toFixed(1));
    sensorState.humidity = Math.round(55 + Math.cos(Date.now() / 20000) * 4);

    // Auto Rule Evaluation
    automationsState.forEach(rule => {
      if (!rule.enabled) return;
      let conditionMet = false;
      const sensorVal = (sensorState as any)[rule.conditionSensor];

      if (rule.operator === '>') conditionMet = sensorVal > rule.thresholdValue;
      if (rule.operator === '<') conditionMet = sensorVal < rule.thresholdValue;
      if (rule.operator === '==') conditionMet = sensorVal === rule.thresholdValue;

      if (conditionMet) {
        const dev = devicesState.find(d => d.id === rule.targetDeviceId);
        if (dev && dev.isAuto) {
          const shouldTurnOn = rule.targetAction === 'turn_on';
          if (dev.isOn !== shouldTurnOn) {
            dev.isOn = shouldTurnOn;
            io.emit('device:update', devicesState);
            addSerialLog('SERVER', 'WARN', `Automation Rule "${rule.name}" triggered -> Set ${dev.name} to ${rule.targetAction.toUpperCase()}`);
          }
        }
      }
    });

    // Record Telemetry
    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    telemetryHistory.push({
      ...sensorState,
      timestamp: timeLabel,
    });
    if (telemetryHistory.length > 20) telemetryHistory.shift();

    // Broadcast live telemetry
    io.emit('sensor:update', sensorState);
  }, 3000);

  // =========================================================================
  // VITE / STATIC SERVING
  // =========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Smart Home Gateway Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
