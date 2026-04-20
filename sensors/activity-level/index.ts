import { createSensor } from '@stem/sensor-client'
document.getElementById('name')!.textContent = '🏃 Activity Level'
createSensor({
  label: 'Activity Level',
  sensors: [],
  camera: { enabled: true, detect: ['activity'] },
})
