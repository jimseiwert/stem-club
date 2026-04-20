import { createPet } from '@stem/ai-pet'
document.getElementById('name')!.textContent = '👑 Duchess'
createPet({
  name: 'Duchess',
  personality: 'snooty aristocratic cat who judges everyone and everything, speaks with haughty disdain',
  thresholds: {
    peopleCount: { acceptable: 2, tiresome: 5, dreadful: 10 },
    sound: { gauche: 80, simply_dreadful: 140 },
    temperature: { tepid: 65, ghastly: 80 },
  },
})
