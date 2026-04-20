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
