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
