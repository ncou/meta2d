
export default class EngineWindow
{
    constructor(settings) 
    {
		this.settings = settings || {};

		this.width = 0;
		this.height = 0;
		this.canvas = null;
		this.canvasParent = null;
		this.gl = null;
		this.listeners = {};

		this.create();
    }

	create()
	{
		if(this.settings.canvas) 
		{
			this.canvas = this.settings.canvas;
			this.canvasParent = this.canvas.parentElement;
		}
		else 
		{
			this.canvas = document.createElement("canvas");
			this.canvasParent = document.body;
			this.canvasParent.appendChild(this.canvas);
		}

		const canvasStyle = `position:absolute; 
							overflow:hidden; translateZ(0);
							-webkit-backface-visibility:hidden;
							-webkit-perspective: 1000;
							-webkit-touch-callout: none; 
							-webkit-user-select: none; 
							zoom: 1;`;
		this.canvas.style = canvasStyle;
		this.canvas.addEventListener("webglcontextlost", this.onContextLost.bind());	
		this.canvas.addEventListener("webglcontextrestored", this.onContextRestored.bind());	

		this.gl = this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl");

		this.updateViewport();
	}

	updateViewport()
	{
		let parentWidth, parentHeight;

		if(this.canvasParent === document.body) {
			parentWidth = window.innerWidth;
			parentHeight = window.innerHeight;
		}
		else {
			parentWidth = this.canvasParent.clientWidth;
			parentHeight = this.canvasParent.clientHeight;
		}

		this.width = this.settings.width || parentWidth;
		this.height = this.settings.height || parentHeight;
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.canvas.style.width = this.canvas.width + "px";
		this.canvas.style.height = this.canvas.height + "px";

		this.gl.viewport(0, 0, this.width, this.height);	

		this.emit("resize");
	}

	resize(width, height)
	{
		this.settings.width = width;
		this.settings.height = height;
		this.updateViewport();
	}

	onFocus(value)
	{
		if(this.focus === value) { return; }
		this.focus = value;

		if(this.settings.pauseOnBlur) {
			this.pause = !value;
		}

		this.emit("focus", value);
	}

	onVisibilityChange()
	{
		if(document[device.hidden]) {
			this.onFocus(false);
		}
		else {
			this.onFocus(true);
		}
	}

	onContextLost() {
		console.log("(Context lost)");
	}

	onContextRestored() {
		console.log("(Context restored)");
	}

	on(event, func)
	{
		let buffer = this.listeners[event];
		if(buffer) {
			buffer.push(func);
		}
		else {
			buffer = [ func ];
			this.listeners[event] = buffer;
		}
	}

	off(event, func)
	{
		const buffer = this.listeners[event];
		if(!buffer) { return; }

		const index = buffer.indexOf(func);
		if(index === -1) { return; }

		buffer[index] = buffer[buffer.length - 1];
		buffer.pop();
	}

	emit(event)
	{
		const buffer = this.listeners[event];
		if(!buffer) { return; }

		for(let n = 0; n < buffer.length; n++) {
			buffer[n](this);
		}
	}
}
