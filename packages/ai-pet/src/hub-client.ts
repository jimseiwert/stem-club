import type { HubMessage, SensorReading, ThresholdEvent, ThresholdMap } from '@stem/types'
import { compareToThresholds } from './threshold.js'

const DEFAULT_PROMPT = (e: ThresholdEvent) =>
  `You are ${e.petName}, a ${e.personality}. The room just hit "${e.level}" ${e.sensor} (value: ${e.value}). React in 1 short sentence, in character.`

export interface PetConfig {
  name: string
  personality: string
  thresholds: ThresholdMap
  onThreshold?: (event: ThresholdEvent) => string
}

export function connectPetToHub(config: PetConfig, hubUrl: string): () => void {
  const petId = `pet-${config.name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).slice(2, 6)}`
  const levelState: Partial<Record<string, string>> = {}
  let ws: WebSocket
  let closed = false

  function connect() {
    ws = new WebSocket(hubUrl)

    ws.onopen = () => {
      const sub: HubMessage = { type: 'subscribe', role: 'pet' }
      ws.send(JSON.stringify(sub))
      console.log(`[${config.name}] Connected to hub`)
    }

    ws.onmessage = (event) => {
      try {
        const msg: HubMessage = JSON.parse(event.data)
        if (msg.type !== 'sensor_reading') return
        handleReading(msg.data)
      } catch { /* ignore */ }
    }

    ws.onclose = () => {
      if (!closed) setTimeout(connect, 3000)
    }
  }

  function handleReading(reading: SensorReading) {
    const result = compareToThresholds(reading, config.thresholds, levelState)
    if (!result) return

    levelState[result.sensor] = result.level

    const event: ThresholdEvent = {
      petId,
      petName: config.name,
      personality: config.personality,
      sensor: result.sensor as keyof SensorReading,
      level: result.level,
      value: result.value,
      promptTemplate: config.onThreshold
        ? config.onThreshold({ petId, petName: config.name, personality: config.personality, sensor: result.sensor as keyof SensorReading, level: result.level, value: result.value, promptTemplate: '' })
        : DEFAULT_PROMPT({ petId, petName: config.name, personality: config.personality, sensor: result.sensor as keyof SensorReading, level: result.level, value: result.value, promptTemplate: '' }),
    }

    const msg: HubMessage = { type: 'threshold_event', data: event }
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg))
  }

  connect()
  return () => { closed = true; ws?.close() }
}
