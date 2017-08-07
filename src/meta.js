"use strict";

window.meta = 
{
	version: "0.84",

	device: null,
	resources: null,
	renderer: null,
	camera: null,
	input: null,
	physics: null,
	steering: null,
	channels: [],
	modules: {},

	loading: null,
	preloading: null,

	time: {
		delta: 0,
		deltaF: 0,
		maxDelta: 250,
		scale: 1.0,
		curr: 0,
		fps: 0,
		current: 0,
		update: 0,
		accumulator: 0.0,
		frameIndex: 0,
		updateFreq: 1000 / 10
	},

	cache: 
	{
		width: 0, height: 0,

		metaTagsAdded: false,
		timerIndex: 0,

		view: null,
		views: {},

		scripts: null,
		pendingScripts: null, // IE<10
		numScriptsToLoad: 0,
		
		resolutions: null,
		currResolution: null,
		imageSmoothing: true,

		infoView: null
	},

	set debug(value) 
	{
		if(this.cache.debug === value) { return; }
		this.cache.debug = value;

		if(value) {
			meta.emit(meta.Event.DEBUG, value, meta.Event.DEBUG);
			meta.debugger.load();
		}
		else {
			meta.emit(meta.Event.DEBUG, value, meta.Event.DEBUG);
			meta.debugger.unload();
		}
	},

	get debug() { 
		return this.cache.debug; 
	}
}
