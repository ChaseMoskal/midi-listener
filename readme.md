
MIDI LISTENER
=============

  - Listen for and interpret MIDI device input.
  - Listens to all connected MIDI devices simultaneously. Simple.
  - Largely inspired by [the stack overflow post](http://stackoverflow.com/questions/40902864/how-to-parse-web-midi-api-input-messages-onmidimessage)

Use it with your slick TypeScript 2.1 project:
----------------------------------------------

### Install midi-listener:

    npm install --save midi-listener

### At the top of your `.ts` module:

```typescript
// Bring in definitions for the Web MIDI API.
/// <reference types="./node_modules/midi-listener/source/web-midi.d.ts"/>

// Import the midi listener.
import MidiListener from "midi-listener"

// Async/await function — because you're a badass.
(async function() {

  // Create a midi listener.
  const midiListener = new MidiListener({

    // Pass the midi access object from the Web MIDI API.
    access: await navigator.requestMIDIAccess(),

    // Assign callbacks for handling meaningful midi events.
    onInputChange: inputs => console.debug(`MIDI inputs: [${inputs.join(", ")}]`),
    onParse: parse => console.debug(`MIDI message parse:`, parse),
    onNote: (note, velocity) => console.log(` - Note:`, note, ',', velocity.toFixed(2)),
    onPad: (pad, velocity) => console.log(` - Pad:`, pad, ',', velocity.toFixed(2)),
    onPitchBend: value => console.log(` - Pitch bend:`, value.toFixed(2)),
    onModWheel: value => console.log(` - Mod wheel:`, value.toFixed(2))
  })
})()
```
