
/**
 * Report of change to connected MIDI inputs.
 */
export interface InputChangeReport {

  /** Array of names for the MIDI inputs which are currently connected. */
  inputNames: string[]
}

/**
 * Packet of MIDI input information as parsed by the MidiListener.
 */
export interface MessageReport {
  data: Uint8Array
  command: number
  channel: number
  code: number
  value: number
}

/**
 * Report for button press or release events on the MIDI controller.
 */
export interface ButtonReport {

  /** Numerical code which distinguishes the control on the MIDI keyboard. */
  code: number

  /** Button press or release magnitude. Positive when the note is pressed downward. Zero or negative when the note is released upward. */
  velocity: number
}


/**
 * Report for scalar control changes.
 */
export interface ScalarReport {

  /** Scalar value. */
  value: number
}

/**
 * Key note is pressed or released.
 */
export interface NoteReport extends ButtonReport {

  /** Frequency of the desired note, in hertz. */
  frequency: number
}

/**
 * Pad is pressed or released.
 */
export interface PadReport extends ButtonReport {}

/**
 * Pitch bend wheel is touched.
 */
export interface PitchBendReport extends ScalarReport {}

/**
 * Mod wheel is touched.
 */
export interface ModWheelReport extends ScalarReport {}
