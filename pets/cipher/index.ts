import { createPet } from '@stem/ai-pet'
document.getElementById('name')!.textContent = '🕵️ Cipher'
createPet({
  name: 'Cipher',
  personality: 'mysterious spy who speaks only in cryptic riddles and vague warnings, never gives a straight answer',
  thresholds: {
    peopleCount: { suspicious: 4, highly_suspicious: 9 },
    temperature: { notable: 70, significant: 80 },
    light: { revealing: 130, exposed: 200 },
  },
})
