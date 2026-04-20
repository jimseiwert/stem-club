# The Smart Classroom — STEM Program Design

**Date:** 2026-04-20
**Program:** After-school STEM, $5,000 grant
**Audience:** 15 kids, ages 11–12, complete beginners
**Instructor:** Program organizer (solo)
**Format:** 4 sessions × 90 min, once weekly. Ends with live parent/school demo day.

---

## Requirements + Constraints

- **Browser:** Chrome or Edge required on all student laptops. Web Serial API (micro:bit connection) does not work in Safari or Firefox. Confirm with school IT before Day 1.
- **Webcam privacy:** Camera-based sensors capture and send frames to Claude vision API for analysis. No images are stored. Inform parents via consent note before program starts.
- **Network:** All laptops must be on the same network as the WS hub during sessions. School WiFi firewalls sometimes block local WebSocket connections — test in advance.
- **API key:** One Anthropic API key shared across all pets via the library. Never exposed in student code. Set as environment variable in the hub.

---

## Overview

Kids split into two teams that each build one piece of a shared live system:

- **Pet Team (~8 kids):** Each kid configures an AI pet with a unique name, personality, and custom thresholds. The pet receives live sensor data and reacts in its own voice using AI-generated responses.
- **Sensor Team (~7 kids):** Each kid deploys one sensor — micro:bit-based (temperature, light, sound, motion, compass) or webcam-based (people count, kids vs adults, room mood, activity level, time context). Raw data broadcasts to a shared WebSocket hub.

On demo day, a central dashboard is projected. As parents arrive, the camera counts them, classifies kids vs adults, and all AI pets react live on screen. Every kid has a piece of the system to explain and demonstrate.

---

## Hardware

**School provides:** Laptops (Chrome or Edge required for Web Serial API).
**Program purchases:**

| Item | Qty | Est. Unit | Total |
|------|-----|-----------|-------|
| BBC micro:bit v2 Go Bundle | 12 | $20 | $240 |
| USB-C Hub | 4 | $15 | $60 |
| External webcam 1080p (e.g. Logitech C920) | 3 | $35 | $105 |
| Power strips / extension cords | 3 | $15 | $45 |
| Sticker sheets (kids decorate micro:bit) | 5 packs | $8 | $40 |
| Printed certificates + folders | 15 | $3 | $45 |
| Demo day snacks + drinks | — | — | $150 |
| Claude API credits (Anthropic) | — | — | $100 |
| **Hardware + materials total** | | | **~$785** |
| **Remaining for instructor time / contingency** | | | **~$4,215** |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript throughout |
| Kid-facing API | `@stem/ai-pet`, `@stem/sensor-client` |
| Scaffolder | `npx stem init` — generates a single customizable file |
| Real-time transport | WebSocket hub — Node.js `ws` library |
| Hosting (hub) | Local during sessions; Railway (free tier) for demo day |
| Dashboard | Next.js app on Vercel |
| AI | Claude API via Anthropic SDK — shared key, never exposed to kids |
| Hardware bridge | Web Serial API (micro:bit over USB) |
| Camera / vision | Webcam via `getUserMedia` + Claude vision API |

---

## Monorepo Structure

```
stem/
├── packages/
│   ├── types/          # @stem/types — shared TypeScript interfaces
│   ├── ai-pet/         # @stem/ai-pet — pet framework library
│   ├── sensor-client/  # @stem/sensor-client — sensor + webcam library
│   ├── hub/            # WebSocket broadcast server
│   └── dashboard/      # Next.js live display (Vercel)
├── pets/               # 10 prebuilt complete pet implementations
├── sensors/            # 10 prebuilt complete sensor implementations
├── cli/                # npx stem init scaffolder
└── docs/
```

---

## Shared Types (`@stem/types`)

```typescript
interface SensorReading {
  sensorId: string
  label: string
  timestamp: number
  temperature?: number      // °F
  light?: number            // 0–255
  sound?: number            // 0–255
  motion?: boolean
  compass?: number          // degrees
  peopleCount?: number
  kidsCount?: number
  adultsCount?: number
  activityLevel?: 'low' | 'medium' | 'high'
  roomMood?: string
  timeContext?: string
}

interface PetReaction {
  petId: string
  petName: string
  message: string
  sensor: string
  level: string
  timestamp: number
}

type HubMessage =
  | { type: 'sensor'; role: 'sensor'; data: SensorReading }
  | { type: 'reaction'; role: 'pet'; data: PetReaction }
  | { type: 'subscribe'; role: 'pet' | 'display' }
```

---

## Pet Library (`@stem/ai-pet`)

Kids write ~20 lines. The library handles WS connection, AI calls, threshold comparison, rate limiting, and broadcasting reactions back to the hub.

**Kid-facing API:**
```typescript
import { createPet } from '@stem/ai-pet'

export default createPet({
  name: "Blaze",                          // ✏️ rename me
  personality: "dramatic fire dragon",    // ✏️ describe me

  thresholds: {
    temperature: { cold: 60, hot: 50, scorching: 80 },  // ✏️ my hot is 50°
    people:      { empty: 1, cozy: 5, crowded: 8 },
    noise:       { quiet: 40, loud: 65, deafening: 85 },
  },

  // ✏️ optional: customize the AI prompt
  onThreshold: (event) => `
    You are ${event.petName}, a ${event.personality}.
    The room just hit "${event.level}" ${event.sensor} (${event.value}).
    React in 1 sentence, in character.
  `
})
```

**Library responsibilities:**
- Connects to WS hub as `role: "pet"`, reconnects automatically
- Receives `SensorReading` broadcasts from hub
- Compares each value to pet's thresholds → determines current level
- Only fires AI call when level *changes* (no spamming)
- Rate-limits to max 1 AI call per pet per 5 seconds
- Sends `PetReaction` back to hub → hub broadcasts to dashboard

---

## Sensor Library (`@stem/sensor-client`)

Kids write ~10 lines. The library handles Web Serial connection to micro:bit, webcam capture, AI vision calls, and WS publishing.

**Kid-facing API:**
```typescript
import { createSensor } from '@stem/sensor-client'

export default createSensor({
  label: "Back of Room",                          // ✏️ where is this?
  sensors: ['temperature', 'light', 'sound'],     // ✏️ pick sensors to enable

  camera: {
    enabled: true,                                // ✏️ true or false
    detect: ['people', 'age_group', 'mood'],      // ✏️ what to detect
  }
})
```

**Library responsibilities:**
- Opens Web Serial port to micro:bit, parses sensor values
- Captures webcam frame every 3 seconds, sends to Claude vision API
- Publishes `SensorReading` to WS hub every 2 seconds
- Reconnects to hub automatically on disconnect

---

## WebSocket Hub

Simple Node.js server. No persistence — pure broadcast.

- Sensor clients connect with `role: "sensor"` → hub fans out their `SensorReading` to all pets and displays
- Pet clients connect with `role: "pet"` → hub fans out their `PetReaction` to all displays
- Display clients connect with `role: "display"` → receive everything, send nothing
- Runs on `localhost:8080` during sessions; deployed to Railway for demo day

---

## Dashboard (`packages/dashboard`)

Next.js app deployed to Vercel.

- **Left panel:** Live sensor grid — one card per active sensor, updates in real time
- **Right panel:** Pet reactions feed — speech bubbles with pet name, message, and which sensor triggered it
- **Header:** People count + kids/adults ratio (prominent for demo day)
- **URL:** `stem-demo.vercel.app` — parents can open on phones during demo day

Each pet also has its own route: `stem-demo.vercel.app/pets/blaze`

---

## Prebuilt Roster (fallback + reference implementations)

### 10 Pets
| Pet | Personality |
|-----|------------|
| Blaze 🔥 | Dramatic fire dragon, always too hot |
| Frost ❄️ | Chill snow fox, nothing bothers her |
| Zorp 🤖 | Logic-obsessed robot, very literal |
| Snooze 😴 | Sleepy sloth, hates noise and activity |
| Sparky 🎉 | Hyperactive party pup, loves crowds |
| Duchess 👑 | Snooty royal cat, endlessly judging |
| Mossy 🌿 | Eco-anxious plant creature, loves quiet |
| Cipher 🕵️ | Mysterious spy, talks in riddles |
| Chunk 🍕 | Food-obsessed gremlin, relates everything to snacks |
| Glitch 🌀 | Chaotic gremlin, unpredictable and unhinged |

### 10 Sensors
| Sensor | Source |
|--------|--------|
| Temperature 🌡️ | micro:bit built-in |
| Light Level 💡 | micro:bit built-in |
| Noise / Sound 🔊 | micro:bit built-in |
| Motion / Shake 📳 | micro:bit accelerometer |
| Compass / Direction 🧲 | micro:bit magnetometer |
| People Count 👥 | webcam + Claude vision |
| Kids vs Adults 👦👨 | webcam + Claude vision |
| Room Mood 😊 | webcam + Claude vision |
| Activity Level 🏃 | webcam motion detection |
| Time of Day Context 🕐 | system clock + AI label |

---

## CLI Scaffolder (`npx stem init`)

```
$ npx stem init

? What are you building? › Pet / Sensor
? Pick your pet: › Blaze 🔥 / Frost ❄️ / Zorp 🤖 / ...
? What do you want to name your pet? › Inferno

✅ Created: inferno-pet/index.ts
   Edit the ✏️ sections to make it yours.
   Run: npm run dev
```

Generates a single `index.ts` file pre-filled with the chosen pet/sensor config, with `// ✏️` comments marking every customizable line. Nothing else to configure.

---

## 4-Session Syllabus

### Session 1 — "Hello World" (90 min)
| Time | Activity |
|------|----------|
| 0:00 | Show the demo day vision — big screen with pets reacting to people walking in |
| 0:15 | TypeScript crash course — variables, functions, objects (live coding together) |
| 0:35 | `npx stem init` — kids pick pet or sensor, see their starter file |
| 0:50 | Make it say something — pet prints greeting, sensor logs a number |
| 1:15 | Show & tell — every kid explains what they made in 30 seconds |
| 1:25 | Homework: think of 3 personality traits for your pet / name your sensor location |

### Session 2 — "Make It Yours" (90 min)
| Time | Activity |
|------|----------|
| 0:00 | Recap + show last week's code on screen |
| 0:10 | Pet team: write personality, set thresholds, test AI responses in terminal |
| 0:10 | Sensor team: plug in micro:bit, run sensor client, see live numbers |
| 0:50 | Both teams: push to shared dashboard for first time |
| 1:10 | Dashboard projected — class sees all pets + sensors live together |
| 1:20 | Retro: what surprised you? |

### Session 3 — "Connect Everything" (90 min)
| Time | Activity |
|------|----------|
| 0:00 | Turn on all sensors — pets react to real classroom data live |
| 0:15 | Pet team: tune thresholds based on actual readings |
| 0:15 | Sensor team: add camera detection, test people counting |
| 0:45 | Full system test — walk around, make noise, crowd the camera |
| 1:10 | Polish: fix bugs, improve pet responses, label sensors better |
| 1:20 | Demo day briefing — what parents will see, how to explain it |

### Session 4 — "Demo Day 🎉" (90 min)
| Time | Activity |
|------|----------|
| 0:00 | 30 min setup + final polish before parents arrive |
| 0:15 | Rehearse: each kid's 90-second explanation of what they built |
| 0:30 | Parents + school arrive — dashboard on big screen |
| 0:40 | Each kid presents — sensor kids demo live data, pet kids introduce their pet |
| 1:10 | Free exploration — parents interact, pets react, cameras count people |
| 1:20 | Certificates + group photo 📸 |

---

## Success Criteria

- Every kid has a working piece in the shared system by end of Session 3
- Demo day: parents can see real-time reactions within 60 seconds of walking in
- No kid touches WebSocket code, API keys, or deployment config
- Prebuilt roster covers any kid who doesn't finish their own implementation
