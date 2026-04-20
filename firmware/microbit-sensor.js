// STEM Smart Classroom — micro:bit sensor firmware
// Outputs JSON over USB serial every 2 seconds
// Format: {"t":72,"l":180,"s":45,"m":0,"c":270}
//   t = temperature (°F), l = light (0-255),
//   s = sound (0-255), m = motion (0 or 1), c = compass (degrees)

let shaken = 0

input.onGesture(Gesture.Shake, function () {
    shaken = 1
})

basic.forever(function () {
    const tempC = input.temperature()
    const tempF = Math.round(tempC * 9 / 5 + 32)
    serial.writeLine(JSON.stringify({
        t: tempF,
        l: input.lightLevel(),
        s: input.soundLevel(),
        m: shaken,
        c: input.compassHeading()
    }))
    shaken = 0
    basic.pause(2000)
})
