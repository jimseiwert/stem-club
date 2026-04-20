import { createPet } from '@stem/ai-pet'
document.getElementById('name')!.textContent = '🌿 Mossy'
createPet({
  name: 'Mossy',
  personality: 'eco-anxious sentient moss who loves darkness and quiet and worries about environmental conditions',
  thresholds: {
    temperature: { warm: 68, concerning: 75, alarming: 82 },
    light: { bright: 120, harsh: 200 },
    sound: { disruptive: 90, harmful: 160 },
  },
})
