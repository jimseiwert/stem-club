import type { HubMessage, SensorReading } from '@stem/types'
import { openMicrobitSerial, parseMicrobitLine } from './serial.js'
import { startCamera, captureFrame } from './camera.js'

export interface SensorConfig {
  label: string
  sensors: ('temperature' | 'light' | 'sound' | 'motion' | 'compass')[]
  camera?: {
    enabled: boolean
    detect: ('people' | 'age_group' | 'mood' | 'activity')[]
  }
}

export async function connectSensorToHub(config: SensorConfig, hubUrl: string): Promise<void> {
  const sensorId = `sensor-${config.label.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).slice(2, 6)}`
  let currentReading: Partial<SensorReading> = {}
  let ws: WebSocket
  let closed = false

  if (config.camera?.enabled) await startCamera()

  const stream = await openMicrobitSerial()
  if (stream) {
    const reader = stream.getReader()
    let buffer = ''
    ;(async () => {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += value
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          const data = parseMicrobitLine(line)
          if (!data) continue
          if (config.sensors.includes('temperature')) currentReading.temperature = data.temperature
          if (config.sensors.includes('light')) currentReading.light = data.light
          if (config.sensors.includes('sound')) currentReading.sound = data.sound
          if (config.sensors.includes('motion')) currentReading.motion = data.motion
          if (config.sensors.includes('compass')) currentReading.compass = data.compass
        }
      }
    })()
  }

  function connect() {
    ws = new WebSocket(hubUrl)
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', role: 'sensor' } satisfies HubMessage))
      console.log(`[${config.label}] Connected to hub`)

      setInterval(() => {
        if (ws.readyState !== WebSocket.OPEN) return
        const frame = config.camera?.enabled ? captureFrame() : null
        const reading: SensorReading = {
          ...currentReading,
          sensorId,
          label: config.label,
          timestamp: Date.now(),
          ...(frame ? { _cameraFrame: frame } as any : {}),
        }
        const msg: HubMessage = { type: 'sensor_reading', data: reading }
        ws.send(JSON.stringify(msg))
      }, 2000)
    }
    ws.onclose = () => { if (!closed) setTimeout(connect, 3000) }
  }

  connect()
}
