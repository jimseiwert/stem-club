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
