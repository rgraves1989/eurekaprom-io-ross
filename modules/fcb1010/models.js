import MidiDevice from '../midiDevice/index.js'
import options from './options.js'

export default class FCB1010 extends MidiDevice {
  static DEVICE_NAME = "FCB1010"
  static DEFAULT_CHANNEL = 1
  static options = options

  constructor() {
    super(FCB1010.DEVICE_NAME, FCB1010.DEFAULT_CHANNEL)
  }

  updateDisplay(displayString = "  ") {
    if(!displayString || displayString.length !== 2)
      return

    let tensPlaceCharacter = displayString.charAt(0)
    let tensPlaceMessageCode = FCB1010.options.TENS_PLACE_ALPHABET_CHARACTER_MESSAGE_CODE
    let tensPlaceIndex = FCB1010.options.ALPHABET_CHARACTER_LIST.indexOf(tensPlaceCharacter)
    if(tensPlaceIndex < 0) {
      tensPlaceMessageCode = FCB1010.options.TENS_PLACE_HEX_MESSAGE_CODE
      tensPlaceIndex = FCB1010.options.HEX_CHARACTER_LIST.indexOf(tensPlaceCharacter)
      tensPlaceIndex = tensPlaceIndex < 0 ? FCB1010.options.TENS_PLACE_DEFAULT_VALUE : tensPlaceIndex
    }
    let tensPlaceMessage = [MidiDevice.options.CONTROL_CHANGE_MESSAGE_CODE + this.channel - 1, tensPlaceMessageCode, tensPlaceIndex]
    this.output.sendMessage(tensPlaceMessage)

    let onesPlaceCharacter = displayString.charAt(1)
    let onesPlaceMessageCode = FCB1010.options.ONES_PLACE_ALPHABET_CHARACTER_MESSAGE_CODE
    let onesPlaceIndex = FCB1010.options.ALPHABET_CHARACTER_LIST.indexOf(onesPlaceCharacter)
    if(onesPlaceIndex < 0) {
      onesPlaceMessageCode = FCB1010.options.ONES_PLACE_HEX_CHARACTER_MESSAGE_CODE
      onesPlaceIndex = FCB1010.options.HEX_CHARACTER_LIST.indexOf(onesPlaceCharacter)
      onesPlaceIndex = onesPlaceIndex < 0 ? ONES_PLACE_DEFAULT : onesPlaceIndex
    }
    let onesPlaceMessage = [MidiDevice.options.CONTROL_CHANGE_MESSAGE_CODE + this.channel - 1, onesPlaceMessageCode, onesPlaceIndex]
    this.output.sendMessage(onesPlaceMessage)
  }

  setPedalLED(ledOn, pedalNumber) {
    if(!(1 <= pedalNumber && pedalNumber <= 10)) {
      return
    }

    if(pedalNumber === 10)
      pedalNumber = 0

    let message = null
    if(ledOn) {
      message = [MidiDevice.options.CONTROL_CHANGE_MESSAGE_CODE + this.channel - 1, FCB1010.options.LED_ON_MESSAGE_CODE, pedalNumber]
    } else {
      message = [MidiDevice.options.CONTROL_CHANGE_MESSAGE_CODE + this.channel - 1, FCB1010.options.LED_OFF_MESSAGE_CODE, pedalNumber]
    }

    if(message)
      this.output.sendMessage(message)
  }
}