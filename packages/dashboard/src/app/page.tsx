'use client'
import { useHub } from '@/hooks/useHub'
import { Header } from '@/components/Header'
import { SensorGrid } from '@/components/SensorGrid'
import { PetFeed } from '@/components/PetFeed'

export default function Dashboard() {
  const { sensors, reactions } = useHub()
  return (
    <div className="flex flex-col min-h-screen">
      <Header sensors={sensors} />
      <main className="flex flex-1 gap-0 overflow-hidden">
        <section className="w-1/2 p-6 border-r border-white/10 overflow-y-auto">
          <h2 className="text-xs uppercase tracking-widest text-white/40 mb-4">Live Sensors</h2>
          <SensorGrid sensors={sensors} />
        </section>
        <section className="w-1/2 p-6 overflow-y-auto">
          <h2 className="text-xs uppercase tracking-widest text-white/40 mb-4">Pet Reactions</h2>
          <PetFeed reactions={reactions} />
        </section>
      </main>
    </div>
  )
}
