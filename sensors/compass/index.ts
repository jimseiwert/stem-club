import { createSensor } from '@stem/sensor-client'
document.getElementById('name')!.textContent = '🧲 Compass Sensor'
createSensor({ label: 'Compass Sensor', sensors: ['compass'] })
