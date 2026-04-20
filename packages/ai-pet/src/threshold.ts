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

    // The lowest-valued threshold is the baseline — only fire above it
    const lowestEntry = sorted[sorted.length - 1]
    const [level] = matched
    if (level === lowestEntry[0]) continue

    if (prevState[sensorKey] === level) continue

    return { sensor: sensorKey, level, value }
  }
  return null
}
