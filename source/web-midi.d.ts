
/**
 * Web MIDI API
 * TypeScript definitions
 *
 * Based on the W3C draft: https://webaudio.github.io/web-midi-api/
 *
 * Authored with love by Chase Moskal
 * ISC Licensed
 */

interface Navigator {
  readonly requestMIDIAccess: (options?: MIDIOptions) => Promise<MIDIAccess>
}

interface MIDIOptions {
  software: boolean
  sysex: boolean
}

interface MIDIAccess {
  readonly inputs: Map<string, MIDIInput>
  readonly outputs: Map<string, any>
  onstatechange: (event: MIDIConnectionEvent) => void
  readonly sysexEnabled: boolean
}

interface MIDIInput extends MIDIPort {
  onmidimessage: (event: MIDIMessageEvent) => void
}

interface MIDIConnectionEvent extends Event {
  readonly port: MIDIPort
}

interface MIDIMessageEvent extends Event {
  readonly data: Uint8Array
}

interface MIDIPort {
  readonly id: string
  readonly manufacturer: string
  readonly name: string
  readonly type: "input" | "output"
  readonly version: string
  readonly state: "connected" | "disconnected"
  readonly connection: "open" | "closed" | "pending"
  readonly onstatechange: (event: MIDIConnectionEvent) => void
}
