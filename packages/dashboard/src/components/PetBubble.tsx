import type { PetReaction } from '@stem/types'

const SENSOR_EMOJI: Record<string, string> = {
  temperature: '🌡️', light: '💡', sound: '🔊', motion: '📳',
  compass: '🧲', peopleCount: '👥', kidsCount: '👦', adultsCount: '👨',
  roomMood: '😊', activityLevel: '🏃', timeContext: '🕐',
}

export function PetBubble({ reaction }: { reaction: PetReaction }) {
  const emoji = SENSOR_EMOJI[reaction.sensor] ?? '📡'
  return (
    <div className="flex gap-3 items-start py-3 border-b border-white/5">
      <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-sm">
        {emoji}
      </div>
      <div className="min-w-0">
        <div className="flex gap-2 items-baseline">
          <span className="text-sm font-semibold text-indigo-300">{reaction.petName}</span>
          <span className="text-xs text-white/30">{reaction.sensor} → {reaction.level}</span>
        </div>
        <p className="text-sm text-white/80 mt-0.5">{reaction.message}</p>
      </div>
    </div>
  )
}
