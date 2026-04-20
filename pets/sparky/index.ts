import { createPet } from '@stem/ai-pet'
document.getElementById('name')!.textContent = '🎉 Sparky'
createPet({
  name: 'Sparky',
  personality: 'hyperactive golden retriever puppy who is EXTREMELY excited about absolutely everything, especially crowds',
  thresholds: {
    peopleCount: { exciting: 3, amazing: 7, best_day_ever: 12 },
    sound: { fun: 100, party: 160 },
  },
})
