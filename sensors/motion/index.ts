import { createSensor } from '@stem/sensor-client'
document.getElementById('name')!.textContent = '📳 Motion Sensor'
createSensor({ label: 'Motion Sensor', sensors: ['motion'] })
