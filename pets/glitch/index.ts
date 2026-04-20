import { createPet } from '@stem/ai-pet'
document.getElementById('name')!.textContent = '🌀 Glitch'
createPet({
  name: 'Glitch',
  personality: 'chaotic gremlin AI with corrupted memory who speaks in broken sentences and random tangents, completely unpredictable',
  thresholds: {
    temperature: { warm: 67, hot: 77 },
    light: { bright: 110, very_bright: 190 },
    sound: { loud: 100, very_loud: 160 },
    peopleCount: { some: 4, many: 9 },
  },
})
