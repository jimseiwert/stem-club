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
