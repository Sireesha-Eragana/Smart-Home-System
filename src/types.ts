export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  homeName: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export type DeviceType = 
  | 'light' 
  | 'fan' 
  | 'ac' 
  | 'purifier' 
  | 'lock' 
  | 'camera' 
  | 'alarm' 
  | 'exhaust' 
  | 'sprinkler';

export type RoomType = 'Living Room' | 'Kitchen' | 'Bedroom' | 'Bathroom' | 'Outdoor' | 'Garage';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  room: RoomType;
  pin: number; // ESP32 GPIO Relay Pin
  isOn: boolean;
  isAuto: boolean; // Auto control based on sensors
  brightness?: number; // 0-100% for dimmable lights
  speed?: number; // 1-5 for fan
  targetTemp?: number; // 16-30°C for AC
  color?: string; // RGB hex string for light
  powerWatts: number; // Rated power consumption in Watts
  status: 'online' | 'offline';
  lastUpdated: string;
}

export interface SensorData {
  timestamp: string;
  temperature: number; // °C (DHT22)
  humidity: number; // % (DHT22)
  gasLevel: number; // PPM (MQ2)
  isGasAlert: boolean;
  isMotionDetected: boolean; // PIR
  isFlameDetected: boolean; // Flame Sensor
  lightLevel: number; // Lux / 0-1024 LDR
  isDark: boolean;
}

export interface Alert {
  id: string;
  type: 'gas_leak' | 'fire_alert' | 'motion_alert' | 'device_offline' | 'system_info';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface Schedule {
  id: string;
  deviceId: string;
  deviceName: string;
  action: 'turn_on' | 'turn_off';
  time: string; // HH:mm format (e.g. "07:30")
  days: string[]; // ['Mon', 'Tue', ...]
  enabled: boolean;
}

export interface AutomationRule {
  id: string;
  name: string;
  conditionSensor: 'temperature' | 'gasLevel' | 'isMotionDetected' | 'isFlameDetected' | 'isDark';
  operator: '>' | '<' | '==' | '!=';
  thresholdValue: number | boolean;
  targetDeviceId: string;
  targetDeviceName: string;
  targetAction: 'turn_on' | 'turn_off';
  enabled: boolean;
}

export interface SerialLog {
  id: string;
  timestamp: string;
  source: 'ESP32' | 'MQTT' | 'SERVER' | 'WEB_SIMULATOR';
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
}

export interface SystemStats {
  esp32Connected: boolean;
  mqttStatus: 'connected' | 'reconnecting' | 'disconnected';
  activeDevicesCount: number;
  totalDevicesCount: number;
  totalEnergyKwh: number;
  estimatedCostUsd: number;
  uptimeSeconds: number;
}
