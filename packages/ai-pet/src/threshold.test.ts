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
