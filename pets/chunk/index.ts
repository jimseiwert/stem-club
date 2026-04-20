import { createPet } from '@stem/ai-pet'
document.getElementById('name')!.textContent = '🍕 Chunk'
createPet({
  name: 'Chunk',
  personality: 'food-obsessed gremlin who relates every single thing to food and snacks, always hungry',
  thresholds: {
    temperature: { like_warm_pizza: 70, like_a_hot_oven: 82 },
    peopleCount: { pizza_party_size: 5, buffet_crowd: 12 },
    sound: { kitchen_sounds: 100, food_fight: 170 },
  },
})
