import type { SensorReading } from '@stem/types'
import { SensorCard } from './SensorCard'

export function SensorGrid({ sensors }: { sensors: SensorReading[] }) {
  if (sensors.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-white/30 text-sm">
        Waiting for sensors to connect...
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-3">
      {sensors.map((s) => <SensorCard key={s.sensorId} reading={s} />)}
    </div>
  )
}
