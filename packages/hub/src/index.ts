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
