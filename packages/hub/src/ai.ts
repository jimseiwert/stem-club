import Anthropic from '@anthropic-ai/sdk'
import type { ThresholdEvent, PetReaction } from '@stem/types'

const client = new Anthropic()

const lastCallTime = new Map<string, number>()
const RATE_LIMIT_MS = 5000

export async function generateReaction(event: ThresholdEvent): Promise<PetReaction | null> {
  const now = Date.now()
  const last = lastCallTime.get(event.petId) ?? 0
  if (now - last < RATE_LIMIT_MS) return null
  lastCallTime.set(event.petId, now)

  // promptTemplate is already a fully-evaluated string from the pet client
  const prompt = event.promptTemplate

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 80,
    messages: [{ role: 'user', content: prompt }],
  })

  const message = response.content[0].type === 'text' ? response.content[0].text.trim() : ''

  return {
    petId: event.petId,
    petName: event.petName,
    message,
    sensor: String(event.sensor),
    level: event.level,
    timestamp: Date.now(),
  }
}
