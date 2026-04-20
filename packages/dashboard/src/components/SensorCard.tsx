import type { SensorReading } from '@stem/types'

export function SensorCard({ reading }: { reading: SensorReading }) {
  const age = Math.round((Date.now() - reading.timestamp) / 1000)
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-white">{reading.label}</h3>
        <span className="text-xs text-white/40">{age}s ago</span>
      </div>
      <div className="grid grid-cols-2 gap-1 text-sm">
        {reading.temperature !== undefined && (
          <Stat label="Temp" value={`${reading.temperature}°F`} />
        )}
        {reading.light !== undefined && (
          <Stat label="Light" value={`${reading.light}/255`} />
        )}
        {reading.sound !== undefined && (
          <Stat label="Sound" value={`${reading.sound}/255`} />
        )}
        {reading.motion !== undefined && (
          <Stat label="Motion" value={reading.motion ? 'yes' : 'no'} />
        )}
        {reading.peopleCount !== undefined && (
          <Stat label="People" value={String(reading.peopleCount)} />
        )}
        {reading.kidsCount !== undefined && (
          <Stat label="Kids" value={String(reading.kidsCount)} />
        )}
        {reading.adultsCount !== undefined && (
          <Stat label="Adults" value={String(reading.adultsCount)} />
        )}
        {reading.roomMood !== undefined && (
          <Stat label="Mood" value={reading.roomMood} />
        )}
        {reading.activityLevel !== undefined && (
          <Stat label="Activity" value={reading.activityLevel} />
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 rounded px-2 py-1">
      <span className="text-white/50 text-xs">{label}: </span>
      <span className="text-white font-mono text-xs">{value}</span>
    </div>
  )
}
