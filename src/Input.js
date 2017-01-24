import Device from "./Device";
import Engine from "./Engine";

const numKeys = 256;
const numInputs = 10;
const numTotalKeys = numKeys + numInputs + 1;

function Subscriber(owner, func) {
	this.owner = owner;
	this.func = func;
}

export default class Input
{
	constructor()
	{
		this.listeners = {};
		this.ignoreKeys = {};
		this.cmdKeys = {};
		this.iframeKeys = {};

		this.enable = true;
		this.stickyKeys = false;
		this.metaPressed = false;

		this.inputs = new Array(numTotalKeys);
		this.touches = [];

		Device.on("visible", (value) => {
			if(!value) {
				this.reset();
			}
		});

		this.x = 0;
		this.y = 0;
		this.screenX = 0;
		this.screenY = 0;
		this.prevX = 0;
		this.prevY = 0;
		this.prevScreenX = 0;
		this.prevScreenY = 0;

		loadIgnoreKeys(this);
		addEventListeners(this);
	}

	handleKeyDown(domEvent)
	{
		this.checkIgnoreKey(domEvent);

		if(!this.enable) { return; }

		const keyCode = domEvent.keyCode;

		if(this.stickyKeys && this.inputs[keyCode]) {
			return;
		}

		if(domEvent.keyIdentifier === "Meta") {
			this.metaPressed = true;
		}
		else if(this.metaPressed) { 
			return;
		}

		this.inputs[keyCode] = 1;

		const inputEvent = new Input.Event();
		inputEvent.domEvent = domEvent;
		inputEvent.keyCode = keyCode;
		this.emit("keydown", inputEvent);
	}

	handleKeyUp(domEvent)
	{
		this.checkIgnoreKey(domEvent);

		if(!this.enable) { return; }

		const keyCode = event.keyCode;

		this.metaPressed = false;
		this.inputs[keyCode] = 0;

		const inputEvent = new Input.Event();
		inputEvent.domEvent = domEvent;
		inputEvent.keyCode = keyCode;

		this.emit("keyup", inputEvent);
	}

	handleMouseDown(domEvent) {
		this.handleMouseEvent("down", domEvent);
	}

	handleMouseUp(domEvent) {
		this.handleMouseEvent("up", domEvent);
	}

	handleMouseDblClick(domEvent) {
		this.handleMouseEvent("dblclick", domEvent);
	}

	handleMouseMove(domEvent)
	{
		if(document.activeElement === document.body) {
			domEvent.preventDefault();
		}

		this.handleMouseEvent("move", domEvent);
	}

	handleMouseWheel(domEvent)
	{
		if(document.activeElement === document.body) {		
			domEvent.preventDefault();
		}

		this.handleMouseEvent("wheel", domEvent);
	}

	handleMouseEvent(eventType, domEvent)
	{
		if(!this.enable) { return; }

		const wnd = Engine.window;
		const camera = Engine.camera;

		this.prevScreenX = this.screenX;
		this.prevScreenY = this.screenY;
		this.screenX = ((domEvent.pageX - wnd.offsetLeft) * wnd.scaleX) * wnd.ratio;
		this.screenY = ((domEvent.pageY - wnd.offsetTop) * wnd.scaleY) * wnd.ratio;
		this.prevX = this.x;
		this.prevY = this.y;
		this.x = (this.screenX * camera.zoomRatio) + camera.x | 0;
		this.y = (this.screenY * camera.zoomRatio) + camera.y | 0;

		const inputEvent = new Input.Event();
		inputEvent.domEvent = domEvent;
		inputEvent.screenX = this.screenX;
		inputEvent.screenY = this.screenY;
		inputEvent.x = this.x;
		inputEvent.y = this.y;

		switch(eventType) 
		{
			case "down":
			case "dblclick":
			case "up":
			{
				const keyCode = domEvent.button + Input.BUTTON_ENUM_OFFSET;
				this.inputs[keyCode] = (eventType === "up") ? 0 : 1;
				inputEvent.deltaX = this.prevScreenX - this.screenX;
				inputEvent.deltaY = this.prevScreenY - this.screenY;
				inputEvent.keyCode = keyCode;
			} break;

			case "move":
			{
				inputEvent.deltaX = this.prevScreenX - this.screenX;
				inputEvent.deltaY = this.prevScreenY - this.screenY;
				inputEvent.keyCode = 0;
			} break;

			case "wheel":
			{
				inputEvent.deltaX = Math.max(-1, Math.min(1, (domEvent.wheelDelta || -domEvent.detail)));
				inputEvent.deltaY = inputEvent.deltaX;
				inputEvent.keyCode = 0;
			} break;
		}

		this.emit(eventType, inputEvent);
	}

	handleTouchDown(domEvent) {
		this.handleTouchEvent(domEvent, "down");
	}

	handleTouchUp(domEvent) {
		this.handleTouchEvent(domEvent, "up");
	}

	handleTouchMove(domEvent) {
		this.handleTouchEvent(domEvent, "move");
	}

	handleTouchEvent(domEvent, eventType)
	{
		if(document.activeElement === document.body) {		
			domEvent.preventDefault();
		}

		const wnd = Engine.window;
		const camera = Engine.camera;

		const changedTouches = domEvent.changedTouches;
		for(let n = 0; n < changedTouches.length; n++)
		{
			const touch = changedTouches[n];

			let id;
			switch(eventType) 
			{
				case "down":
					id = this.touches.length;
					this.touches.push(touch.identifier);
					break;

				case "up":
					id = this.getTouchID(touch.identifier);
					if(id === -1) { continue; }
					this.touches.splice(id, 1);
					break;

				case "move":
					id = this.getTouchID(touch.identifier);
					break;
			}
			
			const screenX = ((touch.pageX - wnd.offsetLeft) * wnd.scaleX);
			const screenY = ((touch.pageY - wnd.offsetTop) * wnd.scaleY);
			const x = (screenX * camera.zoomRatio) + camera.x | 0;
			const y = (screenY * camera.zoomRatio) + camera.y | 0;

			const keyCode = id + this.BUTTON_ENUM_OFFSET;

			const inputEvent = new Input.Event();
			inputEvent.domEvent = domEvent;
			inputEvent.screenX = screenX;
			inputEvent.screenY = screenY;
			inputEvent.x = x;
			inputEvent.y = y;
			inputEvent.keyCode = keyCode;

			if(id === 0) 
			{
				this.prevX = this.x;
				this.prevY = this.y;
				this.prevScreenX = this.screenX;
				this.prevScreenY = this.screenY;	
				this.x = x;
				this.y = y;
				this.screenX = screenX;
				this.screenY = screenY;

				inputEvent.deltaX = this.prevScreenX - this.screenX;
				inputEvent.deltaY = this.prevScreenY - this.screenY;
			}

			switch(eventType)
			{
				case "down":
					this.inputs[keyCode] = 1;
					break;
				case "up":
					this.inputs[keyCode] = 0;
					break;
			}

			this.emit(eventType, inputEvent);
		}
	}

	isDown(keyCode) {
		return this.inputs[keyCode];
	}

	on(event, func, owner)
	{
		const sub = new Subscriber(owner, func);

		let buffer = this.listeners[event];
		if(buffer) {
			buffer.push(sub);
		}
		else {
			buffer = [ sub ];
			this.listeners[event] = buffer;
		}
	}

	off(event, func, owner)
	{
		const buffer = this.listeners[event];
		if(!buffer) { return; }

		for(let n = 0; n < buffer.length; n++)
		{
			const sub = buffer[n];
			if(sub.func === func && sub.owner === owner) {
				buffer[n] = buffer[buffer.length - 1];
				buffer.pop();
				return;
			} 
		}
	}

	emit(event, arg)
	{
		const buffer = this.listeners[event];
		if(!buffer) { return; }

		for(let n = 0; n < buffer.length; n++) {
			const sub = buffer[n];
			sub.func.call(sub.owner, arg);
		}
	}	

	reset()
	{
		// Reset keys:
		for(let n = 0; n < numKeys.length; n++) 
		{
			if(!this.inputs[n]) { continue; }

			this.inputs[n] = 0;

			const inputEvent = new Input.Event();
			inputEvent.domEvent = domEvent;
			inputEvent.keyCode = keyCode;

			this.emit("keyup", inputEvent);
		}

		// Reset inputs:
		for(let n = numKeys; n <= numKeys + numTouches; n++)
		{
			const keyCode = n + Input.BUTTON_ENUM_OFFSET;
			if(!this.inputs[keyCode]) { continue; }

			const inputEvent = new Input.Event();
			inputEvent.domEvent = domEvent;
			inputEvent.keyCode = keyCode;

			this.emit("up", inputEvent);
		}

		// Reset touches:
		for(let n = 0; n < this.touches.length; n++)
		{
			if(!this.touches[n]) { continue; }

			const keyCode = n + Input.BUTTON_ENUM_OFFSET;
			if(!this.inputs[keyCode]) { continue; }

			const inputEvent = new Input.Event();
			inputEvent.domEvent = domEvent;
			inputEvent.keyCode = keyCode;

			this.emit("up", inputEvent);
		}
	}

	getTouchID(eventTouchID)
	{
		for(let n = 0; n < this.touches.length; n++)
		{
			if(this.touches[n] === eventTouchID) {
				return n;
			}
		}

		return -1;
	}

	checkIgnoreKey(domEvent)
	{
		const keyCode = domEvent.keyCode;

		if(document.activeElement === document.body)
		{
			if(window.top && this.iframeKeys[keyCode]) {
				domEvent.preventDefault();
			}

			if(this.cmdKeys[keyCode] !== undefined) {
				this.numCmdKeysPressed++;
			}

			if(this.ignoreKeys[keyCode] !== undefined && this.numCmdKeysPressed <= 0) {
				domEvent.preventDefault();
			}
		}		
	}

	set ignoreFKeys(flag) 
	{
		if(flag) {
			ignoreFKeys(this, 1);
		}
		else {
			ignoreFKeys(this, 0);
		}
	}

	get ignoreFKeys() { 
		return !!this.ignoreKeys[112]; 
	}	
}

function addEventListeners(input)
{
	window.addEventListener("mousedown", input.handleMouseDown.bind(input));
	window.addEventListener("mouseup", input.handleMouseUp.bind(input));
	window.addEventListener("mousemove", input.handleMouseMove.bind(input));
	window.addEventListener("mousewheel", input.handleMouseWheel.bind(input));
	window.addEventListener("dblclick", input.handleMouseDblClick.bind(input));
	window.addEventListener("touchstart", input.handleTouchDown.bind(input));
	window.addEventListener("touchend", input.handleTouchUp.bind(input));
	window.addEventListener("touchmove", input.handleTouchMove.bind(input));
	window.addEventListener("touchcancel", input.handleTouchUp.bind(input));
	window.addEventListener("touchleave", input.handleTouchUp.bind(input));

	if(Device.supports.onkeydown)	{
		window.addEventListener("keydown", input.handleKeyDown.bind(input));
	}

	if(Device.supports.onkeyup)	{
		window.addEventListener("keyup", input.handleKeyUp.bind(input));
	}
}

function loadIgnoreKeys(input)
{
	input.ignoreKeys = {};
	input.ignoreKeys[8] = 1;
	input.ignoreKeys[9] = 1;
	input.ignoreKeys[13] = 1;
	input.ignoreKeys[17] = 1;
	input.ignoreKeys[91] = 1;
	input.ignoreKeys[38] = 1; 
	input.ignoreKeys[39] = 1; 
	input.ignoreKeys[40] = 1; 
	input.ignoreKeys[37] = 1;
	input.ignoreKeys[124] = 1;
	input.ignoreKeys[125] = 1;
	input.ignoreKeys[126] = 1;		

	input.cmdKeys[91] = 1;
	input.cmdKeys[17] = 1;

	input.iframeKeys[37] = 1;
	input.iframeKeys[38] = 1;
	input.iframeKeys[39] = 1;
	input.iframeKeys[40] = 1;
}

function ignoreFKeys(input, value) 
{
	for(let n = 112; n <= 123; n++) {
		input.ignoreKeys[n] = value;
	}
}

Input.Event = function()
{
	this.domEvent = null;
	this.x = 0;
	this.y = 0;
	this.deltaX = 0;
	this.deltaY = 0;
	this.screenX = 0;
	this.screenY = 0;
	this.keyCode = 0;
}

Input.BUTTON_ENUM_OFFSET = 256;

Input.BACKSPACE = 8;
Input.TAB = 9;
Input.ENTER = 13;
Input.SHIFT = 16;
Input.ESC = 27;
Input.SPACE = 32;
Input.LEFT = 37;
Input.UP = 38;
Input.RIGHT = 39;
Input.DOWN = 40;
Input.DELETE = 46;	
Input.NUM_0 = 48;
Input.NUM_1 = 49;
Input.NUM_2 = 50;
Input.NUM_3 = 51;
Input.NUM_4 = 52;
Input.NUM_5 = 53;
Input.NUM_6 = 54;
Input.NUM_7 = 55;
Input.NUM_8 = 56;
Input.NUM_9 = 57;
Input.NUMPAD_0 = 96;
Input.NUMPAD_1 = 97;
Input.NUMPAD_2 = 98;
Input.NUMPAD_3 = 99;
Input.NUMPAD_4 = 100;
Input.NUMPAD_5 = 101;
Input.NUMPAD_6 = 102;
Input.NUMPAD_7 = 103;
Input.NUMPAD_8 = 104;
Input.NUMPAD_9 = 105;
Input.MULTIPLY = 106;
Input.ADD = 107;
Input.SUBTRACT = 109;
Input.DECIMAL = 110;
Input.DIVIDE = 111;
Input.A = 65;
Input.B = 66;
Input.C = 67;
Input.D = 68;
Input.E = 69;
Input.F = 70;
Input.G = 71;
Input.H = 72;
Input.I = 73;
Input.J = 74;
Input.K = 75;
Input.L = 76;
Input.M = 77;
Input.N = 78;
Input.O = 79;
Input.P = 80;
Input.Q = 81;
Input.R = 82;
Input.S = 83;
Input.T = 84;
Input.U = 85;
Input.V = 86;
Input.W = 87;
Input.X = 88;
Input.Y = 89;
Input.Z = 90;
Input.SQUARE_BRACKET_LEFT = 91;
Input.SQUARE_BRACKET_RIGHT = 91;
Input.PARENTHESES_LEFT = 91;
Input.PARENTHESES_RIGHT = 91;
Input.BRACES_LEFT = 91;
Input.BRACES_RIGHT = 92;
Input.F1 = 112;
Input.F2 = 113;
Input.F3 = 114;
Input.F4 = 115;
Input.F5 = 116;
Input.F6 = 117;
Input.F7 = 118;
Input.F8 = 119;
Input.F9 = 120;
Input.F10 = 121;
Input.F11 = 122;
Input.F12 = 123;
Input.PLUS = 187;
Input.MINUS = 189;
Input.TILDE = 192;
Input.APOSTROPHE = 222;
Input.BUTTON_LEFT = 0 + Input.BUTTON_ENUM_OFFSET;
Input.BUTTON_MIDDLE = 1 + Input.BUTTON_ENUM_OFFSET;
Input.BUTTON_RIGHT = 2 + Input.BUTTON_ENUM_OFFSET;
