import { Device, SensorData, Alert, Schedule, AutomationRule } from '../types';

export const INITIAL_DEVICES: Device[] = [
  {
    id: 'dev_1',
    name: 'Main Living Light',
    type: 'light',
    room: 'Living Room',
    pin: 2, // Relay 1
    isOn: true,
    isAuto: false,
    brightness: 85,
    color: '#3B82F6',
    powerWatts: 15,
    status: 'online',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'dev_2',
    name: 'Ceiling Fan',
    type: 'fan',
    room: 'Living Room',
    pin: 4, // Relay 2
    isOn: true,
    isAuto: true,
    speed: 3,
    powerWatts: 60,
    status: 'online',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'dev_3',
    name: 'Kitchen Exhaust Fan',
    type: 'exhaust',
    room: 'Kitchen',
    pin: 5, // Relay 3
    isOn: false,
    isAuto: true, // Auto trigger on gas/smoke
    speed: 5,
    powerWatts: 45,
    status: 'online',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'dev_4',
    name: 'Kitchen Smart Light',
    type: 'light',
    room: 'Kitchen',
    pin: 12,
    isOn: true,
    isAuto: false,
    brightness: 100,
    color: '#F59E0B',
    powerWatts: 12,
    status: 'online',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'dev_5',
    name: 'Bedroom Air Conditioner',
    type: 'ac',
    room: 'Bedroom',
    pin: 13, // Relay 4
    isOn: false,
    isAuto: true,
    targetTemp: 22,
    powerWatts: 1200,
    status: 'online',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'dev_6',
    name: 'Bedroom Ambient Light',
    type: 'light',
    room: 'Bedroom',
    pin: 14,
    isOn: false,
    isAuto: false,
    brightness: 40,
    color: '#8B5CF6',
    powerWatts: 9,
    status: 'online',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'dev_7',
    name: 'Garden Flood Light',
    type: 'light',
    room: 'Outdoor',
    pin: 15,
    isOn: false,
    isAuto: true, // Turn on at night when dark
    brightness: 100,
    powerWatts: 30,
    status: 'online',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'dev_8',
    name: 'Main Entrance Lock',
    type: 'lock',
    room: 'Living Room',
    pin: 18,
    isOn: true, // Secure locked
    isAuto: false,
    powerWatts: 5,
    status: 'online',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'dev_9',
    name: 'Safety Alarm Siren',
    type: 'alarm',
    room: 'Living Room',
    pin: 19, // Buzzer Relay
    isOn: false,
    isAuto: true, // Trigger on fire/gas/motion
    powerWatts: 10,
    status: 'online',
    lastUpdated: new Date().toISOString(),
  },
];

export const INITIAL_SENSORS: SensorData = {
  timestamp: new Date().toISOString(),
  temperature: 24.5,
  humidity: 58,
  gasLevel: 140, // Safe range < 250 PPM
  isGasAlert: false,
  isMotionDetected: false,
  isFlameDetected: false,
  lightLevel: 620, // Lux (Daytime > 300)
  isDark: false,
};

export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'alt_1',
    type: 'system_info',
    severity: 'info',
    title: 'ESP32 Connected',
    message: 'Smart Home Gateway ESP32 successfully connected to MQTT broker.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    isRead: true,
  },
  {
    id: 'alt_2',
    type: 'motion_alert',
    severity: 'warning',
    title: 'Motion Detected',
    message: 'PIR motion sensor detected activity in Living Room.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    isRead: false,
  },
];

export const INITIAL_SCHEDULES: Schedule[] = [
  {
    id: 'sch_1',
    deviceId: 'dev_7',
    deviceName: 'Garden Flood Light',
    action: 'turn_on',
    time: '19:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    enabled: true,
  },
  {
    id: 'sch_2',
    deviceId: 'dev_7',
    deviceName: 'Garden Flood Light',
    action: 'turn_off',
    time: '06:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    enabled: true,
  },
  {
    id: 'sch_3',
    deviceId: 'dev_5',
    deviceName: 'Bedroom Air Conditioner',
    action: 'turn_off',
    time: '08:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    enabled: true,
  },
];

export const INITIAL_AUTOMATIONS: AutomationRule[] = [
  {
    id: 'auto_1',
    name: 'Gas Safety Emergency Exhaust',
    conditionSensor: 'gasLevel',
    operator: '>',
    thresholdValue: 250,
    targetDeviceId: 'dev_3',
    targetDeviceName: 'Kitchen Exhaust Fan',
    targetAction: 'turn_on',
    enabled: true,
  },
  {
    id: 'auto_2',
    name: 'Fire Emergency Alarm',
    conditionSensor: 'isFlameDetected',
    operator: '==',
    thresholdValue: true,
    targetDeviceId: 'dev_9',
    targetDeviceName: 'Safety Alarm Siren',
    targetAction: 'turn_on',
    enabled: true,
  },
  {
    id: 'auto_3',
    name: 'Night Lighting on Dark',
    conditionSensor: 'isDark',
    operator: '==',
    thresholdValue: true,
    targetDeviceId: 'dev_7',
    targetDeviceName: 'Garden Flood Light',
    targetAction: 'turn_on',
    enabled: true,
  },
];
