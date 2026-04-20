import { createSensor } from '@stem/sensor-client'
document.getElementById('name')!.textContent = '👥 People Counter'
createSensor({
  label: 'People Counter',
  sensors: [],
  camera: { enabled: true, detect: ['people'] },
})
