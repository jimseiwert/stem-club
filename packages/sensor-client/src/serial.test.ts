import { describe, it, expect } from 'vitest'
import { parseMicrobitLine } from './serial.js'

describe('parseMicrobitLine', () => {
  it('parses a valid JSON line from the micro:bit', () => {
    const result = parseMicrobitLine('{"t":72,"l":180,"s":45,"m":0,"c":270}')
    expect(result).toEqual({ temperature: 72, light: 180, sound: 45, motion: false, compass: 270 })
  })

  it('returns null for an invalid line', () => {
    expect(parseMicrobitLine('not json')).toBeNull()
    expect(parseMicrobitLine('')).toBeNull()
  })

  it('treats m=1 as motion true', () => {
    const result = parseMicrobitLine('{"t":70,"l":100,"s":20,"m":1,"c":90}')
    expect(result?.motion).toBe(true)
  })

  it('clamps values to valid ranges', () => {
    const result = parseMicrobitLine('{"t":200,"l":300,"s":300,"m":0,"c":400}')
    expect(result?.temperature).toBe(200)
    expect(result?.light).toBe(255)
    expect(result?.sound).toBe(255)
    expect(result?.compass).toBe(360)
  })
})
