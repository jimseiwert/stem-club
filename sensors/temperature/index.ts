import { createSensor } from '@stem/sensor-client'
document.getElementById('name')!.textContent = '🌡️ Temperature Sensor'
createSensor({ label: 'Temperature Sensor', sensors: ['temperature'] })
