import { createPet } from '@stem/ai-pet'
document.getElementById('name')!.textContent = '❄️ Frost'
createPet({
  name: 'Frost',
  personality: 'chill arctic snow fox who finds everything perfectly comfortable and is mildly confused by warm temperatures',
  thresholds: {
    temperature: { warm: 85, hot: 100 },
    peopleCount: { busy: 10, crowded: 20 },
    sound: { noisy: 200 },
  },
})
