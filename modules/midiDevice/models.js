import options from './options.js'

export default class MidiDevice {
  static options = options

  constructor(name, channel) {
    this.name = name
    this.channel = channel
    this.input = null
    this.output = null
    this.initialized = false
  }

  initialize(input, output) {
    this.input = input
    this.output = output
    this.initialized = true
  }
}