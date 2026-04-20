# Smart Classroom STEM Program — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete "Smart Classroom" STEM program infrastructure — monorepo with shared libraries, WebSocket hub, Next.js dashboard, 10 prebuilt pets, 10 prebuilt sensors, and a CLI scaffolder — so 11–12 year old beginners can run `npx stem init`, edit ~20 lines of TypeScript, and have a working piece of a live AI-powered classroom system.

**Architecture:** npm workspace monorepo with five packages (`types`, `ai-pet`, `sensor-client`, `hub`, `dashboard`). Sensor and pet clients are Vite browser apps that connect to a central Node.js WebSocket hub. The hub holds the Anthropic API key and proxies all Claude calls, so no student laptop ever touches credentials. On demo day the hub runs on Railway and the dashboard on Vercel.

**Tech Stack:** TypeScript 5, npm workspaces, Vite 6, Node.js 24, `ws` (WebSocket), Anthropic SDK, Next.js 15 App Router, Tailwind CSS 4, Vitest, Railway, Vercel.

---

## File Map

```
stem/
├── package.json                          # workspace root, scripts
├── tsconfig.base.json                    # shared TS config extended by all packages
├── packages/
│   ├── types/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/index.ts                  # SensorReading, PetReaction, HubMessage, ThresholdEvent
│   ├── hub/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts                  # server entry — starts WS server on PORT (default 8080)
│   │       ├── broadcast.ts              # routes messages by role, fans out to correct clients
│   │       └── ai.ts                     # Claude API wrapper — called by broadcast when threshold event arrives
│   ├── ai-pet/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts                  # exports createPet()
│   │       ├── threshold.ts              # compareToThresholds() — pure function, fully testable
│   │       └── hub-client.ts             # WS connection, reconnect loop, message dispatch
│   ├── sensor-client/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts                  # exports createSensor()
│   │       ├── serial.ts                 # Web Serial API — reads micro:bit JSON over USB
│   │       ├── camera.ts                 # getUserMedia + canvas snapshot → Claude vision call
│   │       └── hub-client.ts             # WS publish loop (every 2s)
│   └── dashboard/
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       └── src/
│           ├── app/
│           │   ├── layout.tsx
│           │   ├── page.tsx              # main dashboard (sensor grid left, pet feed right)
│           │   └── pets/[id]/page.tsx    # individual pet page
│           ├── components/
│           │   ├── Header.tsx            # people count + kids/adults ratio
│           │   ├── SensorGrid.tsx        # grid of SensorCard components
│           │   ├── SensorCard.tsx        # one sensor's live readings
│           │   ├── PetFeed.tsx           # scrolling list of PetBubble components
│           │   └── PetBubble.tsx         # one pet reaction with name + triggered sensor
│           └── hooks/
│               └── useHub.ts             # WS subscription — returns { sensors, reactions }
├── pets/
│   ├── _template/                        # used by CLI scaffolder
│   │   ├── package.json
│   │   ├── index.html
│   │   └── index.ts                      # filled in by CLI
│   ├── blaze/index.ts
│   ├── frost/index.ts
│   ├── zorp/index.ts
│   ├── snooze/index.ts
│   ├── sparky/index.ts
│   ├── duchess/index.ts
│   ├── mossy/index.ts
│   ├── cipher/index.ts
│   ├── chunk/index.ts
│   └── glitch/index.ts
├── sensors/
│   ├── _template/                        # used by CLI scaffolder
│   │   ├── package.json
│   │   ├── index.html
│   │   └── index.ts
│   ├── temperature/index.ts
│   ├── light/index.ts
│   ├── sound/index.ts
│   ├── motion/index.ts
│   ├── compass/index.ts
│   ├── people-count/index.ts
│   ├── kids-vs-adults/index.ts
│   ├── room-mood/index.ts
│   ├── activity-level/index.ts
│   └── time-context/index.ts
├── cli/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                      # CLI entry — prompts + file generation
│       └── templates.ts                  # template strings for pet/sensor index.ts files
├── firmware/
│   └── microbit-sensor.js               # MakeCode JavaScript to flash onto micro:bits
└── docs/
```

---

## Task 1: Monorepo Setup

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `.env.example`

- [ ] **Step 1: Create workspace root `package.json`**

```json
{
  "name": "stem",
  "private": true,
  "workspaces": [
    "packages/*",
    "pets/*",
    "sensors/*",
    "cli"
  ],
  "scripts": {
    "hub": "npm run dev --workspace=packages/hub",
    "dashboard": "npm run dev --workspace=packages/dashboard",
    "build": "npm run build --workspaces --if-present",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "typescript": "^5.8.3",
    "vitest": "^3.1.1"
  }
}
```

- [ ] **Step 2: Create `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 3: Create `.gitignore`**

```
node_modules/
dist/
.env
.env.local
.next/
.superpowers/
*.tsbuildinfo
```

- [ ] **Step 4: Create `.env.example`**

```
ANTHROPIC_API_KEY=sk-ant-...
HUB_PORT=8080
HUB_URL=ws://localhost:8080
```

- [ ] **Step 5: Install root dependencies**

```bash
npm install
```

Expected: `package-lock.json` created, no errors.

- [ ] **Step 6: Commit**

```bash
git add package.json tsconfig.base.json .gitignore .env.example
git commit -m "chore: monorepo workspace setup"
```

---

## Task 2: `@stem/types` Package

**Files:**
- Create: `packages/types/package.json`
- Create: `packages/types/tsconfig.json`
- Create: `packages/types/src/index.ts`

- [ ] **Step 1: Create `packages/types/package.json`**

```json
{
  "name": "@stem/types",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.8.3"
  }
}
```

- [ ] **Step 2: Create `packages/types/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `packages/types/src/index.ts`**

```typescript
export interface SensorReading {
  sensorId: string
  label: string
  timestamp: number
  temperature?: number       // °F
  light?: number             // 0–255
  sound?: number             // 0–255
  motion?: boolean
  compass?: number           // degrees 0–360
  peopleCount?: number
  kidsCount?: number
  adultsCount?: number
  activityLevel?: 'low' | 'medium' | 'high'
  roomMood?: string
  timeContext?: string
}

export interface ThresholdEvent {
  petId: string
  petName: string
  personality: string
  sensor: keyof SensorReading
  level: string
  value: number | string | boolean
  promptTemplate: string
}

export interface PetReaction {
  petId: string
  petName: string
  message: string
  sensor: string
  level: string
  timestamp: number
}

export type HubMessage =
  | { type: 'sensor_reading'; data: SensorReading }
  | { type: 'threshold_event'; data: ThresholdEvent }
  | { type: 'pet_reaction'; data: PetReaction }
  | { type: 'subscribe'; role: 'sensor' | 'pet' | 'display' }

export type SensorKey = keyof Pick<
  SensorReading,
  'temperature' | 'light' | 'sound' | 'motion' | 'compass' |
  'peopleCount' | 'kidsCount' | 'adultsCount' | 'activityLevel' |
  'roomMood' | 'timeContext'
>

export type ThresholdMap = Partial<Record<SensorKey, Record<string, number>>>
```

- [ ] **Step 4: Build types**

```bash
npm run build --workspace=packages/types
```

Expected: `packages/types/dist/` created with `index.js` and `index.d.ts`.

- [ ] **Step 5: Commit**

```bash
git add packages/types/
git commit -m "feat: add @stem/types package"
```

---

## Task 3: micro:bit Firmware

**Files:**
- Create: `firmware/microbit-sensor.js`
- Create: `firmware/README.md`

- [ ] **Step 1: Create `firmware/microbit-sensor.js`**

This is MakeCode JavaScript. Go to [makecode.microbit.org](https://makecode.microbit.org), click "JavaScript", paste this code, then Download to get the `.hex` file to drag onto each micro:bit.

```javascript
// STEM Smart Classroom — micro:bit sensor firmware
// Outputs JSON over USB serial every 2 seconds
// Format: {"t":72,"l":180,"s":45,"m":0,"c":270}
//   t = temperature (°F), l = light (0-255),
//   s = sound (0-255), m = motion (0 or 1), c = compass (degrees)

let shaken = 0

input.onGesture(Gesture.Shake, function () {
    shaken = 1
})

basic.forever(function () {
    const tempC = input.temperature()
    const tempF = Math.round(tempC * 9 / 5 + 32)
    serial.writeLine(JSON.stringify({
        t: tempF,
        l: input.lightLevel(),
        s: input.soundLevel(),
        m: shaken,
        c: input.compassHeading()
    }))
    shaken = 0
    basic.pause(2000)
})
```

- [ ] **Step 2: Create `firmware/README.md`**

```markdown
# micro:bit Firmware

## Flashing instructions (do this for all 12 micro:bits before Session 1)

1. Go to https://makecode.microbit.org
2. Click "New Project"
3. Click "JavaScript" tab
4. Paste the contents of microbit-sensor.js
5. Click "Download" — saves a .hex file
6. Plug micro:bit into USB
7. Drag the .hex file onto the MICROBIT drive that appears
8. LED will flash during programming, then show a checkmark

## Serial output format

Every 2 seconds the micro:bit prints one JSON line:
{"t":72,"l":180,"s":45,"m":0,"c":270}

- t: temperature in °F
- l: light level 0–255
- s: sound level 0–255  
- m: shaken since last reading (0 or 1)
- c: compass heading in degrees

## Baud rate: 115200
```

- [ ] **Step 3: Commit**

```bash
git add firmware/
git commit -m "feat: add micro:bit sensor firmware"
```

---

## Task 4: WebSocket Hub

**Files:**
- Create: `packages/hub/package.json`
- Create: `packages/hub/tsconfig.json`
- Create: `packages/hub/src/broadcast.ts`
- Create: `packages/hub/src/ai.ts`
- Create: `packages/hub/src/index.ts`
- Create: `packages/hub/src/broadcast.test.ts`

- [ ] **Step 1: Create `packages/hub/package.json`**

```json
{
  "name": "@stem/hub",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node --env-file=../../.env --watch dist/index.js",
    "build": "tsc",
    "start": "node --env-file=.env dist/index.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0",
    "@stem/types": "*",
    "ws": "^8.18.1"
  },
  "devDependencies": {
    "@types/ws": "^8.5.14",
    "typescript": "^5.8.3",
    "vitest": "^3.1.1"
  }
}
```

- [ ] **Step 2: Create `packages/hub/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Write failing test for broadcast routing in `packages/hub/src/broadcast.test.ts`**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { createBroadcaster } from './broadcast.js'
import type { HubMessage } from '@stem/types'

const makeWs = (role: string) => ({
  role,
  readyState: 1,
  send: vi.fn(),
})

describe('createBroadcaster', () => {
  it('fans sensor_reading out to pets and displays, not other sensors', () => {
    const broadcaster = createBroadcaster(vi.fn())
    const sensor = makeWs('sensor')
    const pet = makeWs('pet')
    const display = makeWs('display')

    broadcaster.addClient(sensor as any, 'sensor')
    broadcaster.addClient(pet as any, 'pet')
    broadcaster.addClient(display as any, 'display')

    const msg: HubMessage = {
      type: 'sensor_reading',
      data: { sensorId: 's1', label: 'Front', timestamp: 1, temperature: 72 }
    }
    broadcaster.handle(sensor as any, msg)

    expect(pet.send).toHaveBeenCalledWith(JSON.stringify(msg))
    expect(display.send).toHaveBeenCalledWith(JSON.stringify(msg))
    expect(sensor.send).not.toHaveBeenCalled()
  })

  it('calls onThresholdEvent when threshold_event received from pet', () => {
    const onThreshold = vi.fn()
    const broadcaster = createBroadcaster(onThreshold)
    const pet = makeWs('pet')
    broadcaster.addClient(pet as any, 'pet')

    const msg: HubMessage = {
      type: 'threshold_event',
      data: {
        petId: 'p1', petName: 'Blaze', personality: 'fire dragon',
        sensor: 'temperature', level: 'hot', value: 72,
        promptTemplate: 'React to hot temperature'
      }
    }
    broadcaster.handle(pet as any, msg)
    expect(onThreshold).toHaveBeenCalledWith(msg.data)
  })

  it('broadcasts pet_reaction to displays only', () => {
    const broadcaster = createBroadcaster(vi.fn())
    const pet = makeWs('pet')
    const display = makeWs('display')
    broadcaster.addClient(pet as any, 'pet')
    broadcaster.addClient(display as any, 'display')

    const reaction: HubMessage = {
      type: 'pet_reaction',
      data: { petId: 'p1', petName: 'Blaze', message: 'Too hot!', sensor: 'temperature', level: 'hot', timestamp: 1 }
    }
    broadcaster.broadcastReaction(reaction.data)
    expect(display.send).toHaveBeenCalledWith(JSON.stringify(reaction))
    expect(pet.send).not.toHaveBeenCalled()
  })

  it('removes client on disconnect', () => {
    const broadcaster = createBroadcaster(vi.fn())
    const display = makeWs('display')
    broadcaster.addClient(display as any, 'display')
    broadcaster.removeClient(display as any)

    const pet = makeWs('pet')
    broadcaster.addClient(pet as any, 'pet')
    const msg: HubMessage = {
      type: 'sensor_reading',
      data: { sensorId: 's1', label: 'x', timestamp: 1 }
    }
    broadcaster.handle(pet as any, msg)
    expect(display.send).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 4: Run test — verify it fails**

```bash
npm run build --workspace=packages/types && npx vitest run packages/hub/src/broadcast.test.ts
```

Expected: FAIL — `broadcast.js` not found.

- [ ] **Step 5: Create `packages/hub/src/broadcast.ts`**

```typescript
import type { HubMessage, PetReaction, ThresholdEvent } from '@stem/types'
import type WebSocket from 'ws'

type ConnectedClient = { ws: WebSocket; role: string }
type ThresholdHandler = (event: ThresholdEvent) => void

export function createBroadcaster(onThresholdEvent: ThresholdHandler) {
  const clients = new Map<WebSocket, ConnectedClient>()

  function addClient(ws: WebSocket, role: string) {
    clients.set(ws, { ws, role })
  }

  function removeClient(ws: WebSocket) {
    clients.delete(ws)
  }

  function sendToRoles(roles: string[], msg: HubMessage) {
    const payload = JSON.stringify(msg)
    for (const client of clients.values()) {
      if (roles.includes(client.role) && client.ws.readyState === 1) {
        client.ws.send(payload)
      }
    }
  }

  function handle(ws: WebSocket, msg: HubMessage) {
    if (msg.type === 'sensor_reading') {
      sendToRoles(['pet', 'display'], msg)
    } else if (msg.type === 'threshold_event') {
      onThresholdEvent(msg.data)
    }
  }

  function broadcastReaction(data: PetReaction) {
    sendToRoles(['display'], { type: 'pet_reaction', data })
  }

  return { addClient, removeClient, handle, broadcastReaction }
}
```

- [ ] **Step 6: Run test — verify it passes**

```bash
npx vitest run packages/hub/src/broadcast.test.ts
```

Expected: 4 tests PASS.

- [ ] **Step 7: Create `packages/hub/src/ai.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk'
import type { ThresholdEvent, PetReaction } from '@stem/types'

const client = new Anthropic()

const lastCallTime = new Map<string, number>()
const RATE_LIMIT_MS = 5000

export async function generateReaction(event: ThresholdEvent): Promise<PetReaction | null> {
  const now = Date.now()
  const last = lastCallTime.get(event.petId) ?? 0
  if (now - last < RATE_LIMIT_MS) return null
  lastCallTime.set(event.petId, now)

  // promptTemplate is already a fully-evaluated string from the pet client
  const prompt = event.promptTemplate

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 80,
    messages: [{ role: 'user', content: prompt }],
  })

  const message = response.content[0].type === 'text' ? response.content[0].text.trim() : ''

  return {
    petId: event.petId,
    petName: event.petName,
    message,
    sensor: String(event.sensor),
    level: event.level,
    timestamp: Date.now(),
  }
}
```

- [ ] **Step 8: Create `packages/hub/src/index.ts`**

```typescript
import { WebSocketServer } from 'ws'
import type { HubMessage } from '@stem/types'
import { createBroadcaster } from './broadcast.js'
import { generateReaction } from './ai.js'

const PORT = Number(process.env.HUB_PORT ?? 8080)
const wss = new WebSocketServer({ port: PORT })

const broadcaster = createBroadcaster(async (event) => {
  const reaction = await generateReaction(event)
  if (reaction) broadcaster.broadcastReaction(reaction)
})

wss.on('connection', (ws) => {
  ws.once('message', (raw) => {
    try {
      const msg: HubMessage = JSON.parse(raw.toString())
      if (msg.type === 'subscribe') {
        broadcaster.addClient(ws, msg.role)
      }
    } catch {
      ws.close()
    }
  })

  ws.on('message', (raw) => {
    try {
      const msg: HubMessage = JSON.parse(raw.toString())
      broadcaster.handle(ws, msg)
    } catch { /* ignore malformed messages */ }
  })

  ws.on('close', () => broadcaster.removeClient(ws))
})

console.log(`Hub running on ws://localhost:${PORT}`)
```

- [ ] **Step 9: Install hub dependencies and build**

```bash
npm install --workspace=packages/hub && npm run build --workspace=packages/hub
```

Expected: `packages/hub/dist/` created, no TypeScript errors.

- [ ] **Step 10: Smoke test hub locally**

```bash
# In one terminal:
npm run hub

# Expected output:
# Hub running on ws://localhost:8080
```

Kill with Ctrl+C.

- [ ] **Step 11: Commit**

```bash
git add packages/hub/
git commit -m "feat: add WebSocket hub with AI proxy"
```

---

## Task 5: `@stem/ai-pet` Library

**Files:**
- Create: `packages/ai-pet/package.json`
- Create: `packages/ai-pet/tsconfig.json`
- Create: `packages/ai-pet/src/threshold.ts`
- Create: `packages/ai-pet/src/threshold.test.ts`
- Create: `packages/ai-pet/src/hub-client.ts`
- Create: `packages/ai-pet/src/index.ts`

- [ ] **Step 1: Create `packages/ai-pet/package.json`**

```json
{
  "name": "@stem/ai-pet",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": { ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" } },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": { "@stem/types": "*" },
  "devDependencies": { "typescript": "^5.8.3", "vitest": "^3.1.1" }
}
```

- [ ] **Step 2: Create `packages/ai-pet/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Write failing threshold tests in `packages/ai-pet/src/threshold.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
import { compareToThresholds } from './threshold.js'
import type { SensorReading, ThresholdMap } from '@stem/types'

const thresholds: ThresholdMap = {
  temperature: { cold: 60, hot: 75, scorching: 90 },
  peopleCount: { empty: 1, cozy: 5, crowded: 10 },
}

describe('compareToThresholds', () => {
  it('returns null when no threshold crossed', () => {
    const reading: SensorReading = { sensorId: 's1', label: 'x', timestamp: 1, temperature: 68 }
    expect(compareToThresholds(reading, thresholds, {})).toBeNull()
  })

  it('returns the first crossed threshold level', () => {
    const reading: SensorReading = { sensorId: 's1', label: 'x', timestamp: 1, temperature: 80 }
    const result = compareToThresholds(reading, thresholds, {})
    expect(result).toEqual({ sensor: 'temperature', level: 'hot', value: 80 })
  })

  it('returns the highest matching level when multiple crossed', () => {
    const reading: SensorReading = { sensorId: 's1', label: 'x', timestamp: 1, temperature: 95 }
    const result = compareToThresholds(reading, thresholds, {})
    expect(result?.level).toBe('scorching')
  })

  it('returns null when level has not changed from previous state', () => {
    const reading: SensorReading = { sensorId: 's1', label: 'x', timestamp: 1, temperature: 80 }
    const prevState = { temperature: 'hot' }
    expect(compareToThresholds(reading, thresholds, prevState)).toBeNull()
  })

  it('fires again when level changes from hot to scorching', () => {
    const reading: SensorReading = { sensorId: 's1', label: 'x', timestamp: 1, temperature: 95 }
    const prevState = { temperature: 'hot' }
    const result = compareToThresholds(reading, thresholds, prevState)
    expect(result).toEqual({ sensor: 'temperature', level: 'scorching', value: 95 })
  })

  it('handles peopleCount threshold', () => {
    const reading: SensorReading = { sensorId: 's1', label: 'x', timestamp: 1, peopleCount: 12 }
    const result = compareToThresholds(reading, thresholds, {})
    expect(result).toEqual({ sensor: 'peopleCount', level: 'crowded', value: 12 })
  })
})
```

- [ ] **Step 4: Run test — verify it fails**

```bash
npx vitest run packages/ai-pet/src/threshold.test.ts
```

Expected: FAIL — `threshold.js` not found.

- [ ] **Step 5: Create `packages/ai-pet/src/threshold.ts`**

```typescript
import type { SensorReading, ThresholdMap } from '@stem/types'

type ThresholdResult = { sensor: string; level: string; value: number }
type LevelState = Partial<Record<string, string>>

export function compareToThresholds(
  reading: SensorReading,
  thresholds: ThresholdMap,
  prevState: LevelState
): ThresholdResult | null {
  for (const [sensorKey, levels] of Object.entries(thresholds)) {
    const value = reading[sensorKey as keyof SensorReading]
    if (typeof value !== 'number') continue

    const sorted = Object.entries(levels).sort((a, b) => b[1] - a[1])
    const matched = sorted.find(([, threshold]) => value >= threshold)
    if (!matched) continue

    const [level] = matched
    if (prevState[sensorKey] === level) continue

    return { sensor: sensorKey, level, value }
  }
  return null
}
```

- [ ] **Step 6: Run test — verify it passes**

```bash
npx vitest run packages/ai-pet/src/threshold.test.ts
```

Expected: 6 tests PASS.

- [ ] **Step 7: Create `packages/ai-pet/src/hub-client.ts`**

```typescript
import type { HubMessage, SensorReading, ThresholdEvent, ThresholdMap } from '@stem/types'
import { compareToThresholds } from './threshold.js'

const DEFAULT_PROMPT = (e: ThresholdEvent) =>
  `You are ${e.petName}, a ${e.personality}. The room just hit "${e.level}" ${e.sensor} (value: ${e.value}). React in 1 short sentence, in character.`

export interface PetConfig {
  name: string
  personality: string
  thresholds: ThresholdMap
  onThreshold?: (event: ThresholdEvent) => string
}

export function connectPetToHub(config: PetConfig, hubUrl: string): () => void {
  const petId = `pet-${config.name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).slice(2, 6)}`
  const levelState: Partial<Record<string, string>> = {}
  let ws: WebSocket
  let closed = false

  function connect() {
    ws = new WebSocket(hubUrl)

    ws.onopen = () => {
      const sub: HubMessage = { type: 'subscribe', role: 'pet' }
      ws.send(JSON.stringify(sub))
      console.log(`[${config.name}] Connected to hub`)
    }

    ws.onmessage = (event) => {
      try {
        const msg: HubMessage = JSON.parse(event.data)
        if (msg.type !== 'sensor_reading') return
        handleReading(msg.data)
      } catch { /* ignore */ }
    }

    ws.onclose = () => {
      if (!closed) setTimeout(connect, 3000)
    }
  }

  function handleReading(reading: SensorReading) {
    const result = compareToThresholds(reading, config.thresholds, levelState)
    if (!result) return

    levelState[result.sensor] = result.level

    const event: ThresholdEvent = {
      petId,
      petName: config.name,
      personality: config.personality,
      sensor: result.sensor as keyof SensorReading,
      level: result.level,
      value: result.value,
      promptTemplate: config.onThreshold
        ? config.onThreshold({ petId, petName: config.name, personality: config.personality, sensor: result.sensor as keyof SensorReading, level: result.level, value: result.value, promptTemplate: '' })
        : DEFAULT_PROMPT({ petId, petName: config.name, personality: config.personality, sensor: result.sensor as keyof SensorReading, level: result.level, value: result.value, promptTemplate: '' }),
    }

    const msg: HubMessage = { type: 'threshold_event', data: event }
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg))
  }

  connect()
  return () => { closed = true; ws?.close() }
}
```

- [ ] **Step 8: Create `packages/ai-pet/src/index.ts`**

```typescript
import { connectPetToHub, type PetConfig } from './hub-client.js'

const HUB_URL = (typeof window !== 'undefined' && (window as any).__STEM_HUB_URL__) ||
  (typeof process !== 'undefined' && process.env.HUB_URL) ||
  'ws://localhost:8080'

export function createPet(config: PetConfig) {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => connectPetToHub(config, HUB_URL))
  } else {
    connectPetToHub(config, HUB_URL)
  }
}

// PetConfig lives in hub-client, ThresholdMap lives in @stem/types
export type { PetConfig } from './hub-client.js'
export type { ThresholdMap } from '@stem/types'
```

- [ ] **Step 9: Build and verify**

```bash
npm run build --workspace=packages/types && npm run build --workspace=packages/ai-pet
```

Expected: `packages/ai-pet/dist/` created, no TypeScript errors.

- [ ] **Step 10: Commit**

```bash
git add packages/ai-pet/
git commit -m "feat: add @stem/ai-pet library with threshold detection"
```

---

## Task 6: `@stem/sensor-client` Library

**Files:**
- Create: `packages/sensor-client/package.json`
- Create: `packages/sensor-client/tsconfig.json`
- Create: `packages/sensor-client/src/serial.ts`
- Create: `packages/sensor-client/src/camera.ts`
- Create: `packages/sensor-client/src/hub-client.ts`
- Create: `packages/sensor-client/src/index.ts`
- Create: `packages/sensor-client/src/serial.test.ts`

- [ ] **Step 1: Create `packages/sensor-client/package.json`**

```json
{
  "name": "@stem/sensor-client",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": { ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" } },
  "scripts": { "build": "tsc", "dev": "tsc --watch" },
  "dependencies": { "@stem/types": "*" },
  "devDependencies": { "typescript": "^5.8.3", "vitest": "^3.1.1" }
}
```

- [ ] **Step 2: Create `packages/sensor-client/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Write failing test for serial parser in `packages/sensor-client/src/serial.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
import { parseMicrobitLine } from './serial.js'

describe('parseMicrobitLine', () => {
  it('parses a valid JSON line from the micro:bit', () => {
    const result = parseMicrobitLine('{"t":72,"l":180,"s":45,"m":0,"c":270}')
    expect(result).toEqual({ temperature: 72, light: 180, sound: 45, motion: false, compass: 270 })
  })

  it('returns null for an invalid line', () => {
    expect(parseMicrobitLine('not json')).toBeNull()
    expect(parseMicrobitLine('')).toBeNull()
  })

  it('treats m=1 as motion true', () => {
    const result = parseMicrobitLine('{"t":70,"l":100,"s":20,"m":1,"c":90}')
    expect(result?.motion).toBe(true)
  })

  it('clamps values to valid ranges', () => {
    const result = parseMicrobitLine('{"t":200,"l":300,"s":300,"m":0,"c":400}')
    expect(result?.temperature).toBe(200)
    expect(result?.light).toBe(255)
    expect(result?.sound).toBe(255)
    expect(result?.compass).toBe(360)
  })
})
```

- [ ] **Step 4: Run test — verify it fails**

```bash
npx vitest run packages/sensor-client/src/serial.test.ts
```

Expected: FAIL.

- [ ] **Step 5: Create `packages/sensor-client/src/serial.ts`**

```typescript
type MicrobitData = {
  temperature: number
  light: number
  sound: number
  motion: boolean
  compass: number
}

export function parseMicrobitLine(line: string): MicrobitData | null {
  if (!line.trim()) return null
  try {
    const raw = JSON.parse(line)
    if (typeof raw.t !== 'number') return null
    return {
      temperature: raw.t,
      light: Math.min(255, raw.l ?? 0),
      sound: Math.min(255, raw.s ?? 0),
      motion: raw.m === 1,
      compass: Math.min(360, raw.c ?? 0),
    }
  } catch {
    return null
  }
}

export async function openMicrobitSerial(): Promise<ReadableStream<string> | null> {
  if (!('serial' in navigator)) {
    console.warn('[sensor] Web Serial not available — use Chrome or Edge')
    return null
  }
  try {
    const port = await (navigator as any).serial.requestPort()
    await port.open({ baudRate: 115200 })
    const decoder = new TextDecoderStream()
    port.readable.pipeTo(decoder.writable)
    return decoder.readable
  } catch (err) {
    console.error('[sensor] Failed to open serial port:', err)
    return null
  }
}
```

- [ ] **Step 6: Run test — verify it passes**

```bash
npx vitest run packages/sensor-client/src/serial.test.ts
```

Expected: 4 tests PASS.

- [ ] **Step 7: Create `packages/sensor-client/src/camera.ts`**

```typescript
// Captures a webcam frame and sends to Claude vision API (via hub) for analysis

export type CameraDetect = ('people' | 'age_group' | 'mood' | 'activity')[]

export interface CameraResult {
  peopleCount?: number
  kidsCount?: number
  adultsCount?: number
  roomMood?: string
  activityLevel?: 'low' | 'medium' | 'high'
}

let videoEl: HTMLVideoElement | null = null
let canvas: HTMLCanvasElement | null = null

export async function startCamera(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    videoEl = document.createElement('video')
    videoEl.srcObject = stream
    videoEl.play()
    canvas = document.createElement('canvas')
    canvas.width = 640
    canvas.height = 480
    return true
  } catch {
    console.warn('[sensor] Camera not available')
    return false
  }
}

export function captureFrame(): string | null {
  if (!videoEl || !canvas) return null
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(videoEl, 0, 0, 640, 480)
  return canvas.toDataURL('image/jpeg', 0.6).split(',')[1]
}

// Camera analysis is done server-side by the hub to protect the API key.
// The sensor client sends the base64 frame as part of the SensorReading.
// The hub analyses it and enriches the broadcast before fanning out.
export function buildCameraPayload(frame: string): Pick<CameraResult, never> & { _cameraFrame: string } {
  return { _cameraFrame: frame }
}
```

- [ ] **Step 8: Create `packages/sensor-client/src/hub-client.ts`**

```typescript
import type { HubMessage, SensorReading } from '@stem/types'
import { openMicrobitSerial, parseMicrobitLine } from './serial.js'
import { startCamera, captureFrame } from './camera.js'

export interface SensorConfig {
  label: string
  sensors: ('temperature' | 'light' | 'sound' | 'motion' | 'compass')[]
  camera?: {
    enabled: boolean
    detect: ('people' | 'age_group' | 'mood' | 'activity')[]
  }
}

export async function connectSensorToHub(config: SensorConfig, hubUrl: string): Promise<void> {
  const sensorId = `sensor-${config.label.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).slice(2, 6)}`
  let currentReading: Partial<SensorReading> = {}
  let ws: WebSocket
  let closed = false

  if (config.camera?.enabled) await startCamera()

  const stream = await openMicrobitSerial()
  if (stream) {
    const reader = stream.getReader()
    let buffer = ''
    ;(async () => {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += value
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          const data = parseMicrobitLine(line)
          if (!data) continue
          if (config.sensors.includes('temperature')) currentReading.temperature = data.temperature
          if (config.sensors.includes('light')) currentReading.light = data.light
          if (config.sensors.includes('sound')) currentReading.sound = data.sound
          if (config.sensors.includes('motion')) currentReading.motion = data.motion
          if (config.sensors.includes('compass')) currentReading.compass = data.compass
        }
      }
    })()
  }

  function connect() {
    ws = new WebSocket(hubUrl)
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', role: 'sensor' } satisfies HubMessage))
      console.log(`[${config.label}] Connected to hub`)

      setInterval(() => {
        if (ws.readyState !== WebSocket.OPEN) return
        const frame = config.camera?.enabled ? captureFrame() : null
        const reading: SensorReading = {
          ...currentReading,
          sensorId,
          label: config.label,
          timestamp: Date.now(),
          ...(frame ? { _cameraFrame: frame } as any : {}),
        }
        const msg: HubMessage = { type: 'sensor_reading', data: reading }
        ws.send(JSON.stringify(msg))
      }, 2000)
    }
    ws.onclose = () => { if (!closed) setTimeout(connect, 3000) }
  }

  connect()
}
```

- [ ] **Step 9: Create `packages/sensor-client/src/index.ts`**

```typescript
import { connectSensorToHub, type SensorConfig } from './hub-client.js'

const HUB_URL = (typeof window !== 'undefined' && (window as any).__STEM_HUB_URL__) ||
  (typeof process !== 'undefined' && process.env.HUB_URL) ||
  'ws://localhost:8080'

export function createSensor(config: SensorConfig) {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => connectSensorToHub(config, HUB_URL))
  } else {
    connectSensorToHub(config, HUB_URL)
  }
}

export type { SensorConfig } from './hub-client.js'
```

- [ ] **Step 10: Build**

```bash
npm run build --workspace=packages/sensor-client
```

Expected: `packages/sensor-client/dist/` created, no TypeScript errors.

- [ ] **Step 11: Commit**

```bash
git add packages/sensor-client/
git commit -m "feat: add @stem/sensor-client library"
```

---

## Task 7: Next.js Dashboard

**Files:**
- Create: `packages/dashboard/package.json`
- Create: `packages/dashboard/next.config.ts`
- Create: `packages/dashboard/tailwind.config.ts`
- Create: `packages/dashboard/src/hooks/useHub.ts`
- Create: `packages/dashboard/src/components/Header.tsx`
- Create: `packages/dashboard/src/components/SensorCard.tsx`
- Create: `packages/dashboard/src/components/SensorGrid.tsx`
- Create: `packages/dashboard/src/components/PetBubble.tsx`
- Create: `packages/dashboard/src/components/PetFeed.tsx`
- Create: `packages/dashboard/src/app/layout.tsx`
- Create: `packages/dashboard/src/app/page.tsx`
- Create: `packages/dashboard/src/app/pets/[id]/page.tsx`

- [ ] **Step 1: Create `packages/dashboard/package.json`**

```json
{
  "name": "@stem/dashboard",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@stem/types": "*",
    "next": "^15.3.1",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@types/node": "^22.15.3",
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2",
    "tailwindcss": "^4.1.4",
    "typescript": "^5.8.3"
  }
}
```

- [ ] **Step 2: Create `packages/dashboard/next.config.ts`**

```typescript
import type { NextConfig } from 'next'

const config: NextConfig = {
  transpilePackages: ['@stem/types'],
}

export default config
```

- [ ] **Step 3: Create `packages/dashboard/tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
} satisfies Config
```

- [ ] **Step 4: Install dashboard dependencies**

```bash
npm install --workspace=packages/dashboard
```

- [ ] **Step 5: Create `packages/dashboard/src/hooks/useHub.ts`**

```typescript
'use client'
import { useEffect, useRef, useState } from 'react'
import type { HubMessage, SensorReading, PetReaction } from '@stem/types'

const HUB_URL = process.env.NEXT_PUBLIC_HUB_URL ?? 'ws://localhost:8080'

export function useHub() {
  const [sensors, setSensors] = useState<Map<string, SensorReading>>(new Map())
  const [reactions, setReactions] = useState<PetReaction[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(HUB_URL)
      wsRef.current = ws

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'subscribe', role: 'display' } satisfies HubMessage))
      }

      ws.onmessage = (event) => {
        try {
          const msg: HubMessage = JSON.parse(event.data)
          if (msg.type === 'sensor_reading') {
            setSensors((prev) => new Map(prev).set(msg.data.sensorId, msg.data))
          } else if (msg.type === 'pet_reaction') {
            setReactions((prev) => [msg.data, ...prev].slice(0, 50))
          }
        } catch { /* ignore */ }
      }

      ws.onclose = () => setTimeout(connect, 3000)
    }

    connect()
    return () => { wsRef.current?.close() }
  }, [])

  return { sensors: Array.from(sensors.values()), reactions }
}
```

- [ ] **Step 6: Create `packages/dashboard/src/components/SensorCard.tsx`**

```tsx
import type { SensorReading } from '@stem/types'

export function SensorCard({ reading }: { reading: SensorReading }) {
  const age = Math.round((Date.now() - reading.timestamp) / 1000)
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-white">{reading.label}</h3>
        <span className="text-xs text-white/40">{age}s ago</span>
      </div>
      <div className="grid grid-cols-2 gap-1 text-sm">
        {reading.temperature !== undefined && (
          <Stat label="Temp" value={`${reading.temperature}°F`} />
        )}
        {reading.light !== undefined && (
          <Stat label="Light" value={`${reading.light}/255`} />
        )}
        {reading.sound !== undefined && (
          <Stat label="Sound" value={`${reading.sound}/255`} />
        )}
        {reading.motion !== undefined && (
          <Stat label="Motion" value={reading.motion ? 'yes' : 'no'} />
        )}
        {reading.peopleCount !== undefined && (
          <Stat label="People" value={String(reading.peopleCount)} />
        )}
        {reading.kidsCount !== undefined && (
          <Stat label="Kids" value={String(reading.kidsCount)} />
        )}
        {reading.adultsCount !== undefined && (
          <Stat label="Adults" value={String(reading.adultsCount)} />
        )}
        {reading.roomMood !== undefined && (
          <Stat label="Mood" value={reading.roomMood} />
        )}
        {reading.activityLevel !== undefined && (
          <Stat label="Activity" value={reading.activityLevel} />
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 rounded px-2 py-1">
      <span className="text-white/50 text-xs">{label}: </span>
      <span className="text-white font-mono text-xs">{value}</span>
    </div>
  )
}
```

- [ ] **Step 7: Create `packages/dashboard/src/components/SensorGrid.tsx`**

```tsx
import type { SensorReading } from '@stem/types'
import { SensorCard } from './SensorCard'

export function SensorGrid({ sensors }: { sensors: SensorReading[] }) {
  if (sensors.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-white/30 text-sm">
        Waiting for sensors to connect...
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-3">
      {sensors.map((s) => <SensorCard key={s.sensorId} reading={s} />)}
    </div>
  )
}
```

- [ ] **Step 8: Create `packages/dashboard/src/components/PetBubble.tsx`**

```tsx
import type { PetReaction } from '@stem/types'

const SENSOR_EMOJI: Record<string, string> = {
  temperature: '🌡️', light: '💡', sound: '🔊', motion: '📳',
  compass: '🧲', peopleCount: '👥', kidsCount: '👦', adultsCount: '👨',
  roomMood: '😊', activityLevel: '🏃', timeContext: '🕐',
}

export function PetBubble({ reaction }: { reaction: PetReaction }) {
  const emoji = SENSOR_EMOJI[reaction.sensor] ?? '📡'
  return (
    <div className="flex gap-3 items-start py-3 border-b border-white/5">
      <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-sm">
        {emoji}
      </div>
      <div className="min-w-0">
        <div className="flex gap-2 items-baseline">
          <span className="text-sm font-semibold text-indigo-300">{reaction.petName}</span>
          <span className="text-xs text-white/30">{reaction.sensor} → {reaction.level}</span>
        </div>
        <p className="text-sm text-white/80 mt-0.5">{reaction.message}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 9: Create `packages/dashboard/src/components/PetFeed.tsx`**

```tsx
import type { PetReaction } from '@stem/types'
import { PetBubble } from './PetBubble'

export function PetFeed({ reactions }: { reactions: PetReaction[] }) {
  if (reactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-white/30 text-sm">
        Pets will react here when sensors send data...
      </div>
    )
  }
  return (
    <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
      {reactions.map((r) => <PetBubble key={`${r.petId}-${r.timestamp}`} reaction={r} />)}
    </div>
  )
}
```

- [ ] **Step 10: Create `packages/dashboard/src/components/Header.tsx`**

```tsx
import type { SensorReading } from '@stem/types'

export function Header({ sensors }: { sensors: SensorReading[] }) {
  const totalPeople = sensors.reduce((max, s) => Math.max(max, s.peopleCount ?? 0), 0)
  const totalKids = sensors.reduce((max, s) => Math.max(max, s.kidsCount ?? 0), 0)
  const totalAdults = sensors.reduce((max, s) => Math.max(max, s.adultsCount ?? 0), 0)

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
      <h1 className="text-xl font-bold text-white">Smart Classroom</h1>
      <div className="flex gap-6 text-sm">
        {totalPeople > 0 && (
          <>
            <span className="text-white/60">👥 <span className="text-white font-semibold">{totalPeople}</span> people</span>
            {totalKids > 0 && <span className="text-white/60">👦 <span className="text-white font-semibold">{totalKids}</span> kids</span>}
            {totalAdults > 0 && <span className="text-white/60">👨 <span className="text-white font-semibold">{totalAdults}</span> adults</span>}
          </>
        )}
        <span className="text-white/40">{sensors.length} sensor{sensors.length !== 1 ? 's' : ''} live</span>
      </div>
    </header>
  )
}
```

- [ ] **Step 11: Create `packages/dashboard/src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'Smart Classroom' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white antialiased min-h-screen">{children}</body>
    </html>
  )
}
```

- [ ] **Step 12: Create `packages/dashboard/src/app/globals.css`**

```css
@import "tailwindcss";
```

- [ ] **Step 13: Create `packages/dashboard/src/app/page.tsx`**

```tsx
'use client'
import { useHub } from '@/hooks/useHub'
import { Header } from '@/components/Header'
import { SensorGrid } from '@/components/SensorGrid'
import { PetFeed } from '@/components/PetFeed'

export default function Dashboard() {
  const { sensors, reactions } = useHub()
  return (
    <div className="flex flex-col min-h-screen">
      <Header sensors={sensors} />
      <main className="flex flex-1 gap-0 overflow-hidden">
        <section className="w-1/2 p-6 border-r border-white/10 overflow-y-auto">
          <h2 className="text-xs uppercase tracking-widest text-white/40 mb-4">Live Sensors</h2>
          <SensorGrid sensors={sensors} />
        </section>
        <section className="w-1/2 p-6 overflow-y-auto">
          <h2 className="text-xs uppercase tracking-widest text-white/40 mb-4">Pet Reactions</h2>
          <PetFeed reactions={reactions} />
        </section>
      </main>
    </div>
  )
}
```

- [ ] **Step 14: Create `packages/dashboard/src/app/pets/[id]/page.tsx`**

```tsx
'use client'
import { useHub } from '@/hooks/useHub'
import { PetFeed } from '@/components/PetFeed'

export default function PetPage({ params }: { params: { id: string } }) {
  const { reactions } = useHub()
  const petReactions = reactions.filter(
    (r) => r.petName.toLowerCase() === params.id.toLowerCase()
  )
  return (
    <div className="max-w-lg mx-auto py-12 px-6">
      <h1 className="text-2xl font-bold capitalize mb-8">{params.id}</h1>
      <PetFeed reactions={petReactions} />
    </div>
  )
}
```

- [ ] **Step 15: Add `tsconfig.json` for dashboard**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src", "next.config.ts", ".next/types/**/*.ts"]
}
```

- [ ] **Step 16: Build dashboard**

```bash
npm run build --workspace=packages/dashboard
```

Expected: Next.js build succeeds, no TypeScript errors.

- [ ] **Step 17: Commit**

```bash
git add packages/dashboard/
git commit -m "feat: add Next.js dashboard with sensor grid and pet feed"
```

---

## Task 8: Prebuilt Pets (All 10)

**Files:** `pets/blaze/index.ts` through `pets/glitch/index.ts` (10 files), plus each needs a `package.json` and `index.html`.

Each pet folder is a self-contained Vite browser app. Create them all at once with the same structure, varying only the `createPet` config.

- [ ] **Step 1: Create shared `pets/_template/package.json`** (copy this into each pet folder, changing `name`)

```json
{
  "name": "@stem/pet-blaze",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "@stem/ai-pet": "*",
    "@stem/types": "*"
  },
  "devDependencies": {
    "typescript": "^5.8.3",
    "vite": "^6.3.3"
  }
}
```

- [ ] **Step 2: Create shared `pets/_template/index.html`** (identical for all pets)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Pet</title>
  <style>
    body { font-family: sans-serif; background: #0f172a; color: white; padding: 2rem; }
    #log { margin-top: 1rem; font-size: 0.85rem; opacity: 0.6; }
  </style>
</head>
<body>
  <h1 id="name">Loading...</h1>
  <p id="status">Connecting to hub...</p>
  <div id="log"></div>
  <script type="module" src="./index.ts"></script>
</body>
</html>
```

- [ ] **Step 3: Create all 10 pet `index.ts` files**

Create each file below exactly as shown.

**`pets/blaze/index.ts`:**
```typescript
import { createPet } from '@stem/ai-pet'
document.getElementById('name')!.textContent = '🔥 Blaze'
createPet({
  name: 'Blaze',
  personality: 'dramatic fire dragon who is always too hot and very theatrical about it',
  thresholds: {
    temperature: { warm: 65, hot: 72, scorching: 80 },
    peopleCount: { cozy: 4, crowded: 8, chaos: 12 },
    sound: { loud: 150, deafening: 200 },
  },
})
```

**`pets/frost/index.ts`:**
```typescript
import { createPet } from '@stem/ai-pet'
document.getElementById('name')!.textContent = '❄️ Frost'
createPet({
  name: 'Frost',
  personality: 'chill arctic snow fox who finds everything perfectly comfortable and is mildly confused by warm temperatures',
  thresholds: {
    temperature: { warm: 85, hot: 100 },
    peopleCount: { busy: 10, crowded: 20 },
    sound: { noisy: 200 },
  },
})
```

**`pets/zorp/index.ts`:**
```typescript
import { createPet } from '@stem/ai-pet'
document.getElementById('name')!.textContent = '🤖 Zorp'
createPet({
  name: 'Zorp',
  personality: 'hyper-logical robot who speaks in precise percentages and calculations, no emotions, all data',
  thresholds: {
    temperature: { suboptimal: 60, optimal: 70, critical: 85 },
    peopleCount: { nominal: 5, elevated: 10, maximum: 15 },
    light: { low: 50, adequate: 150, excess: 220 },
  },
})
```

**`pets/snooze/index.ts`:**
```typescript
import { createPet } from '@stem/ai-pet'
document.getElementById('name')!.textContent = '😴 Snooze'
createPet({
  name: 'Snooze',
  personality: 'extremely sleepy sloth who just wants silence and darkness and is deeply offended by noise or activity',
  thresholds: {
    sound: { annoying: 80, unbearable: 140 },
    light: { bright: 100, blinding: 180 },
    peopleCount: { too_many: 3, way_too_many: 6 },
  },
})
```

**`pets/sparky/index.ts`:**
```typescript
import { createPet } from '@stem/ai-pet'
document.getElementById('name')!.textContent = '🎉 Sparky'
createPet({
  name: 'Sparky',
  personality: 'hyperactive golden retriever puppy who is EXTREMELY excited about absolutely everything, especially crowds',
  thresholds: {
    peopleCount: { exciting: 3, amazing: 7, best_day_ever: 12 },
    sound: { fun: 100, party: 160 },
    motion: { active: 1 } as any,
  },
})
```

**`pets/duchess/index.ts`:**
```typescript
import { createPet } from '@stem/ai-pet'
document.getElementById('name')!.textContent = '👑 Duchess'
createPet({
  name: 'Duchess',
  personality: 'snooty aristocratic cat who judges everyone and everything, speaks with haughty disdain',
  thresholds: {
    peopleCount: { acceptable: 2, tiresome: 5, dreadful: 10 },
    sound: { gauche: 80, simply_dreadful: 140 },
    temperature: { tepid: 65, ghastly: 80 },
  },
})
```

**`pets/mossy/index.ts`:**
```typescript
import { createPet } from '@stem/ai-pet'
document.getElementById('name')!.textContent = '🌿 Mossy'
createPet({
  name: 'Mossy',
  personality: 'eco-anxious sentient moss who loves darkness and quiet and worries about environmental conditions',
  thresholds: {
    temperature: { warm: 68, concerning: 75, alarming: 82 },
    light: { bright: 120, harsh: 200 },
    sound: { disruptive: 90, harmful: 160 },
  },
})
```

**`pets/cipher/index.ts`:**
```typescript
import { createPet } from '@stem/ai-pet'
document.getElementById('name')!.textContent = '🕵️ Cipher'
createPet({
  name: 'Cipher',
  personality: 'mysterious spy who speaks only in cryptic riddles and vague warnings, never gives a straight answer',
  thresholds: {
    peopleCount: { suspicious: 4, highly_suspicious: 9 },
    temperature: { notable: 70, significant: 80 },
    light: { revealing: 130, exposed: 200 },
  },
})
```

**`pets/chunk/index.ts`:**
```typescript
import { createPet } from '@stem/ai-pet'
document.getElementById('name')!.textContent = '🍕 Chunk'
createPet({
  name: 'Chunk',
  personality: 'food-obsessed gremlin who relates every single thing to food and snacks, always hungry',
  thresholds: {
    temperature: { like_warm_pizza: 70, like_a_hot_oven: 82 },
    peopleCount: { pizza_party_size: 5, buffet_crowd: 12 },
    sound: { kitchen_sounds: 100, food_fight: 170 },
  },
})
```

**`pets/glitch/index.ts`:**
```typescript
import { createPet } from '@stem/ai-pet'
document.getElementById('name')!.textContent = '🌀 Glitch'
createPet({
  name: 'Glitch',
  personality: 'chaotic gremlin AI with corrupted memory who speaks in broken sentences and random tangents, completely unpredictable',
  thresholds: {
    temperature: { warm: 67, hot: 77 },
    light: { bright: 110, very_bright: 190 },
    sound: { loud: 100, very_loud: 160 },
    peopleCount: { some: 4, many: 9 },
  },
})
```

- [ ] **Step 4: Create `package.json` for each pet** (copy template, change name)

Create `pets/blaze/package.json` through `pets/glitch/package.json`, each with the correct `"name"` field (`@stem/pet-blaze`, `@stem/pet-frost`, etc.).

- [ ] **Step 5: Install and verify one pet builds**

```bash
npm install --workspace=pets/blaze
npx vite build pets/blaze --outDir pets/blaze/dist
```

Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add pets/
git commit -m "feat: add 10 prebuilt pet implementations"
```

---

## Task 9: Prebuilt Sensors (All 10)

Each sensor folder is a Vite browser app using `@stem/sensor-client`.

- [ ] **Step 1: Create `sensors/_template/package.json`**

```json
{
  "name": "@stem/sensor-temperature",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": { "dev": "vite", "build": "vite build" },
  "dependencies": { "@stem/sensor-client": "*", "@stem/types": "*" },
  "devDependencies": { "typescript": "^5.8.3", "vite": "^6.3.3" }
}
```

- [ ] **Step 2: Create `sensors/_template/index.html`** (identical to pets template above, change title to "Sensor")

- [ ] **Step 3: Create all 10 sensor `index.ts` files**

**`sensors/temperature/index.ts`:**
```typescript
import { createSensor } from '@stem/sensor-client'
document.getElementById('name')!.textContent = '🌡️ Temperature Sensor'
createSensor({ label: 'Temperature Sensor', sensors: ['temperature'] })
```

**`sensors/light/index.ts`:**
```typescript
import { createSensor } from '@stem/sensor-client'
document.getElementById('name')!.textContent = '💡 Light Sensor'
createSensor({ label: 'Light Sensor', sensors: ['light'] })
```

**`sensors/sound/index.ts`:**
```typescript
import { createSensor } from '@stem/sensor-client'
document.getElementById('name')!.textContent = '🔊 Sound Sensor'
createSensor({ label: 'Sound Sensor', sensors: ['sound'] })
```

**`sensors/motion/index.ts`:**
```typescript
import { createSensor } from '@stem/sensor-client'
document.getElementById('name')!.textContent = '📳 Motion Sensor'
createSensor({ label: 'Motion Sensor', sensors: ['motion'] })
```

**`sensors/compass/index.ts`:**
```typescript
import { createSensor } from '@stem/sensor-client'
document.getElementById('name')!.textContent = '🧲 Compass Sensor'
createSensor({ label: 'Compass Sensor', sensors: ['compass'] })
```

**`sensors/people-count/index.ts`:**
```typescript
import { createSensor } from '@stem/sensor-client'
document.getElementById('name')!.textContent = '👥 People Counter'
createSensor({
  label: 'People Counter',
  sensors: [],
  camera: { enabled: true, detect: ['people'] },
})
```

**`sensors/kids-vs-adults/index.ts`:**
```typescript
import { createSensor } from '@stem/sensor-client'
document.getElementById('name')!.textContent = '👦👨 Kids vs Adults'
createSensor({
  label: 'Kids vs Adults',
  sensors: [],
  camera: { enabled: true, detect: ['people', 'age_group'] },
})
```

**`sensors/room-mood/index.ts`:**
```typescript
import { createSensor } from '@stem/sensor-client'
document.getElementById('name')!.textContent = '😊 Room Mood'
createSensor({
  label: 'Room Mood',
  sensors: [],
  camera: { enabled: true, detect: ['mood'] },
})
```

**`sensors/activity-level/index.ts`:**
```typescript
import { createSensor } from '@stem/sensor-client'
document.getElementById('name')!.textContent = '🏃 Activity Level'
createSensor({
  label: 'Activity Level',
  sensors: [],
  camera: { enabled: true, detect: ['activity'] },
})
```

**`sensors/time-context/index.ts`:**
```typescript
import { createSensor } from '@stem/sensor-client'
document.getElementById('name')!.textContent = '🕐 Time Context'
// Time context is derived from the system clock — no hardware needed
createSensor({ label: 'Time Context', sensors: [] })
```

- [ ] **Step 4: Create `package.json` for each sensor** (copy template, change name field)

- [ ] **Step 5: Commit**

```bash
git add sensors/
git commit -m "feat: add 10 prebuilt sensor implementations"
```

---

## Task 10: CLI Scaffolder (`npx stem init`)

**Files:**
- Create: `cli/package.json`
- Create: `cli/tsconfig.json`
- Create: `cli/src/templates.ts`
- Create: `cli/src/index.ts`

- [ ] **Step 1: Create `cli/package.json`**

```json
{
  "name": "stem",
  "version": "1.0.0",
  "private": false,
  "type": "module",
  "bin": { "stem": "./dist/index.js" },
  "scripts": { "build": "tsc", "dev": "tsc --watch" },
  "dependencies": { "@clack/prompts": "^0.10.1" },
  "devDependencies": { "typescript": "^5.8.3" }
}
```

- [ ] **Step 2: Create `cli/tsconfig.json`**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `cli/src/templates.ts`**

```typescript
export const PET_NAMES = ['blaze','frost','zorp','snooze','sparky','duchess','mossy','cipher','chunk','glitch'] as const
export const SENSOR_NAMES = ['temperature','light','sound','motion','compass','people-count','kids-vs-adults','room-mood','activity-level','time-context'] as const

export type PetName = typeof PET_NAMES[number]
export type SensorName = typeof SENSOR_NAMES[number]

export const PET_LABELS: Record<PetName, string> = {
  blaze: '🔥 Blaze — dramatic fire dragon',
  frost: '❄️ Frost — chill snow fox',
  zorp: '🤖 Zorp — logic-obsessed robot',
  snooze: '😴 Snooze — sleepy sloth',
  sparky: '🎉 Sparky — hyperactive party pup',
  duchess: '👑 Duchess — snooty royal cat',
  mossy: '🌿 Mossy — eco-anxious plant',
  cipher: '🕵️ Cipher — mysterious spy',
  chunk: '🍕 Chunk — food-obsessed gremlin',
  glitch: '🌀 Glitch — chaotic gremlin',
}

export const SENSOR_LABELS: Record<SensorName, string> = {
  temperature: '🌡️ Temperature',
  light: '💡 Light Level',
  sound: '🔊 Sound / Noise',
  motion: '📳 Motion / Shake',
  compass: '🧲 Compass Direction',
  'people-count': '👥 People Counter (webcam)',
  'kids-vs-adults': '👦👨 Kids vs Adults (webcam)',
  'room-mood': '😊 Room Mood (webcam)',
  'activity-level': '🏃 Activity Level (webcam)',
  'time-context': '🕐 Time of Day',
}

export function petTemplate(petName: PetName, customName: string): string {
  return `import { createPet } from '@stem/ai-pet'

// ✏️ YOUR PET — change anything below!
export default createPet({
  name: "${customName}",                     // ✏️ your pet's name
  personality: "${getPetPersonality(petName)}", // ✏️ describe your pet

  thresholds: ${getPetThresholds(petName)}
  // WebSocket, AI calls, dashboard — all handled for you ✅
})
`
}

export function sensorTemplate(sensorName: SensorName, label: string): string {
  return `import { createSensor } from '@stem/sensor-client'

// ✏️ YOUR SENSOR — change anything below!
export default createSensor({
  label: "${label}",          // ✏️ where is your sensor?
  ${getSensorConfig(sensorName)}
  // USB, WebSocket, broadcasting — all handled for you ✅
})
`
}

function getPetPersonality(name: PetName): string {
  const map: Record<PetName, string> = {
    blaze: 'dramatic fire dragon who is always too hot',
    frost: 'chill snow fox who finds everything comfortable',
    zorp: 'logic-obsessed robot who speaks in data',
    snooze: 'sleepy sloth who hates noise and activity',
    sparky: 'hyperactive party pup who loves crowds',
    duchess: 'snooty royal cat who judges everything',
    mossy: 'eco-anxious plant creature who loves quiet',
    cipher: 'mysterious spy who speaks in riddles',
    chunk: 'food-obsessed gremlin who relates everything to snacks',
    glitch: 'chaotic gremlin with corrupted memory',
  }
  return map[name]
}

function getPetThresholds(name: PetName): string {
  const map: Record<PetName, string> = {
    blaze: `{\n    temperature: { hot: 50, scorching: 80 },  // ✏️ I panic at 50°!\n    peopleCount: { crowded: 5 },\n  }`,
    frost: `{\n    temperature: { warm: 85, hot: 100 },      // ✏️ takes a lot to bother me\n    peopleCount: { busy: 10 },\n  }`,
    zorp: `{\n    temperature: { suboptimal: 60, critical: 85 },\n    peopleCount: { elevated: 10 },\n  }`,
    snooze: `{\n    sound: { annoying: 80, unbearable: 140 },  // ✏️ I hate noise\n    peopleCount: { too_many: 3 },\n  }`,
    sparky: `{\n    peopleCount: { exciting: 3, best_day_ever: 10 }, // ✏️ more people = more fun\n    sound: { party: 160 },\n  }`,
    duchess: `{\n    peopleCount: { tiresome: 5, dreadful: 10 },\n    temperature: { tepid: 65 },\n  }`,
    mossy: `{\n    temperature: { concerning: 75, alarming: 82 },\n    sound: { disruptive: 90 },\n  }`,
    cipher: `{\n    peopleCount: { suspicious: 4 },\n    light: { revealing: 130 },\n  }`,
    chunk: `{\n    temperature: { like_warm_pizza: 70, like_a_hot_oven: 82 },\n    peopleCount: { pizza_party_size: 5 },\n  }`,
    glitch: `{\n    temperature: { warm: 67, hot: 77 },\n    sound: { loud: 100 },\n  }`,
  }
  return map[name]
}

function getSensorConfig(name: SensorName): string {
  const microbitSensors: SensorName[] = ['temperature', 'light', 'sound', 'motion', 'compass']
  if (microbitSensors.includes(name)) {
    return `sensors: ['${name}'],  // ✏️ plug in your micro:bit!`
  }
  const detect = name === 'people-count' ? "['people']" :
    name === 'kids-vs-adults' ? "['people', 'age_group']" :
    name === 'room-mood' ? "['mood']" :
    name === 'activity-level' ? "['activity']" : "'people'"
  if (name === 'time-context') return `sensors: [],  // no hardware needed`
  return `sensors: [],\n  camera: { enabled: true, detect: ${detect} },  // ✏️ allow camera access in Chrome`
}
```

- [ ] **Step 4: Create `cli/src/index.ts`**

```typescript
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
```

- [ ] **Step 5: Install CLI dependencies and build**

```bash
npm install --workspace=cli && npm run build --workspace=cli
```

- [ ] **Step 6: Smoke test the CLI**

```bash
node cli/dist/index.js
```

Expected: Interactive prompts appear. Complete a pet flow, verify the output folder is created with correct files.

- [ ] **Step 7: Commit**

```bash
git add cli/
git commit -m "feat: add npx stem init CLI scaffolder"
```

---

## Task 11: Deployment

**Goal:** Hub live on Railway, dashboard live on Vercel, connected end-to-end.

- [ ] **Step 1: Create `packages/hub/Dockerfile`**

```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
COPY packages/types ./packages/types
COPY packages/hub ./packages/hub
COPY tsconfig.base.json ./
RUN npm ci --workspace=packages/types --workspace=packages/hub
RUN npm run build --workspace=packages/types && npm run build --workspace=packages/hub
CMD ["node", "packages/hub/dist/index.js"]
```

- [ ] **Step 2: Create `packages/hub/railway.toml`**

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "../../Dockerfile"

[deploy]
startCommand = "node packages/hub/dist/index.js"
healthcheckPath = "/"
restartPolicyType = "ON_FAILURE"
```

- [ ] **Step 3: Create `packages/hub/.env.example`**

```
ANTHROPIC_API_KEY=sk-ant-...
HUB_PORT=8080
```

- [ ] **Step 4: Create Vercel config for dashboard — `packages/dashboard/vercel.json`**

```json
{
  "buildCommand": "cd ../.. && npm run build --workspace=packages/types && npm run build --workspace=packages/dashboard",
  "outputDirectory": "packages/dashboard/.next",
  "installCommand": "npm install"
}
```

- [ ] **Step 5: Add `NEXT_PUBLIC_HUB_URL` env var note**

In `packages/dashboard/src/hooks/useHub.ts` the hub URL is read from `process.env.NEXT_PUBLIC_HUB_URL`. After deploying the hub to Railway, set this env var in Vercel project settings:

```
NEXT_PUBLIC_HUB_URL=wss://your-hub.railway.app
```

- [ ] **Step 6: Deploy hub to Railway**

```bash
# Install Railway CLI if needed
npm install -g @railway/cli

# From repo root:
railway login
railway init
railway up
```

Copy the generated Railway URL (e.g. `https://stem-hub.railway.app`). The WebSocket URL is `wss://stem-hub.railway.app`.

- [ ] **Step 7: Deploy dashboard to Vercel**

```bash
cd packages/dashboard
vercel --prod
```

When prompted for environment variables, set:
```
NEXT_PUBLIC_HUB_URL=wss://stem-hub.railway.app
```

- [ ] **Step 8: End-to-end smoke test**

1. Start hub locally: `npm run hub`
2. Start dashboard: `npm run dashboard`
3. Open `http://localhost:3000` in Chrome
4. In a second terminal, run a prebuilt pet: `cd pets/blaze && npm run dev`
5. Open the Vite URL in Chrome — pet should connect
6. In a third terminal, run a prebuilt sensor: `cd sensors/temperature && npm run dev`
7. Open the Vite URL in Chrome, connect micro:bit
8. Expected: sensor card appears on dashboard, pet reacts within 10 seconds

- [ ] **Step 9: Final commit**

```bash
git add packages/hub/Dockerfile packages/hub/railway.toml packages/dashboard/vercel.json
git commit -m "chore: add deployment config for Railway and Vercel"
```

---

## Integration Test Checklist (run before Session 1)

Run through this in the actual classroom with all hardware connected:

- [ ] Hub starts on instructor laptop: `npm run hub`
- [ ] Dashboard loads at `localhost:3000`
- [ ] `npx stem init` generates a working pet folder
- [ ] Pet connects to hub and shows "Connected" in console
- [ ] micro:bit flashed with firmware outputs JSON in serial monitor
- [ ] Sensor client opens serial port and reads micro:bit data
- [ ] Sensor card appears on dashboard within 5 seconds
- [ ] Changing room temperature (hold hand near micro:bit) changes dashboard reading
- [ ] Pet reacts to temperature threshold being crossed within 10 seconds
- [ ] Pet reaction appears in dashboard feed
- [ ] Webcam sensor requests camera permission in Chrome
- [ ] Demo day: Railway hub URL + Vercel dashboard URL both work on phones
