
import Caller from "./utilities/Caller"

import {
  MidiEventCallbacks,
  InputChangeReport,
  MessageReport,
  NoteReport,
  PadReport,
  PitchBendReport,
  ModWheelReport
} from "./midi-events"

export * from "./midi-events"

/**
 * Options for creating a midi listener.
 * Provide midi access.
 */
export interface MidiListenerOptions {

  /** MIDI access provided by `navigator.requestMIDIAccess()`. */
  access: MIDIAccess
}

/**
 * Midi listener callback events.
 */
export interface MidiListenerEventCallbacks extends MidiEventCallbacks {

  /** MIDI input device is connected or disconnected, and also initially. */
  onInputChange?: (report: InputChangeReport) => void

  /** Message event is received from any MIDI input. */
  onMessage?: (report: MessageReport) => void
}

/**
 * Listen for MIDI messages from all connected input devices.
 * Use the `subscribe` method to attach midi listener event callbacks.
 */
export default class MidiListener {

  /** Web MIDI API access object, provided by `navigator.requestMIDIAccess()`. */
  private readonly access: MIDIAccess

  /** Most recent count of the number of available and open midi inputs. */
  private numberOfActiveInputs: number

  /** Midi listener events. */
  private readonly events = {
    onInputChange: new Caller<(report: InputChangeReport) => void>(),
    onMessage: new Caller<(report: MessageReport) => void>(),
    onNote: new Caller<(report: NoteReport) => void>(),
    onPad: new Caller<(report: PadReport) => void>(),
    onPitchBend: new Caller<(report: PitchBendReport) => void>(),
    onModWheel: new Caller<(report: ModWheelReport) => void>()
  }

  /**
   * Create a MIDI Listener.
   * Provide MIDI access, and callbacks for MIDI events.
   */
  constructor(options: MidiListenerOptions) {
    this.access = options.access

    // Prepare midi inputs initially and whenever an input is connected or disconnected.
    this.curateMidiInputs()
    this.access.onstatechange = () => this.curateMidiInputs()
  }

  /**
   * Subscribe midi listener event callbacks.
   * Return a function which revokes the particular callback subscriptions.
   */
  subscribe(callbacks: MidiListenerEventCallbacks): () => void {

    // Subscribe the callbacks.
    for (const eventName in this.events)
      if (this.events[eventName] && callbacks[eventName])
        this.events[eventName].add(callbacks[eventName])

    // Return a function which revokes the callback subscriptions.
    return () => {
      for (const eventName in this.events)
        if (this.events[eventName] && callbacks[eventName])
          this.events[eventName].remove(callbacks[eventName])
    }
  }

  /**
   * Clear all midi listener callback subscriptions.
   */
  clear() {
    for (const eventName in this.events) this.events[eventName].clear()
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
    if (numberOfOpenConnections !== this.numberOfActiveInputs) {

      // Call the input change callback.
      this.events.onInputChange.invoke({inputNames})

      // Update the number of connected inputs.
      this.numberOfActiveInputs = numberOfOpenConnections
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
   */
  private handleMidiMessage(midiMessage: MIDIMessageEvent) {
    const messageReport = this.parseMidiMessage(midiMessage)
    const {data, command, channel, code, value} = messageReport
    this.events.onMessage.invoke(messageReport)

    // Start/stop commands.
    if (command === 8 || command === 9) {
      const isStopCommand = command === 9
      const velocity = isStopCommand ? value : -value

      // Key note channels.
      if (channel === 0 || channel === 15)
        this.events.onNote.invoke({
          code,
          velocity,
          frequency: this.noteCodeToFrequency(code)
        })

      // Pad channel.
      else if (channel === 9)
        this.events.onPad.invoke({code, velocity})
    }

    // Knob command.
    else if (command === 11) {
      if (code === 1)
        this.events.onModWheel.invoke({value})
    }

    // Pitch bend command.
    else if (command === 14) {
      this.events.onPitchBend.invoke({value})
    }
  }
}
