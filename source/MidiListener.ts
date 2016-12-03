
/// <reference types="typescript"/>

/**
 * Options for creating a midi listener.
 * Contains midi access object, and callbacks for handling midi events.
 */
export interface MidiListenerOptions {

  /** MIDI access provided by `navigator.requestMIDIAccess`. */
  access: MIDIAccess

  /** MIDI input device is connected or disconnected, and also initially. */
  onInputChange?: (inputNames: string[]) => void

  /** Message event is received from any MIDI input. */
  onParse?: (message: MidiListenerParse) => void

  /** Note is pressed or released. Notes with zero or negative velocity are being released. */
  onNote?: (note: number, velocity: number) => void

  /** Tap pads are hit or released. Taps with zero or negative velocity are being released. */
  onPad?: (pad: number, velocity: number) => void

  /** Pitch wheel is moved. */
  onPitchBend?: (value: number) => void

  /** Mod wheel is moved. */
  onModWheel?: (value: number) => void
}

/**
 * Packet of information received from MIDI input and parsed by the MidiListener.
 */
export interface MidiListenerParse {
  data: Uint8Array
  command: number
  channel: number
  note: number
  velocity: number
}

/**
 * Listen for MIDI messages from all connected input devices.
 */
export default class MidiListener {
  private readonly access: MIDIAccess
  private readonly onInputChange: (inputNames: string[]) => void
  private readonly onParse: (message: MidiListenerParse) => void
  private readonly onNote: (noteNumber: number, velocity: number) => void
  private readonly onPad: (pad: number, velocity: number) => void
  private readonly onPitchBend: (value: number) => void
  private readonly onModWheel: (value: number) => void
  private numberOfOpenConnections: number

  /**
   * Create a MIDI Listener.
   */
  constructor(options: MidiListenerOptions) {
    this.access = options.access

    const noop = () => {}
    this.onInputChange = options.onInputChange || noop
    this.onParse = options.onParse || noop
    this.onNote = options.onNote || noop
    this.onPad = options.onPad || noop
    this.onPitchBend = options.onPitchBend || noop
    this.onModWheel = options.onModWheel || noop

    // Prepare midi inputs initially and whenever an input is connected or disconnected.
    this.curateMidiInputs()
    this.access.onstatechange = () => this.curateMidiInputs()
  }

  /**
   * Prepare midi inputs for our listening purposes.
   */
  private curateMidiInputs() {
    const inputNames: string[] = []
    let numberOfOpenConnections = 0

    // Loop over each midi input:
    for (const input of Array.from(this.access.inputs.values())) {

      // Attach a midi message listener to every input.
      input.onmidimessage = message => this.handleMidiMessage(message)

      // Collect the name of each input.
      inputNames.push(input.name)

      // Add up the number of connected inputs.
      if (input.state === "connected" && input.connection === "open")
        numberOfOpenConnections += 1
    }

    // If the number of connected inputs has changed:
    if (numberOfOpenConnections !== this.numberOfOpenConnections) {

      // Call the input change callback.
      this.onInputChange(inputNames)

      // Update the number of connected inputs.
      this.numberOfOpenConnections = numberOfOpenConnections
    }
  }

  /**
   * Parse a MIDI message into useful information.
   */
  private parseMidiMessage(message: MIDIMessageEvent) {
    return {
      data: message.data,
      command: message.data[0] >> 4,
      channel: message.data[0] & 0xf,
      note: message.data[1],
      velocity: message.data[2] / 127
    }
  }

  /**
   * Handle a message from a MIDI input.
   */
  private handleMidiMessage(message: MIDIMessageEvent) {
    const parse = this.parseMidiMessage(message)
    const {data, command, channel, note, velocity} = parse

    this.onParse(parse)

    // Start/stop commands.
    //  - Positive velocity is a downward press.
    //  - Negative (or zero) velocity is an upward release.
    if (command === 8 || command === 9) {
      if (channel === 0 || channel === 15)
        this.onNote(note, command === 9 ? velocity : -velocity)
      else if (channel === 9)
        this.onPad(note, command === 9 ? velocity : -velocity)
    }

    // Knob command.
    else if (command === 11) {
      if (note === 1)
        this.onModWheel(velocity)
    }

    // Pitch bend command.
    else if (command === 14) {
      this.onPitchBend(velocity)
    }
  }
}
