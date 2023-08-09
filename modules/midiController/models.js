import { default as midi } from 'midi'
import options from './options.js'

export default class MidiController {
	static options = options

	constructor(inputNameIncludes, outputNameIncludes) {
		this.initialized = false
		this.devices = []

		// Open the input and output MIDI device
		this.input = new midi.Input()
		this.inputName = null
		this.output = new midi.Output()
		this.outputName = null

		this.initialize(inputNameIncludes, outputNameIncludes)

		if(!this.initialized)
			console.error("There was an error while initailizing the MidiController.")
	}

	initialize(inputNameIncludes, outputNameIncludes) {
	  // Compile and a list of available input port names
	  const INPUT_PORT_NAMES = MidiController.constructPortNameList(this.input)
	  console.log('Found the following MIDI input ports:')
	  console.table(INPUT_PORT_NAMES)

	  // Compile a list of available output port names
	  const OUTPUT_PORT_NAMES = MidiController.constructPortNameList(this.output)
	  console.log('Found the following MIDI output ports:')
	  console.table(OUTPUT_PORT_NAMES)

	  // Search for the desired input and output ports
  	const DESIRED_INPUT_PORT = MidiController.getIndexContainingName(INPUT_PORT_NAMES, inputNameIncludes)
  	const DESIRED_OUTPUT_PORT = MidiController.getIndexContainingName(OUTPUT_PORT_NAMES, outputNameIncludes)

  	// If we can't find the desired input or output port, abort
    if (DESIRED_INPUT_PORT < 0 || DESIRED_OUTPUT_PORT < 0) {
      return
    }

    // Open the input and output ports
	  this.input.openPort(DESIRED_INPUT_PORT)
	  this.inputName = INPUT_PORT_NAMES[DESIRED_INPUT_PORT]
	  this.output.openPort(DESIRED_OUTPUT_PORT)
	  this.outputName = OUTPUT_PORT_NAMES[DESIRED_OUTPUT_PORT]

	  // Configure a callback
	  this.input.on("message", (deltaTime, message) => this.handleMessage(this, deltaTime, message));

	  // Sysex, timing, and active sensing messages are ignored
	  // by default. To enable these message types, pass false for
	  // the appropriate type in the function below.
	  // Order: (Sysex, Timing, Active Sensing)
	  // For example if you want to receive only MIDI Clock beats
	  // you should use
	  // input.ignoreTypes(true, false, true)
	  this.input.ignoreTypes(false, false, false)

	  this.initialized = true
	}

	registerDevice(device) {
		const deviceAlreadyExists = this.devices.find(element => element.name === device.name)

		if(deviceAlreadyExists) {
			console.error("Error adding the device! A device with that name already exists.")
			return
		}
		
		device.initialize(this.input, this.output)
		this.devices.push(device)
	}

	getDevice(channel) {
		return this.devices.find(device => device.channel === channel)
	}

	handleMessage(self, deltaTime, message) {
		if(!self.initialized)
			return

		const statusByte = message[0]
		let customMessage = ` MESSAGE: ${message}, DELTA: ${deltaTime}`

		if(MidiController.options.NOTE_OFF_COMMAND_MIN <= statusByte && statusByte <= MidiController.options.NOTE_OFF_COMMAND_MAX) {
			customMessage = MidiController.options.NOTE_OFF_COMMAND_NAME + customMessage
		} else if(MidiController.options.NOTE_ON_COMMAND_MIN <= statusByte && statusByte <= MidiController.options.NOTE_ON_COMMAND_MAX) {
			customMessage = MidiController.options.NOTE_ON_COMMAND_NAME + customMessage
		} else if(MidiController.options.CONTROL_CHANGE_COMMAND_MIN <= statusByte && statusByte <= MidiController.options.CONTROL_CHANGE_COMMAND_MAX) {
			customMessage = MidiController.options.CONTROL_CHANGE_COMMAND_NAME + customMessage
		} else if(MidiController.options.PROGRAM_CHANGE_COMMAND_MIN <= statusByte && statusByte <= MidiController.options.PROGRAM_CHANGE_COMMAND_MAX) {
			customMessage = MidiController.options.PROGRAM_CHANGE_COMMAND_NAME + customMessage
		} else {
			customMessage = MidiController.options.UNKNOWN_COMMAND_NAME + customMessage
		}

		const deviceChannel = MidiController.getDeviceChannel(statusByte)
		let device = self.getDevice(deviceChannel)
		if(!device) {
			//console.log(`${customMessage}`)
			//console.error(`Can't forward the MIDI message, because no MidiDevice was added for channel #: ${deviceChannel}`)
			return
		}

		console.log(`${customMessage}`)
		console.log(`Forwarding this MIDI message to device: ${device.name}, on channel #: ${device.channel}`)
	}

	// Helper to construct a list of MIDI port names
	static constructPortNameList(inOrOut) {
	  var portNameList = []
	  for(let i = 0; i < inOrOut.getPortCount(); i++) {
	    let portName = inOrOut.getPortName(i)
	    portNameList.push(portName)
	  }
	  return portNameList
	}

	// Helper to find the index of a port with a specified name
	static getIndexContainingName(list, name) {
	  return list.findIndex(element => element.includes(name))
	}

	// Helper to retrieve the device channel for the specified status byte
	static getDeviceChannel(statusByte) {
		if(MidiController.options.NOTE_OFF_COMMAND_MIN <= statusByte && statusByte <= MidiController.options.NOTE_OFF_COMMAND_MAX) {
			return statusByte - MidiController.options.NOTE_OFF_COMMAND_MIN + 1
		} else if(MidiController.options.NOTE_ON_COMMAND_MIN <= statusByte && statusByte <= MidiController.options.NOTE_ON_COMMAND_MAX) {
			return statusByte - MidiController.options.NOTE_ON_COMMAND_MIN + 1
		} else if(MidiController.options.CONTROL_CHANGE_COMMAND_MIN <= statusByte && statusByte <= MidiController.options.CONTROL_CHANGE_COMMAND_MAX) {
			return statusByte - MidiController.options.CONTROL_CHANGE_COMMAND_MIN + 1
		} else if(MidiController.options.PROGRAM_CHANGE_COMMAND_MIN <= statusByte && statusByte <= MidiController.options.PROGRAM_CHANGE_COMMAND_MAX) {
			return statusByte - MidiController.options.PROGRAM_CHANGE_COMMAND_MIN + 1
		}
	}
}
