import type { SensorReading } from '@stem/types'

export function Header({ sensors }: { sensors: SensorReading[] }) {
  const totalPeople = sensors.reduce((max, s) => Math.max(max, s.peopleCount ?? 0), 0)
  const totalKids = sensors.reduce((max, s) => Math.max(max, s.kidsCount ?? 0), 0)
  const totalAdults = sensors.reduce((max, s) => Math.max(max, s.adultsCount ?? 0), 0)

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
      <h1 className="text-xl font-bold text-white">Smart Classroom</h1>
      <div className="flex gap-6 text-sm">
        {totalPeople > 0 && (
          <>
            <span className="text-white/60">👥 <span className="text-white font-semibold">{totalPeople}</span> people</span>
            {totalKids > 0 && <span className="text-white/60">👦 <span className="text-white font-semibold">{totalKids}</span> kids</span>}
            {totalAdults > 0 && <span className="text-white/60">👨 <span className="text-white font-semibold">{totalAdults}</span> adults</span>}
          </>
        )}
        <span className="text-white/40">{sensors.length} sensor{sensors.length !== 1 ? 's' : ''} live</span>
      </div>
    </header>
  )
}
