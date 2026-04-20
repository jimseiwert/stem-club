import { createSensor } from '@stem/sensor-client'
document.getElementById('name')!.textContent = '🔊 Sound Sensor'
createSensor({ label: 'Sound Sensor', sensors: ['sound'] })
