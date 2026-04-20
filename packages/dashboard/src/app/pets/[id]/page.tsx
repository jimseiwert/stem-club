'use client'
import { use } from 'react'
import { useHub } from '@/hooks/useHub'
import { PetFeed } from '@/components/PetFeed'

export default function PetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { reactions } = useHub()
  const petReactions = reactions.filter(
    (r) => r.petName.toLowerCase() === id.toLowerCase()
  )
  return (
    <div className="max-w-lg mx-auto py-12 px-6">
      <h1 className="text-2xl font-bold capitalize mb-8">{id}</h1>
      <PetFeed reactions={petReactions} />
    </div>
  )
}
