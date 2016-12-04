
MIDI LISTENER
=============

***This project is early WIP pre-release code.*** *Open to suggestions or comments, please submit an issue!*

Listen for and interpret MIDI device input.

  - Simply listens to all connected MIDI devices simultaneously
  - Written in TypeScript
  - Inspired by [the stack overflow post](http://stackoverflow.com/questions/40902864/how-to-parse-web-midi-api-input-messages-onmidimessage)
  - Published an an [npm package](https://www.npmjs.com/package/midi-listener)
  - Usage example: [the CSM repository](https://github.com/ChaseMoskal/csm)

Basic usage with your TypeScript project:
-----------------------------------------

### Install midi-listener:

    npm install --save midi-listener

### Reference the Web MIDI API declarations:

    /// <reference path="../node_modules/midi-listener/source/web-midi.d.ts"/>

### Import into your code and use

```typescript
import MidiListener from "midi-listener"

(async function() {

  new MidiListener({
    access: await navigator.requestMIDIAccess(),
    onInputChange: report => console.log("MIDI Input Change:", report.inputNames),
    onMessage: report => console.log("MIDI Message:", report),
    onNote: report => console.log(" - Note:", report),
    onPad: report => console.log(" - Pad:", report),
    onPitchBend: report => console.log(" - Pitch bend:", report),
    onModWheel: report => console.log(" - Mod wheel:", report)
  })

})()
```