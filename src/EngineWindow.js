import Engine from "./Engine"
import Device from "./Device"
import { Input, KeyCode } from "./Input"
import Time from "./Time"
import Flags from "./Flags"

meta.engine = 
{
	create: function()
	{
		this.offsetLeft = 0
		this.offsetTop = 0

		this.onCreate();

		this._createRenderer();
		this.printVersion()

		// Callbacks:
		var self = this;
		this.cb = {
			resize: function(event) { self.updateResolution(); },
			focus: function(event) { self.handleFocus(true); },
			blur: function(event) { self.handleFocus(false); }
		};

		window.addEventListener("resize", this.cb.resize, false);
		window.addEventListener("orientationchange", this.cb.resize, false);	

		// Page Visibility API:
		if(Device.supports.hidden) {
			this.cb.visibilityChange = function() { self.handleVisibilityChange(); };
			document.addEventListener(meta.device.visibilityChange, this.cb.visibilityChange);
		}

		window.addEventListener("focus", this.cb.focus);
		window.addEventListener("blur", this.cb.blur);		

		// Fullscreen API:
		if(Device.supports.fullScreen) {
			this.cb.fullscreen = function() { self.onFullScreenChangeCB(); };
			document.addEventListener(meta.device.fullScreenOnChange, this.cb.fullscreen);
		}

		meta.camera = new meta.Camera();
		meta.world = new meta.World(0, 0);
		meta.resources = new Resource.Manager();
		meta.physics = new Physics.Manager();
		meta.steering = new Steering.Manager();

		var resources = meta.resources;
		resources.onLoadingStart.add(this.onLoadingStart, this);
		resources.onLoadingEnd.add(this.onLoadingEnd, this);

		this._initAll();
	},

	onCreate: function()
	{
		this.onUpdate = meta.createChannel(meta.Event.UPDATE);
		this.onResize = meta.createChannel(meta.Event.RESIZE);
		this.onAdapt = meta.createChannel(meta.Event.ADAPT);
		this.onBlur = meta.createChannel(meta.Event.BLUR);
		this.onFocus = meta.createChannel(meta.Event.FOCUS);
		this.onFullscreen = meta.createChannel(meta.Event.FULLSCREEN);
		this.onDebug = meta.createChannel(meta.Event.DEBUG);

		if(!this._container) {
			this._container = document.body;	
		}	
		
		this._container.style.cssText = this.elementStyle;
	},

	parseFlags: function()
	{
		var flag, flagName, flagValue, flagSepIndex;
		var flags = window.location.hash.substr(1).split(",")
		var num = flags.length;

		for(var n = 0; n < num; n++) 
		{
			flag = flags[n];
			flagSepIndex = flag.indexOf("=");
			if(flagSepIndex > 0)
			{
				flagName = flag.substr(0, flagSepIndex).replace(/ /g, "");
				flagValue = eval(flag.substr(flagSepIndex + 1).replace(/ /g, ""));
				Flags[flagName] = flagValue;
			}
		}
	},

	_initAll: function()
	{
		this.time.current = Date.now();

		var cache = meta.cache;

		// create master view:
		var masterView = new meta.View("master");
		cache.views["master"] = masterView;
		cache.view = masterView;

		// create controller instances:
		var ctrlInfo;
		var ctrlsToCreate = cache.ctrlsToCreate;
		var num = ctrlsToCreate.length;
		for(var n = 0; n < num; n++) {
			ctrlInfo = ctrlsToCreate[n];
			ctrlInfo.scope[ctrlInfo.cls.prototype.name] = new ctrlInfo.cls();
		}
		cache.ctrlsToCreate = null;

		console.log(" ");

		this.flags |= this.Flag.INITED;

		if(Engine.setup) {
			Engine.setup()
		}

		this._loadAll();
	},

	_loadAll: function()
	{
		if(!meta._loadAllScripts()) {
			this._handlePreload();
		}
	},

	_handlePreload()
	{
		this.meta.renderer.load();
		Input.on("keydown", this.handleKeyDown.bind(this))

		var cache = meta.cache;
		var masterView = meta.cache.view;
		masterView.flags |= masterView.Flag.ACTIVE;
		masterView._activate();
		
		this._startMainLoop();

		if(!meta.resources.loading) {
			this._handleLoad();
		}
	},

	_handleLoad: function()
	{
		this.flags |= this.Flag.PRELOADED;

		var cache = meta.cache;

		if(!meta.resources.loading) {
			this._handleReady();
		}
	},

	_handleReady: function()
	{
		if(this.flags & this.Flag.READY) { return }

		this.flags |= this.Flag.LOADED;

		if(Engine.ready) {
			Engine.ready()
		}

		this.flags |= this.Flag.READY;
		meta.renderer.needRender = true;
	},

	_startMainLoop: function() 
	{
		var self = this;
		//this._updateLoop = function() { self.update(); };
		this._renderLoop = function() { self.render(); };
		//this.update();
		this.render();
	},	

	update: function(tDelta)
	{
		var n, num;

		if(this.flags & this.Flag.READY)
		{
			num = this.controllersReady.length;
			if(num > 0 && !this.meta.resources.loading) 
			{
				var controller;
				for(n = 0; n < this.controllersReady.length; n++) {
					controller = this.controllersReady[n];
					if(controller.flags & controller.Flag.LOADED) {
						controller.ready();
					}
				}

				this.controllersReady.length = 0;
			} 
		}

		if(this.flags & this.Flag.LOADED) 
		{
			num = this.updateFuncs.length;
			for(n = 0; n < num; n++) {
				this.updateFuncs[n](tDelta);
			}

			num = this.controllersUpdate.length;
			for(n = 0; n < num; n++) {
				this.controllersUpdate[n].onUpdate(tDelta);
			}

			this.onUpdate.emit(tDelta);
		}

		if(Engine.update) {
			Engine.update(this.time.deltaF)
		}
		
		this.meta.renderer.update(tDelta);
		this.meta.camera.update(tDelta);
	},

	render: function()
	{
		this.time.frameIndex++;

		Time.start()

		var tNow = Date.now();

		// Calculate tDelta:
		if(this.time.pause) {
			this.time.delta = 0;
			this.time.deltaF = 0;
		}
		else 
		{
			this.time.delta = tNow - this.time.current;
			if(this.time.delta > this.time.maxDelta) {
				this.time.delta = this.time.maxDelta;
			}

			this.time.delta *= this.time.scale;
			this.time.deltaF = this.time.delta / 1000;

			this.time.accumulator += this.time.delta;			
		}

		// Update FPS:
		if(tNow - this.time.fps >= 1000) {
			this.time.fps = tNow;
			this.fps = this._fpsCounter;
			this._fpsCounter = 0;
		}

		this.update(this.time.deltaF);

		// Process all render functions:
		meta.renderer.render(this.time.deltaF);

		if(Engine.render) {
			Engine.render(this.time.deltaF)
		}
		
		var num = this.renderFuncs.length;
		for(var n = 0; n < num; n++) {
			this.renderFuncs[n](this.time.tDeltaF);
		}	

		this._fpsCounter++;
		this.time.current = tNow;

		Time.end()

		requestAnimationFrame(this._renderLoop);
	},

	sortAdaptions: function()
	{
		var scope = meta;
		var resolutions = scope.cache.resolutions;
		if(!resolutions) { return; }

		var numResolutions = resolutions.length;
		if(numResolutions <= 1) { return; }

		resolutions.sort(function(a, b) {
			var length_a = scope.math.length2(a.width, a.height);
			var length_b = scope.math.length2(b.width, b.height);
			return length_a - length_b;
		});

		var lowestResolution = resolutions[0];
		var reso, prevReso;
		for(var i = 1; i < numResolutions; i++) {
			prevReso = resolutions[i - 1];
			reso = resolutions[i];
			reso.unitSize = (reso.height / lowestResolution.height);
			reso.zoomThreshold = prevReso.unitSize + ((reso.unitSize - prevReso.unitSize) / 100) * 33;
		}

		meta.maxUnitSize = resolutions[numResolutions - 1].unitSize;
		meta.maxUnitRatio = 1.0 / meta.maxUnitSize;

		scope.camera.bounds(lowestResolution.width, lowestResolution.height);		
	},

	adaptResolution: function()
	{
		var scope = meta;
		var resolutions = scope.cache.resolutions;
		if(!resolutions) { return false; }

		var numResolutions = resolutions.length;
		if(numResolutions < 1) { return false; }

		var resolution;
		var newResolution = resolutions[0];
		var zoom = scope.camera.zoom;

		for(var i = numResolutions - 1; i >= 0; i--) 
		{
			resolution = resolutions[i];
			if(zoom >= resolution.zoomThreshold) {
				newResolution = resolution;
				break;
			}
		}		

		if(newResolution === scope.cache.currResolution) {
			return true;
		}

		scope.cache.currResolution = newResolution;
		scope.unitSize = newResolution.unitSize;	
		scope.unitRatio = 1.0 / scope.unitSize;	
		this.onAdapt.emit(newResolution, meta.Event.ADAPT);

		return true;
	},	

	handleKeyDown(data, event) 
	{
		switch(data.keyCode)
		{
			case KeyCode.TILDE:
			{
				meta.debug = !meta.cache.debug;
				meta.renderer.needRender = true;
			} break;
		}
	},

	onLoadingStart: function(data, event) 
	{
		this.flags |= this.Flag.LOADING;

		var state;

		if(!this.preloaded) {
			state = "Preloading";
			meta.preloading.load();
		}
		else {
			state = "Loading";
			meta.loading.load();
		}

		if(Device.supports.consoleCSS) {
			console.log("%c(" + state + " started)", "background: #eee; font-weight: bold;");
		}
		else {
			console.log("(" + state + " started)");
		}
	},

	onLoadingEnd: function(data, event) 
	{
		this.flags &= ~this.Flag.LOADING;

		var state;

		if(!this.preloaded) {
			state = "Preloading";
			meta.preloading.unload();
		}
		else {
			state = "Loading";
			meta.loading.unload();
		}

		if(Device.supports.consoleCSS) {
			console.log("%c(" + state + " ended)", "background: #eee; font-weight: bold;");
		}
		else {
			console.log("(" + state + " ended)");
		}

		if(!this.preloaded) {
			this._handleLoad();
		}
		else {
			this._handleReady();
		}

		meta.renderer.needRender = true;
	},

	onScriptLoadingEnd: function() {
		this._handlePreload();
	},

	updateLoading: function() 
	{
		if(!this.loading && !this.scriptLoading) {
			this._ready();
		}
	},

	/* Resizing */
	updateResolution: function() {
		this._resize(this.meta.cache.width, this.meta.cache.height);
	},

	resize: function(width, height) 
	{
		var cache = this.meta.cache;
		cache.width = width || 0;
		cache.height = height || 0;

		this._resize(cache.width, cache.height);
	},

	_resize: function()
	{
		var width = this.meta.cache.width;
		var height = this.meta.cache.height;
		var containerWidth = 0;
		var containerHeight = 0;

		if(this._container === document.body) {
			containerWidth = window.innerWidth;
			containerHeight = window.innerHeight;
		}
		else {
			containerWidth = this._container.clientWidth;
			containerHeight = this._container.clientHeight;
		}

		if(width === 0) {
			width = containerWidth;
		} 
		if(height === 0) {
			height = containerHeight;
		}

		if(this._adapt) 
		{
			this.zoom = 1;
			var diffX = containerWidth - width;
			var diffY = containerHeight - height;
			if(diffX < diffY) {
				this.zoom = containerWidth / width;
			}
			else {
				this.zoom = containerHeight / height;
			}

			width *= this.zoom;
			height *= this.zoom;
		}

		width = Math.round(width);
		height = Math.round(height);		

		if(!this.canvas) { return; }

		var devicePixelRatio = window.devicePixelRatio || 1;
		var backingStoreRatio = this.ctx.webkitBackingStorePixelRatio ||
								this.ctx.mozBackingStorePixelRatio ||
								this.ctx.msBackingStorePixelRatio ||
								this.ctx.oBackingStorePixelRatio ||
								this.ctx.backingStorePixelRatio || 1;
        var ratio = devicePixelRatio / backingStoreRatio;

		this.width = Math.ceil(width * ratio);
		this.height = Math.ceil(height * ratio);
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.canvas.style.width = (width * this.scaleX) + "px";
		this.canvas.style.height = (height * this.scaleY) + "px";

		if(this._center) {
			this.canvas.style.left = Math.floor((window.innerWidth - (width * this.scaleX)) * 0.5) + "px";
			this.canvas.style.top = Math.floor((window.innerHeight - (height * this.scaleY)) * 0.5) + "px";	
		}

		this.updateImageSmoothing();
		
		this.updateOffset()
		this.onResize.emit(this, meta.Event.RESIZE);

		meta.renderer.needRender = true;
	},

	scale: function(scaleX, scaleY)
	{
		this.scaleX = scaleX || 1.0;
		this.scaleY = scaleY || this.scaleX;

		this._resize(this.meta.cache.width, this.meta.cache.height);
	},

	handleFocus: function(value)
	{
		if(this.focus === value) {
			return;
		}

		this.focus = value;

		if(this.enablePauseOnBlur) {
			this.pause = !value;
		}

		if(value) {
			this.onFocus.emit(value, meta.Event.FOCUS);
		}
		else {
			this.onBlur.emit(value, meta.Event.BLUR);
		}
	},

	handleVisibilityChange: function()
	{
		if(document[meta.device.hidden]) {
			this.handleFocus(false);
		}
		else {
			this.handleFocus(true);
		}
	},

	onFullScreenChangeCB: function()
	{
		var fullscreen = document.fullscreenElement || document.webkitFullscreenElement ||
				document.mozFullScreenElement || document.msFullscreenElement;
		meta.device.fullscreen = !!fullscreen;

		this.onFullscreen.emit(meta.device.fullscreen, meta.Event.FULLSCREEN);
	},

	onCtxLost: function() {
		console.log("(Context lost)");
	},

	onCtxRestored: function() {
		console.log("(Context restored)");
	},

	_createRenderer: function()
	{
		this.canvas = document.createElement("canvas");
		this.canvas.setAttribute("id", "meta-canvas");
		this.canvas.style.cssText = this.canvasStyle;

		meta.renderer = new meta.CanvasRenderer();	

		this.updateResolution();

		if(!this._container) {
			document.body.appendChild(this.canvas);	
		}
		else {
			this._container.appendChild(this.canvas);	
		}	
	},

	updateOffset()
	{
		this.offsetLeft = 0
		this.offsetTop = 0

		// TODO: Refactor this._container to this.parent
		const element = this._container
		if(element.offsetParent)
		{
			do {
				this.offsetLeft += element.offsetLeft
				this.offsetTop += element.offsetTop
			} while(element = element.offsetParent)
		}

		let rect = this._container.getBoundingClientRect()
		this.offsetLeft += rect.left
		this.offsetTop += rect.top
	},

	printVersion()
	{
		if(Device.supports.consoleCSS)
		{
			console.log("%c META2D v" + meta.version + " ", 
				"background: #000; color: white; font-size: 12px; padding: 2px 0 1px 0;",
				"http://meta2d.com");

			console.log("%cBrowser: %c" + Device.name + " " + Device.version + "\t",
				"font-weight: bold; padding: 2px 0 1px 0;",
				"padding: 2px 0 1px 0;");

			console.log("%cRenderer: %cCanvas ", 
				"font-weight: bold; padding: 2px 0 2px 0;", 
				"padding: 2px 0 2px 0;");				
		}
		else 
		{
			console.log("META2D v" + meta.version + " http://meta2d.com ");
			console.log("Browser: " + Device.name + " " + Device.version + "\t");
			console.log("Renderer: Canvas ");				
		}		
	},	

	/* Fullscreen */
	fullscreen: function(value)
	{
		var device = meta.device;
		if(device.fullscreen === value) { return; }

		if(value) 
		{
			if(!device.support.fullScreen) {
				console.warn("(meta.engine.fullscreen): Device does not support fullscreen mode");
				return;
			}

			console.log(device.fullScreenRequest);

			document.documentElement[device.fullScreenRequest](Element.ALLOW_KEYBOARD_INPUT);			
		}
		else {
			console.log("exit")
			document[meta.device.fullScreenExit]();
		}
	},

	toggleFullscreen: function() {
		this.fullscreen(!meta.device.fullscreen);
	},

	/* Container */
	set container(element) 
	{
		if(this._container === element) { return; }

		if(this._container) {
			this._container.removeChild(this.canvas);
		}

		if(!element) {
			this._container = document.body;
		}
		else {
			this._container = element;
		}

		if(this.canvas) {
			this._container.appendChild(this.canvas);
			this.updateResolution();	
		}
	},

	get container() { return this._container; },

	/* Image smoothing */
	updateImageSmoothing: function()
	{
		if(this.ctx.imageSmoothingEnabled) {
			this.ctx.imageSmoothingEnabled = meta.cache.imageSmoothing;
		}
		else {
			this.ctx[meta.device.vendor + "ImageSmoothingEnabled"] = meta.cache.imageSmoothing;
		}		
	},

    set imageSmoothing(value) 
    {
    	meta.cache.imageSmoothing = value;
		if(this.inited) {
			this.updateImageSmoothing();
		}
    },

    get imageSmoothing() {
		return meta.cache.imageSmoothing;
	},

	/* Cursor */
	set cursor(value) {
		this._container.style.cursor = value;
	},

	get cursor() {
		return this._container.style.cursor;
	},

	set center(value) {
		this._center = value;
		this.updateResolution();
	},

	get center() { return this._center; },

	set adapt(value) {
		this._adapt = value;
		this.updateResolution();
	},

	get adapt() { return this._adapt; },

	Flag: {
		LOADING: 1,
		INITED: 2,
		PRELOADED: 4,
		LOADED: 8,
		READY: 16
	},

	//
	onUpdate: null,
	onResize: null,
	onBlur: null,
	onFocus: null,
	onFullscreen: null,
	onDebug: null,

	//
	elementStyle: "padding:0; margin:0;",
	canvasStyle: "position:absolute; overflow:hidden; translateZ(0); " +
		"-webkit-backface-visibility:hidden; -webkit-perspective: 1000; " +
		"-webkit-touch-callout: none; -webkit-user-select: none; zoom: 1;",

	meta: meta,
	time: meta.time,

	_container: null,
	width: 0, height: 0,
	offsetLeft: 0, offsetTop: 0,
	scaleX: 1.0, scaleY: 1.0,
	zoom: 1,
	ratio: 1,

	canvas: null,
	ctx: null,

	cb: null,

	autoInit: true,
	autoMetaTags: true,	

	flags: 0,
	focus: false,
	pause: false,
	webgl: false,

	_center: false,
	_adapt: false,

	_updateLoop: null,
	_renderLoop: null,

	updateFuncs: [],
	renderFuncs: [],
	plugins: [],
	controllersReady: [],
	controllersUpdate: [],

	timers: [],
	timersRemove: [],

	fps: 0,
	_fpsCounter: 0,

	enablePauseOnBlur: true,

	enableAdaptive: true,
	unitSize: 1,
	unitRatio: 1,
	maxUnitSize: 1,
	maxUnitRatio: 1		
};
