#!/usr/bin/env node
import * as p from '@clack/prompts'
import fs from 'fs'
import path from 'path'
import { PET_NAMES, SENSOR_NAMES, PET_LABELS, SENSOR_LABELS, petTemplate, sensorTemplate } from './templates.js'
import type { PetName, SensorName } from './templates.js'

p.intro('🚀 Welcome to the STEM Smart Classroom!')

const type = await p.select({
  message: 'What are you building?',
  options: [
    { value: 'pet', label: '🤖 AI Pet — reacts to sensor data' },
    { value: 'sensor', label: '📡 Sensor — reads real-world data' },
  ],
})

if (p.isCancel(type)) { p.cancel('See you later!'); process.exit(0) }

if (type === 'pet') {
  const petName = await p.select({
    message: 'Pick your pet:',
    options: PET_NAMES.map((n) => ({ value: n, label: PET_LABELS[n] })),
  }) as PetName
  if (p.isCancel(petName)) { p.cancel('See you later!'); process.exit(0) }

  const customName = await p.text({
    message: 'What do you want to name your pet?',
    defaultValue: petName.charAt(0).toUpperCase() + petName.slice(1),
    placeholder: 'Inferno',
  }) as string
  if (p.isCancel(customName)) { p.cancel('See you later!'); process.exit(0) }

  const dir = `${customName.toLowerCase()}-pet`
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.ts'), petTemplate(petName, customName))
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
    name: `my-pet-${customName.toLowerCase()}`,
    type: 'module',
    scripts: { dev: 'vite', build: 'vite build' },
    dependencies: { '@stem/ai-pet': '*' },
    devDependencies: { typescript: '^5.8.3', vite: '^6.3.3' },
  }, null, 2))
  fs.writeFileSync(path.join(dir, 'index.html'), `<!DOCTYPE html>\n<html>\n<head><title>${customName}</title></head>\n<body><h1>${customName}</h1><script type="module" src="./index.ts"></script></body>\n</html>`)
  fs.writeFileSync(path.join(dir, '.env'), 'HUB_URL=ws://localhost:8080\n')

  p.outro(`✅ Created: ${dir}/index.ts\n   Edit the ✏️ lines to make it yours.\n   Run: cd ${dir} && npm install && npm run dev`)

} else {
  const sensorName = await p.select({
    message: 'Pick your sensor:',
    options: SENSOR_NAMES.map((n) => ({ value: n, label: SENSOR_LABELS[n] })),
  }) as SensorName
  if (p.isCancel(sensorName)) { p.cancel('See you later!'); process.exit(0) }

  const label = await p.text({
    message: 'Where is this sensor? (e.g. "Front of Room", "My Desk")',
    placeholder: 'Front of Room',
  }) as string
  if (p.isCancel(label)) { p.cancel('See you later!'); process.exit(0) }

  const dir = `${label.toLowerCase().replace(/\s+/g, '-')}-sensor`
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.ts'), sensorTemplate(sensorName, label))
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
    name: `my-sensor-${sensorName}`,
    type: 'module',
    scripts: { dev: 'vite', build: 'vite build' },
    dependencies: { '@stem/sensor-client': '*' },
    devDependencies: { typescript: '^5.8.3', vite: '^6.3.3' },
  }, null, 2))
  fs.writeFileSync(path.join(dir, 'index.html'), `<!DOCTYPE html>\n<html>\n<head><title>${label} Sensor</title></head>\n<body><h1>${label}</h1><script type="module" src="./index.ts"></script></body>\n</html>`)
  fs.writeFileSync(path.join(dir, '.env'), 'HUB_URL=ws://localhost:8080\n')

  p.outro(`✅ Created: ${dir}/index.ts\n   Edit the ✏️ lines to make it yours.\n   Run: cd ${dir} && npm install && npm run dev`)
}
