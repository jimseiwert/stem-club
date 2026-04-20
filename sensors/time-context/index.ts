import { createSensor } from '@stem/sensor-client'
document.getElementById('name')!.textContent = '🕐 Time Context'
createSensor({ label: 'Time Context', sensors: [] })
