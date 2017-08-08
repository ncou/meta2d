import Device from "./Device"
import Engine from "./Engine"

const NUM_KEYS = 256
const NUM_INPUTS = 10
const NUM_KEYS_TOTAL = NUM_KEYS + NUM_INPUTS + 1
const BUTTON_ENUM_OFFSET = 256

class Input
{
	constructor()
	{
		this.KeyCode = null

		this.listeners = {}
		this.ignoreKeys = {}
		this.cmdKeys = {}
		this.iframeKeys = {}

		this.enable = true
		this.stickyKeys = false
		this.metaPressed = false
		this.firstInputEvent = true

		this.inputs = new Array(NUM_KEYS_TOTAL)
		this.touches = []

		this.x = 0
		this.y = 0
		this.screenX = 0
		this.screenY = 0
		this.prevX = 0
		this.prevY = 0
		this.prevScreenX = 0
		this.prevScreenY = 0

		loadIgnoreKeys(this)
		addEventListeners(this)

		Device.on("visible", (value) => {
			if(!value) {
				this.reset()
			}
		})
	}

	handleKeyDown(domEvent)
	{
		this.checkIgnoreKey(domEvent)

		if(!this.enable) { return }

		const keyCode = domEvent.keyCode

		if(this.stickyKeys && this.inputs[keyCode]) {
			return
		}

		if(domEvent.keyIdentifier === "Meta") {
			this.metaPressed = true
		}
		else if(this.metaPressed) {
			return
		}

		this.inputs[keyCode] = 1

		const inputEvent = new InputEvent()
		inputEvent.domEvent = domEvent
		inputEvent.keyCode = keyCode
		this.emit("keydown", inputEvent)
	}

	handleKeyUp(domEvent)
	{
		this.checkIgnoreKey(domEvent)

		if(!this.enable) { return }

		const keyCode = domEvent.keyCode

		this.metaPressed = false
		this.inputs[keyCode] = 0

		const inputEvent = new InputEvent()
		inputEvent.domEvent = domEvent
		inputEvent.keyCode = keyCode

		this.emit("keyup", inputEvent)
	}

	handleMouseDown(domEvent) {
		this.handleMouseEvent("down", domEvent)
	}

	handleMouseUp(domEvent) {
		this.handleMouseEvent("up", domEvent)
	}

	handleMouseDblClick(domEvent) {
		this.handleMouseEvent("dblclick", domEvent)
	}

	handleMouseMove(domEvent)
	{
		if(document.activeElement === document.body) {
			domEvent.preventDefault()
		}

		this.handleMouseEvent("move", domEvent)
	}

	handleMouseWheel(domEvent)
	{
		if(document.activeElement === document.body) {
			domEvent.preventDefault()
		}

		this.handleMouseEvent("wheel", domEvent)
	}

	handleMouseEvent(eventType, domEvent)
	{
		if(!this.enable) { return }

		const wnd = meta.engine
		const camera = meta.camera

		this.prevScreenX = this.screenX
		this.prevScreenY = this.screenY
		this.screenX = ((domEvent.pageX - wnd.offsetLeft) * wnd.scaleX) / wnd.ratio
		this.screenY = ((domEvent.pageY - wnd.offsetTop) * wnd.scaleY) / wnd.ratio
		this.prevX = this.x
		this.prevY = this.y
		this.x = ((this.screenX * camera.zoomRatio) + camera.x) / wnd.ratio | 0
		this.y = ((this.screenY * camera.zoomRatio) + camera.y) / wnd.ratio | 0

		const inputEvent = new InputEvent()
		inputEvent.domEvent = domEvent
		inputEvent.screenX = this.screenX
		inputEvent.screenY = this.screenY
		inputEvent.x = this.x
		inputEvent.y = this.y

		switch(eventType)
		{
			case "down":
			case "dblclick":
			case "up":
			{
				const keyCode = domEvent.button + BUTTON_ENUM_OFFSET
				this.inputs[keyCode] = (eventType === "up") ? 0 : 1

				if(this.firstInputEvent) {
					inputEvent.deltaX = 0
					inputEvent.deltaY = 0
					this.firstInputEvent = false
				}
				else {
					inputEvent.deltaX = (this.prevScreenX - this.screenX) * camera.zoomRatio / wnd.ratio
					inputEvent.deltaY = (this.prevScreenY - this.screenY) * camera.zoomRatio / wnd.ratio
				}

				inputEvent.keyCode = keyCode
			} break

			case "move":
			{
				if(this.firstInputEvent) {
					inputEvent.deltaX = 0
					inputEvent.deltaY = 0
					this.firstInputEvent = false
				}
				else {
					inputEvent.deltaX = -domEvent.movementX * camera.zoomRatio / wnd.ratio
					inputEvent.deltaY = -domEvent.movementY * camera.zoomRatio / wnd.ratio
				}

				inputEvent.keyCode = 0
			} break

			case "wheel":
			{
				inputEvent.deltaX = Math.max(-1, Math.min(1, (domEvent.wheelDelta || -domEvent.detail)))
				inputEvent.deltaY = inputEvent.deltaX
				inputEvent.keyCode = 0
			} break
		}

		this.emit(eventType, inputEvent)
	}

	handleTouchDown(domEvent) {
		this.handleTouchEvent(domEvent, "down")
	}

	handleTouchUp(domEvent) {
		this.handleTouchEvent(domEvent, "up")
	}

	handleTouchMove(domEvent) {
		this.handleTouchEvent(domEvent, "move")
	}

	handleTouchEvent(domEvent, eventType)
	{
		if(document.activeElement === document.body) {
			domEvent.preventDefault()
		}

		const wnd = Engine.window
		const camera = meta.camera

		const changedTouches = domEvent.changedTouches
		for(let n = 0; n < changedTouches.length; n++)
		{
			const touch = changedTouches[n]

			let id
			switch(eventType)
			{
				case "down":
					id = this.touches.length
					this.touches.push(touch.identifier)
					break

				case "up":
					id = this.getTouchID(touch.identifier)
					if(id === -1) { continue }
					this.touches.splice(id, 1)
					break

				case "move":
					id = this.getTouchID(touch.identifier)
					break
			}

			const screenX = ((touch.pageX - wnd.offsetLeft) * wnd.scaleX)
			const screenY = ((touch.pageY - wnd.offsetTop) * wnd.scaleY)
			const x = (screenX * camera.zoomRatio) + camera.x | 0
			const y = (screenY * camera.zoomRatio) + camera.y | 0

			const keyCode = id + BUTTON_ENUM_OFFSET

			const inputEvent = new InputEvent()
			inputEvent.domEvent = domEvent
			inputEvent.screenX = screenX
			inputEvent.screenY = screenY
			inputEvent.x = x
			inputEvent.y = y
			inputEvent.keyCode = keyCode

			if(id === 0)
			{
				this.prevX = this.x
				this.prevY = this.y
				this.prevScreenX = this.screenX
				this.prevScreenY = this.screenY
				this.x = x
				this.y = y
				this.screenX = screenX
				this.screenY = screenY

				if(this.firstInputEvent) {
					inputEvent.deltaX = 0
					inputEvent.deltaY = 0
					this.firstInputEvent = false
				}
				else {
					inputEvent.deltaX = this.prevScreenX - this.screenX
					inputEvent.deltaY = this.prevScreenY - this.screenY
				}
			}

			switch(eventType)
			{
				case "down":
					this.inputs[keyCode] = 1
					break
				case "up":
					this.inputs[keyCode] = 0
					break
			}

			this.emit(eventType, inputEvent)
		}
	}

	pressed(keyCode) {
		return this.inputs[keyCode]
	}

	on(event, func)
	{
		const buffer = this.listeners[event]
		if(buffer) {
			buffer.push(func)
		}
		else {
			this.listeners[event] = [ func ]
		}
	}

	off(event, func)
	{
		const buffer = this.listeners[event]
		if(!buffer) { return }

		const index = buffer.indexOf(func)
		if(index === -1) { return }

		buffer[index] = buffer[buffer.length - 1]
		buffer.pop()
	}

	emit(event, arg)
	{
		const buffer = this.listeners[event]
		if(!buffer) { return }

		for(let n = 0; n < buffer.length; n++) {
			buffer[n](arg)
		}
	}

	reset()
	{
		// Reset keys:
		for(let n = 0; n < NUM_KEYS; n++)
		{
			if(!this.inputs[n]) { continue }

			this.inputs[n] = 0

			const inputEvent = new InputEvent()
			inputEvent.domEvent = domEvent
			inputEvent.keyCode = keyCode

			this.emit("keyup", inputEvent)
		}

		// Reset inputs:
		for(let n = NUM_KEYS; n <= NUM_KEYS + NUM_INPUTS; n++)
		{
			const keyCode = n + BUTTON_ENUM_OFFSET
			if(!this.inputs[keyCode]) { continue }

			const inputEvent = new InputEvent()
			inputEvent.domEvent = domEvent
			inputEvent.keyCode = keyCode

			this.emit("up", inputEvent)
		}

		// Reset touches:
		for(let n = 0; n < this.touches.length; n++)
		{
			if(!this.touches[n]) { continue }

			const keyCode = n + BUTTON_ENUM_OFFSET
			if(!this.inputs[keyCode]) { continue }

			const inputEvent = new InputEvent()
			inputEvent.domEvent = domEvent
			inputEvent.keyCode = keyCode

			this.emit("up", inputEvent)
		}
	}

	getTouchID(eventTouchID)
	{
		for(let n = 0; n < this.touches.length; n++)
		{
			if(this.touches[n] === eventTouchID) {
				return n
			}
		}

		return -1
	}

	checkIgnoreKey(domEvent)
	{
		const keyCode = domEvent.keyCode

		if(document.activeElement === document.body)
		{
			if(window.top && this.iframeKeys[keyCode]) {
				domEvent.preventDefault()
			}

			if(this.cmdKeys[keyCode] !== undefined) {
				this.numCmdKeysPressed++
			}

			if(this.ignoreKeys[keyCode] !== undefined && this.numCmdKeysPressed <= 0) {
				domEvent.preventDefault()
			}
		}
	}

	set ignoreFKeys(flag)
	{
		if(flag) {
			ignoreFKeys(this, 1)
		}
		else {
			ignoreFKeys(this, 0)
		}
	}

	get ignoreFKeys() {
		return !!this.ignoreKeys[112]
	}
}

const addEventListeners = function(input)
{
	window.addEventListener("mouseup", input.handleMouseUp.bind(input))
	window.addEventListener("mousemove", input.handleMouseMove.bind(input))
	window.addEventListener("mousewheel", input.handleMouseWheel.bind(input))
	window.addEventListener("mousedown", input.handleMouseDown.bind(input))
	window.addEventListener("dblclick", input.handleMouseDblClick.bind(input))
	window.addEventListener("touchstart", input.handleTouchDown.bind(input))
	window.addEventListener("touchend", input.handleTouchUp.bind(input))
	window.addEventListener("touchmove", input.handleTouchMove.bind(input))
	window.addEventListener("touchcancel", input.handleTouchUp.bind(input))
	window.addEventListener("touchleave", input.handleTouchUp.bind(input))

	if(Device.supports.onkeydown)	{
		window.addEventListener("keydown", input.handleKeyDown.bind(input))
	}

	if(Device.supports.onkeyup)	{
		window.addEventListener("keyup", input.handleKeyUp.bind(input))
	}
}

const loadIgnoreKeys = function(input)
{
	input.ignoreKeys = {}
	input.ignoreKeys[8] = 1
	input.ignoreKeys[9] = 1
	input.ignoreKeys[13] = 1
	input.ignoreKeys[17] = 1
	input.ignoreKeys[91] = 1
	input.ignoreKeys[38] = 1
	input.ignoreKeys[39] = 1
	input.ignoreKeys[40] = 1
	input.ignoreKeys[37] = 1
	input.ignoreKeys[124] = 1
	input.ignoreKeys[125] = 1
	input.ignoreKeys[126] = 1

	input.cmdKeys[91] = 1
	input.cmdKeys[17] = 1

	input.iframeKeys[37] = 1
	input.iframeKeys[38] = 1
	input.iframeKeys[39] = 1
	input.iframeKeys[40] = 1
}

const ignoreFKeys = function(input, value)
{
	for(let n = 112; n <= 123; n++) {
		input.ignoreKeys[n] = value
	}
}

class InputEvent
{
	constructor() {
		this.domEvent = null
		this.x = 0
		this.y = 0
		this.deltaX = 0
		this.deltaY = 0
		this.screenX = 0
		this.screenY = 0
		this.keyCode = 0
	}
}

const instance = new Input()

instance.KeyCode = {
	BACKSPACE: 8,
	TAB: 9,
	ENTER: 13,
	SHIFT: 16,
	ESC: 27,
	SPACE: 32,
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	DELETE: 46,
	NUM_0: 48,
	NUM_1: 49,
	NUM_2: 50,
	NUM_3: 51,
	NUM_4: 52,
	NUM_5: 53,
	NUM_6: 54,
	NUM_7: 55,
	NUM_8: 56,
	NUM_9: 57,
	NUMPAD_0: 96,
	NUMPAD_1: 97,
	NUMPAD_2: 98,
	NUMPAD_3: 99,
	NUMPAD_4: 100,
	NUMPAD_5: 101,
	NUMPAD_6: 102,
	NUMPAD_7: 103,
	NUMPAD_8: 104,
	NUMPAD_9: 105,
	MULTIPLY: 106,
	ADD: 107,
	SUBTRACT: 109,
	DECIMAL: 110,
	DIVIDE: 111,
	A: 65,
	B: 66,
	C: 67,
	D: 68,
	E: 69,
	F: 70,
	G: 71,
	H: 72,
	I: 73,
	J: 74,
	K: 75,
	L: 76,
	M: 77,
	N: 78,
	O: 79,
	P: 80,
	Q: 81,
	R: 82,
	S: 83,
	T: 84,
	U: 85,
	V: 86,
	W: 87,
	X: 88,
	Y: 89,
	Z: 90,
	SQUARE_BRACKET_LEFT: 219,
	SQUARE_BRACKET_RIGHT: 221,
	PARENTHESES_LEFT: 57,
	PARENTHESES_RIGHT: 48,
	BRACES_LEFT: 219,
	BRACES_RIGHT: 221,
	F1: 112,
	F2: 113,
	F3: 114,
	F4: 115,
	F5: 116,
	F6: 117,
	F7: 118,
	F8: 119,
	F9: 120,
	F10: 121,
	F11: 122,
	F12: 123,
	PLUS: 187,
	MINUS: 189,
	TILDE: 192,
	APOSTROPHE: 222,
	BUTTON_LEFT: BUTTON_ENUM_OFFSET,
	BUTTON_MIDDLE: BUTTON_ENUM_OFFSET + 1,
	BUTTON_RIGHT: BUTTON_ENUM_OFFSET + 2
}

export default instance
