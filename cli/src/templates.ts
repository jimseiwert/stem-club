export const PET_NAMES = ['blaze','frost','zorp','snooze','sparky','duchess','mossy','cipher','chunk','glitch'] as const
export const SENSOR_NAMES = ['temperature','light','sound','motion','compass','people-count','kids-vs-adults','room-mood','activity-level','time-context'] as const

export type PetName = typeof PET_NAMES[number]
export type SensorName = typeof SENSOR_NAMES[number]

export const PET_LABELS: Record<PetName, string> = {
  blaze: '🔥 Blaze — dramatic fire dragon',
  frost: '❄️ Frost — chill snow fox',
  zorp: '🤖 Zorp — logic-obsessed robot',
  snooze: '😴 Snooze — sleepy sloth',
  sparky: '🎉 Sparky — hyperactive party pup',
  duchess: '👑 Duchess — snooty royal cat',
  mossy: '🌿 Mossy — eco-anxious plant',
  cipher: '🕵️ Cipher — mysterious spy',
  chunk: '🍕 Chunk — food-obsessed gremlin',
  glitch: '🌀 Glitch — chaotic gremlin',
}

export const SENSOR_LABELS: Record<SensorName, string> = {
  temperature: '🌡️ Temperature',
  light: '💡 Light Level',
  sound: '🔊 Sound / Noise',
  motion: '📳 Motion / Shake',
  compass: '🧲 Compass Direction',
  'people-count': '👥 People Counter (webcam)',
  'kids-vs-adults': '👦👨 Kids vs Adults (webcam)',
  'room-mood': '😊 Room Mood (webcam)',
  'activity-level': '🏃 Activity Level (webcam)',
  'time-context': '🕐 Time of Day',
}

export function petTemplate(petName: PetName, customName: string): string {
  return `import { createPet } from '@stem/ai-pet'

// ✏️ YOUR PET — change anything below!
export default createPet({
  name: "${customName}",                     // ✏️ your pet's name
  personality: "${getPetPersonality(petName)}", // ✏️ describe your pet

  thresholds: ${getPetThresholds(petName)}
  // WebSocket, AI calls, dashboard — all handled for you ✅
})
`
}

export function sensorTemplate(sensorName: SensorName, label: string): string {
  return `import { createSensor } from '@stem/sensor-client'

// ✏️ YOUR SENSOR — change anything below!
export default createSensor({
  label: "${label}",          // ✏️ where is your sensor?
  ${getSensorConfig(sensorName)}
  // USB, WebSocket, broadcasting — all handled for you ✅
})
`
}

function getPetPersonality(name: PetName): string {
  const map: Record<PetName, string> = {
    blaze: 'dramatic fire dragon who is always too hot',
    frost: 'chill snow fox who finds everything comfortable',
    zorp: 'logic-obsessed robot who speaks in data',
    snooze: 'sleepy sloth who hates noise and activity',
    sparky: 'hyperactive party pup who loves crowds',
    duchess: 'snooty royal cat who judges everything',
    mossy: 'eco-anxious plant creature who loves quiet',
    cipher: 'mysterious spy who speaks in riddles',
    chunk: 'food-obsessed gremlin who relates everything to snacks',
    glitch: 'chaotic gremlin with corrupted memory',
  }
  return map[name]
}

function getPetThresholds(name: PetName): string {
  const map: Record<PetName, string> = {
    blaze: `{\n    temperature: { hot: 50, scorching: 80 },  // ✏️ I panic at 50°!\n    peopleCount: { crowded: 5 },\n  }`,
    frost: `{\n    temperature: { warm: 85, hot: 100 },      // ✏️ takes a lot to bother me\n    peopleCount: { busy: 10 },\n  }`,
    zorp: `{\n    temperature: { suboptimal: 60, critical: 85 },\n    peopleCount: { elevated: 10 },\n  }`,
    snooze: `{\n    sound: { annoying: 80, unbearable: 140 },  // ✏️ I hate noise\n    peopleCount: { too_many: 3 },\n  }`,
    sparky: `{\n    peopleCount: { exciting: 3, best_day_ever: 10 }, // ✏️ more people = more fun\n    sound: { party: 160 },\n  }`,
    duchess: `{\n    peopleCount: { tiresome: 5, dreadful: 10 },\n    temperature: { tepid: 65 },\n  }`,
    mossy: `{\n    temperature: { concerning: 75, alarming: 82 },\n    sound: { disruptive: 90 },\n  }`,
    cipher: `{\n    peopleCount: { suspicious: 4 },\n    light: { revealing: 130 },\n  }`,
    chunk: `{\n    temperature: { like_warm_pizza: 70, like_a_hot_oven: 82 },\n    peopleCount: { pizza_party_size: 5 },\n  }`,
    glitch: `{\n    temperature: { warm: 67, hot: 77 },\n    sound: { loud: 100 },\n  }`,
  }
  return map[name]
}

function getSensorConfig(name: SensorName): string {
  const microbitSensors: SensorName[] = ['temperature', 'light', 'sound', 'motion', 'compass']
  if (microbitSensors.includes(name)) {
    return `sensors: ['${name}'],  // ✏️ plug in your micro:bit!`
  }
  const detect = name === 'people-count' ? "['people']" :
    name === 'kids-vs-adults' ? "['people', 'age_group']" :
    name === 'room-mood' ? "['mood']" :
    name === 'activity-level' ? "['activity']" : "'people'"
  if (name === 'time-context') return `sensors: [],  // no hardware needed`
  return `sensors: [],\n  camera: { enabled: true, detect: ${detect} },  // ✏️ allow camera access in Chrome`
}
