// Custom modules
import MidiController from './modules/midiController/index.js'
import MidiDevice from './modules/midiDevice/index.js'
import FCB1010 from './modules/fcb1010/index.js'

const focusriteController = new MidiController("Focusrite", "Focusrite")
const hxStompXLController = new MidiController("HX Stomp", "HX Stomp")
const fcb1010 = new FCB1010("FF")
const hxStompXL = new MidiDevice("HX Stomp XL", 1)

// Register the Focusrite devices
focusriteController.registerDevice(fcb1010)

// Register the HX Stomp devices
hxStompXLController.registerDevice(hxStompXL)

const CONTROL_CHANGE_MESSAGE_CODE = 176
const FCB1010_MIDI_CHANNEL = 0
const HX_STOMP_XL_MIDI_CHANNEL = 1

// Turn on pedals 1-10 LEDs on the FCB1010
for(let i = 1; i <= 10; i++) {
	fcb1010.setPedalLED(true, i)
}

// Update the FCB1010 7-segment display to read 'HX'
fcb1010.updateDisplay("EF")

// Close the port when done.
setTimeout(function() {
  // Turn off pedals 1-10 LEDs on the FCB1010
  for(let i = 10; i >= 1; i--) {
		fcb1010.setPedalLED(false, i)
	}

  // Clear the FCB1010 7-segment display
  fcb1010.updateDisplay()

  // Press FS3 on the Helix Stomp XL
  focusriteController.output.sendMessage([CONTROL_CHANGE_MESSAGE_CODE + HX_STOMP_XL_MIDI_CHANNEL, 51, 0])

  focusriteController.input.closePort()
  focusriteController.output.closePort()

  hxStompXLController.input.closePort()
  hxStompXLController.output.closePort()
}, 5000)
