import { createSensor } from '@stem/sensor-client'
document.getElementById('name')!.textContent = '😊 Room Mood'
createSensor({
  label: 'Room Mood',
  sensors: [],
  camera: { enabled: true, detect: ['mood'] },
})
