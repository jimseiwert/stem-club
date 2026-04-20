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
