
/// <reference types="typescript"/>

import {
  InputChangeReport,
  MessageReport,
  NoteReport,
  PadReport,
  PitchBendReport,
  ModWheelReport
} from "./reports"

export * from "./reports"

/**
 * Options for creating a midi listener.
 * Contains midi access object, and callbacks for handling midi events.
 */
export interface MidiListenerOptions {

  /** MIDI access provided by `navigator.requestMIDIAccess`. */
  access: MIDIAccess

  /** MIDI input device is connected or disconnected, and also initially. */
  onInputChange?: (report: InputChangeReport) => void

  /** Message event is received from any MIDI input. */
  onMessage?: (report: MessageReport) => void

  /** Note is pressed or released. */
  onNote?: (report: NoteReport) => void

  /** Tap pad is pressed or released. */
  onPad?: (report: PadReport) => void

  /** Pitch wheel is adjusted. */
  onPitchBend?: (report: PitchBendReport) => void

  /** Mod wheel is adjusted. */
  onModWheel?: (report: ModWheelReport) => void
}

/**
 * Listen for MIDI messages from all connected input devices.
 */
export default class MidiListener {
  private readonly access: MIDIAccess
  private readonly onInputChange: (report: InputChangeReport) => void
  private readonly onMessage: (report: MessageReport) => void
  private readonly onNote: (report: NoteReport) => void
  private readonly onPad: (report: PadReport) => void
  private readonly onPitchBend: (report: PitchBendReport) => void
  private readonly onModWheel: (report: ModWheelReport) => void
  private numberOfOpenConnections: number

  /**
   * Create a MIDI Listener.
   * Provide MIDI access, and callbacks for MIDI events.
   */
  constructor(options: MidiListenerOptions) {
    this.access = options.access

    const noop = () => {}
    this.onInputChange = options.onInputChange || noop
    this.onMessage = options.onMessage || noop
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
      this.onInputChange({inputNames})

      // Update the number of connected inputs.
      this.numberOfOpenConnections = numberOfOpenConnections
    }
  }

  /**
   * Parse a MIDI message into useful information.
   */
  private parseMidiMessage(message: MIDIMessageEvent): MessageReport {
    return {
      data: message.data,
      command: message.data[0] >> 4,
      channel: message.data[0] & 0xf,
      code: message.data[1],
      value: message.data[2] / 127
    }
  }

  /**
   * Convert note code number into frequency, in hertz.
   */
  private noteCodeToFrequency(code: number) {
    return 440 * Math.pow(2, (code - 69) / 12)
  }

  /**
   * Handle a MIDI input message.
   * Parse the MIDI message into a 
   * Interpret 
   */
  private handleMidiMessage(midiMessage: MIDIMessageEvent) {
    const messageReport = this.parseMidiMessage(midiMessage)
    const {data, command, channel, code, value} = messageReport
    this.onMessage(messageReport)

    // Start/stop commands.
    if (command === 8 || command === 9) {
      const isStopCommand = command === 9
      const velocity = isStopCommand ? value : -value

      // Key note channels.
      if (channel === 0 || channel === 15)
        this.onNote({
          code,
          velocity,
          frequency: this.noteCodeToFrequency(code)
        })

      // Pad channel.
      else if (channel === 9)
        this.onPad({code, velocity})
    }

    // Knob command.
    else if (command === 11) {
      if (code === 1)
        this.onModWheel({value})
    }

    // Pitch bend command.
    else if (command === 14) {
      this.onPitchBend({value})
    }
  }
}
