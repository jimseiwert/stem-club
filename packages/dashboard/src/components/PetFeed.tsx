import type { PetReaction } from '@stem/types'
import { PetBubble } from './PetBubble'

export function PetFeed({ reactions }: { reactions: PetReaction[] }) {
  if (reactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-white/30 text-sm">
        Pets will react here when sensors send data...
      </div>
    )
  }
  return (
    <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
      {reactions.map((r) => <PetBubble key={`${r.petId}-${r.timestamp}`} reaction={r} />)}
    </div>
  )
}
