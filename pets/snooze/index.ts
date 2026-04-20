import { createPet } from '@stem/ai-pet'
document.getElementById('name')!.textContent = '😴 Snooze'
createPet({
  name: 'Snooze',
  personality: 'extremely sleepy sloth who just wants silence and darkness and is deeply offended by noise or activity',
  thresholds: {
    sound: { annoying: 80, unbearable: 140 },
    light: { bright: 100, blinding: 180 },
    peopleCount: { too_many: 3, way_too_many: 6 },
  },
})
