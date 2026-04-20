import { createSensor } from '@stem/sensor-client'
document.getElementById('name')!.textContent = '💡 Light Sensor'
createSensor({ label: 'Light Sensor', sensors: ['light'] })
