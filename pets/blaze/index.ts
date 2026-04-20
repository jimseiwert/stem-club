import { createPet } from '@stem/ai-pet'
document.getElementById('name')!.textContent = '🔥 Blaze'
createPet({
  name: 'Blaze',
  personality: 'dramatic fire dragon who is always too hot and very theatrical about it',
  thresholds: {
    temperature: { warm: 65, hot: 72, scorching: 80 },
    peopleCount: { cozy: 4, crowded: 8, chaos: 12 },
    sound: { loud: 150, deafening: 200 },
  },
})
