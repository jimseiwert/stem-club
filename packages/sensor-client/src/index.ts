import { connectSensorToHub, type SensorConfig } from './hub-client.js'

const HUB_URL = (typeof window !== 'undefined' && (window as any).__STEM_HUB_URL__) ||
  (typeof process !== 'undefined' && process.env.HUB_URL) ||
  'ws://localhost:8080'

export function createSensor(config: SensorConfig) {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => connectSensorToHub(config, HUB_URL))
  } else {
    connectSensorToHub(config, HUB_URL)
  }
}

export type { SensorConfig } from './hub-client.js'
