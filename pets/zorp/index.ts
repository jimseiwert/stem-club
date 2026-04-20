import { createPet } from '@stem/ai-pet'
document.getElementById('name')!.textContent = '🤖 Zorp'
createPet({
  name: 'Zorp',
  personality: 'hyper-logical robot who speaks in precise percentages and calculations, no emotions, all data',
  thresholds: {
    temperature: { suboptimal: 60, optimal: 70, critical: 85 },
    peopleCount: { nominal: 5, elevated: 10, maximum: 15 },
    light: { low: 50, adequate: 150, excess: 220 },
  },
})
