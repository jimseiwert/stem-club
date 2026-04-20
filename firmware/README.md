# micro:bit Firmware

## Flashing instructions (do this for all 12 micro:bits before Session 1)

1. Go to https://makecode.microbit.org
2. Click "New Project"
3. Click "JavaScript" tab
4. Paste the contents of microbit-sensor.js
5. Click "Download" — saves a .hex file
6. Plug micro:bit into USB
7. Drag the .hex file onto the MICROBIT drive that appears
8. LED will flash during programming, then show a checkmark

## Serial output format

Every 2 seconds the micro:bit prints one JSON line:
{"t":72,"l":180,"s":45,"m":0,"c":270}

- t: temperature in °F
- l: light level 0–255
- s: sound level 0–255  
- m: shaken since last reading (0 or 1)
- c: compass heading in degrees

## Baud rate: 115200
