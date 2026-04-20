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
export function buildCameraPayload(frame: string): { _cameraFrame: string } {
  return { _cameraFrame: frame }
}
