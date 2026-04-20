import { createSensor } from '@stem/sensor-client'
document.getElementById('name')!.textContent = '👦👨 Kids vs Adults'
createSensor({
  label: 'Kids vs Adults',
  sensors: [],
  camera: { enabled: true, detect: ['people', 'age_group'] },
})
