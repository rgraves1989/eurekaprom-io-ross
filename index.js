const midi = require('midi')

// Set up a new MIDI input & output
const input = new midi.Input()
const output = new midi.Output()

// Helper to find an input port with a specified name
function getIndexContainingName(list, name) {
  return list.findIndex(element => element.includes(name))
}

// Helper to construct a list of MIDI input & output port names
function constructPortNameList(inOrOut) {
  var portNameList = []
  for(let i = 0; i < inOrOut.getPortCount(); i++) {
    let portName = inOrOut.getPortName(i)
    portNameList.push(portName)
  }
  return portNameList
}

function initializeMidi(inputNameIncludes, outputNameIncludes) {
  // Compile and a list of available input port names
  const INPUT_PORT_NAMES = constructPortNameList(input)
  console.log('Found the following MIDI input ports:')
  console.table(INPUT_PORT_NAMES)

  // Compile a list of available output port names
  const OUTPUT_PORT_NAMES = constructPortNameList(output)
  console.log('Found the following MIDI output ports:')
  console.table(OUTPUT_PORT_NAMES)

  // Search for the Focusrite
  const DESIRED_INPUT_PORT = getIndexContainingName(INPUT_PORT_NAMES, inputNameIncludes)
  const DESIRED_OUTPUT_PORT = getIndexContainingName(OUTPUT_PORT_NAMES, outputNameIncludes)

  // If we have no Focusrite input, abort
  if(!DESIRED_INPUT_PORT || !DESIRED_OUTPUT_PORT)
    return 0

  // Open the Focusrite input
  input.openPort(DESIRED_INPUT_PORT)
  output.openPort(DESIRED_OUTPUT_PORT)

  // Configure a callback.
  input.on('message', (deltaTime, message) => {
    // The message is an array of numbers corresponding to the MIDI bytes:
    //   [status, data1, data2]
    // https://www.cs.cf.ac.uk/Dave/Multimedia/node158.html has some helpful
    // information interpreting the messages.
    console.log(`m: ${message} d: ${deltaTime}`)
  });

  // Sysex, timing, and active sensing messages are ignored
  // by default. To enable these message types, pass false for
  // the appropriate type in the function below.
  // Order: (Sysex, Timing, Active Sensing)
  // For example if you want to receive only MIDI Clock beats
  // you should use
  // input.ignoreTypes(true, false, true)
  input.ignoreTypes(false, false, false)
}

const TENS_PLACE_AZ_MESSAGE_CODE = 109
const TENS_PLACE_HEX_MESSAGE_CODE = 113
const TENS_PLACE_DEFAULT = 16
const ONES_PLACE_AZ_MESSAGE_CODE = 110
const ONES_PLACE_HEX_MESSAGE_CODE = 114
const ONES_PLACE_DEFAULT = 15
const LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',' ']
const HEX = ['0','1','2','3','4','5','6','7','8','9','0','A','B','C','D','E','F',' ']

function updateFCB1010Display(displayString = "  ") {
  if (!displayString || displayString.length !== 2)
    return

  let tensPlaceCharacter = displayString.charAt(0)
  let tensPlaceMessageCode = TENS_PLACE_AZ_MESSAGE_CODE
  let tensPlaceIndex = LETTERS.indexOf(tensPlaceCharacter)
  if(tensPlaceIndex < 0) {
    tensPlaceMessageCode = TENS_PLACE_HEX_MESSAGE_CODE
    tensPlaceIndex = HEX.indexOf(tensPlaceCharacter)
    tensPlaceIndex = tensPlaceIndex < 0 ? TENS_PLACE_DEFAULT : tensPlaceIndex
  }
  let tensPlaceMessage = [CONTROL_CHANGE_MESSAGE_CODE + FCB1010_MIDI_CHANNEL, tensPlaceMessageCode, tensPlaceIndex]
  console.log(tensPlaceMessage)
  output.sendMessage(tensPlaceMessage)

  let onesPlaceCharacter = displayString.charAt(1)
  let onesPlaceMessageCode = ONES_PLACE_AZ_MESSAGE_CODE
  let onesPlaceIndex = LETTERS.indexOf(onesPlaceCharacter)
  if(onesPlaceIndex < 0) {
    onesPlaceMessageCode = ONES_PLACE_HEX_MESSAGE_CODE
    onesPlaceIndex = HEX.indexOf(onesPlaceCharacter)
    onesPlaceIndex = onesPlaceIndex < 0 ? ONES_PLACE_DEFAULT : onesPlaceIndex
  }
  let onesPlaceMessage = [CONTROL_CHANGE_MESSAGE_CODE + FCB1010_MIDI_CHANNEL, onesPlaceMessageCode, onesPlaceIndex]
  console.log(onesPlaceMessage)
  output.sendMessage(onesPlaceMessage)
}

initializeMidi("Focusrite", "Focusrite")

const CONTROL_CHANGE_MESSAGE_CODE = 176
const FCB1010_MIDI_CHANNEL = 0
const HX_STOMP_XL_MIDI_CHANNEL = 1

// Turn off pedals 1-10 LEDs on the FCB1010
for(let i = 0; i < 10; i++) {
  output.sendMessage([CONTROL_CHANGE_MESSAGE_CODE + FCB1010_MIDI_CHANNEL, 106, i])
}

// Update the FCB1010 7-segment display to read 'EF'
/*
output.sendMessage([CONTROL_CHANGE_MESSAGE_CODE + FCB1010_MIDI_CHANNEL, 109, 4])
output.sendMessage([CONTROL_CHANGE_MESSAGE_CODE + FCB1010_MIDI_CHANNEL, 110, 5])
*/

// Update the FCB1010 7-segment display to read 'HX'
updateFCB1010Display("L6")

// Press FS1 and FS2 on the Helix Stomp XL
output.sendMessage([CONTROL_CHANGE_MESSAGE_CODE + HX_STOMP_XL_MIDI_CHANNEL, 49, 0])
output.sendMessage([CONTROL_CHANGE_MESSAGE_CODE + HX_STOMP_XL_MIDI_CHANNEL, 50, 0])


// Close the port when done.
setTimeout(function() {
  // Turn off pedals 1-10 LEDs on the FCB1010
  for(let i = 0; i < 10; i++) {
    output.sendMessage([CONTROL_CHANGE_MESSAGE_CODE + FCB1010_MIDI_CHANNEL, 107, i])
  }

  // Clear the FCB1010 7-segment display
  updateFCB1010Display()

  // Press FS3 on the Helix Stomp XL
  output.sendMessage([CONTROL_CHANGE_MESSAGE_CODE + HX_STOMP_XL_MIDI_CHANNEL, 51, 0])

  input.closePort()
  output.closePort()
}, 5000)