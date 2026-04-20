'use client'
import { useEffect, useRef, useState } from 'react'
import type { HubMessage, SensorReading, PetReaction } from '@stem/types'

const HUB_URL = process.env.NEXT_PUBLIC_HUB_URL ?? 'ws://localhost:8080'

export function useHub() {
  const [sensors, setSensors] = useState<Map<string, SensorReading>>(new Map())
  const [reactions, setReactions] = useState<PetReaction[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(HUB_URL)
      wsRef.current = ws

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'subscribe', role: 'display' } satisfies HubMessage))
      }

      ws.onmessage = (event) => {
        try {
          const msg: HubMessage = JSON.parse(event.data)
          if (msg.type === 'sensor_reading') {
            setSensors((prev) => new Map(prev).set(msg.data.sensorId, msg.data))
          } else if (msg.type === 'pet_reaction') {
            setReactions((prev) => [msg.data, ...prev].slice(0, 50))
          }
        } catch { /* ignore */ }
      }

      ws.onclose = () => setTimeout(connect, 3000)
    }

    connect()
    return () => { wsRef.current?.close() }
  }, [])

  return { sensors: Array.from(sensors.values()), reactions }
}
