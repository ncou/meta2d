
const listeners = {};
let str_fullscreen = null;
let str_fullscreenEnabled = null;
let str_fullscreenElement = null;
let str_onfullscreenchange = null;
let str_onfullscreenerror = null;
let str_exitFullscreen = null;
let str_requestFullscreen = null;
let str_hidden = null;
let str_visibilityChange = null;

const Device = 
{
	name: "Unknown",
	version: "0",
	versionBuffer: null,
	vendor: "",
	vendors: [ "", "webkit", "moz", "ms", "o" ],
	supports: {},
	mobile: false,
	portrait: false,
	visible: true,
	audioFormats: [],

	set fullscreen(element) 
	{
		if(Device.fullscreenEnabled) {
			element[str_requestFullscreen]();
		}
		else {
			console.warn("Device cannot use fullscreen right now.");
		}
	},

	get fullscreen()
	{
		if(Device.fullscreenEnabled) {
			return document[str_fullscreen];
		}

		return false;
	},

	get fullscreenEnabled() 
	{
		if(Device.supports.fullscreen && document[str_fullscreenEnabled]) {
			return true;
		}

		return false;
	},

	get fullscreenElement()
	{
		if(!Device.fullscreenEnabled) {
			return null;
		}

		return document[str_fullscreenElement];
	},

	fullscreenExit()
	{
		if(Device.fullscreenEnabled) {
			document[str_exitFullscreen]();
		}
	},

	on(event, func)
	{
		let buffer = listeners[event];
		if(buffer) {
			buffer.push(func);
		}
		else {
			buffer = [ func ];
			listeners[event] = buffer;
		}
	},

	off(event, func)
	{
		const buffer = listeners[event];
		if(!buffer) { return; }

		const index = buffer.indexOf(func);
		if(index === -1) { return; }

		buffer[index] = buffer[buffer.length - 1];
		buffer.pop();
	}
};

export default Device;

function emit(event, arg)
{
	const buffer = listeners[event];
	if(!buffer) { return; }

	for(let n = 0; n < buffer.length; n++) {
		buffer[n](arg);
	}
}	

function load()
{
	checkBrowser();
	checkMobileAgent();
	checkCanvas();
	checkWebGL();
	checkAudioFormats();
	checkAudioAPI();
	checkPageVisibility();
	checkFullscreen();
	checkConsoleCSS();
	checkFileAPI();
	checkFileSystemAPI();

	Device.supports.onloadedmetadata = (typeof window.onloadedmetadata === "object");
	Device.supports.onkeyup = (typeof window.onkeyup === "object");
	Device.supports.onkeydown = (typeof window.onkeydown === "object");

	Device.portrait = (window.innerHeight > window.innerWidth);

	modernize();
	addEventListeners();
}

load();

function checkBrowser()
{
	const regexps = {
		"Chrome": [ /Chrome\/(\S+)/ ],
		"Firefox": [ /Firefox\/(\S+)/ ],
		"MSIE": [ /MSIE (\S+);/ ],
		"Opera": [
			/OPR\/(\S+)/,
			/Opera\/.*?Version\/(\S+)/,     /* Opera 10 */
			/Opera\/(\S+)/                  /* Opera 9 and older */
		],
		"Safari": [ /Version\/(\S+).*?Safari\// ]
	};

	const userAgent = navigator.userAgent;
	let name, currRegexp, match;
	let numElements = 2;

	for(name in regexps)
	{
		while(currRegexp = regexps[name].shift())
		{
			if(match = userAgent.match(currRegexp))
			{
				Device.version = (match[1].match(new RegExp('[^.]+(?:\.[^.]+){0,' + --numElements + '}')))[0];
				Device.name = name;

				const versionBuffer = Device.version.split(".");
				const versionBufferLength = versionBuffer.length;
				Device.versionBuffer = new Array(versionBufferLength);
				for(let n = 0; n < versionBufferLength; n++) {
					Device.versionBuffer[n] = parseInt(versionBuffer[n]);
				}

				break;
			}
		}
	}

	if(Device.versionBuffer === null || Device.name === "unknown") {
		console.warn("(Device) Could not detect browser.");
	}
	else 
	{
		if(Device.name === "Chrome" || Device.name === "Safari" || Device.name === "Opera") {
			Device.vendor = "webkit";
		}
		else if(Device.name === "Firefox") {
			Device.vendor = "moz";
		}
		else if(Device.name === "MSIE") {
			Device.vendor = "ms";
		}
	}				
}

function checkMobileAgent() {
	Device.mobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}

function checkCanvas() {
	Device.supports.canvas = !!window.CanvasRenderingContext2D;
}

function checkWebGL()
{
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

	Device.supports.webgl = !!context;
}

function checkAudioFormats()
{
	const audio = document.createElement("audio");
	if(audio.canPlayType("audio/mp4")) {
		Device.audioFormats.push("m4a");
	}
	if(audio.canPlayType("audio/ogg")) {
		Device.audioFormats.push("ogg");
	}
	if(audio.canPlayType("audio/mpeg")) {
		Device.audioFormats.push("mp3");
	}
	if(audio.canPlayType("audio/wav")) {
		Device.audioFormats.push("wav");
	}		
}

function checkAudioAPI()
{
	if(!window.AudioContext) 
	{
		window.AudioContext = window.webkitAudioContext || 
							window.mozAudioContext ||
							window.oAudioContext ||
							window.msAudioContext;
	}

	if(window.AudioContext) {
		Device.supports.audioAPI = true;
	}
}

function checkPageVisibility()
{
	if(document.hidden !== undefined) {
		str_hidden = "hidden";
		str_visibilityChange = "visibilitychange";
		Device.supports.pageVisibility = true;
	}
	else if(document[Device.vendor + "Hidden"] !== undefined) {
		str_hidden = Device.vendor + "Hidden";
		str_visibilityChange = Device.vendor + "visibilitychange";
		Device.supports.pageVisibility = true;
	}
	else {
		Device.supports.pageVisibility = false;
	}
}

function checkFullscreen()
{
	// fullscreen
	if(document.fullscreen !== undefined) {
		str_fullscreen = "fullscreen";
	}
	else if(document[Device.vendor + "IsFullscreen"] !== undefined) {
		str_fullscreen = Device.vendor + "IsFullscreen";
	}
	else if(document[Device.vendor + "Fullscreen"] !== undefined) {
		str_fullscreen = Device.vendor + "Fullscreen";
	}
	else {
		Device.supports.fullscreen = false;
		return;
	}

	Device.supports.fullscreen = true;

	// fullscreenEnabled
	if(document.fullscreenEnabled !== undefined) {
		str_fullscreenEnabled = "fullscreenEnabled";
	}
	else if(document[Device.vendor + "FullscreenEnabled"] !== undefined) {
		str_fullscreenEnabled = Device.vendor + "FullscreenEnabled";
	}

	// fullscreenElement
	if(document.fullscreenElement !== undefined) {
		str_fullscreenElement = "fullscreenElement";
	}
	else if(document[Device.vendor + "FullscreenElement"] !== undefined) {
		str_fullscreenElement = Device.vendor + "FullscreenElement";
	}

	// exitFullscreen
	if(document.exitFullscreen !== undefined) {
		str_exitFullscreen = "exitFullscreen";
	}
	else if(document[Device.vendor + "ExitFullscreen"] !== undefined) {
		str_exitFullscreen = Device.vendor + "ExitFullscreen";
	}

	// requestFullscreen
	if(Element.prototype.requestFullscreen !== undefined) {
		str_requestFullscreen = "requestFullscreen";
	}
	else if(Element.prototype[Device.vendor + "RequestFullscreen"] !== undefined) {
		str_requestFullscreen = Device.vendor + "RequestFullscreen";
	}

	// onfullscreenchange
	if(document.onfullscreenchange !== undefined) {
		str_onfullscreenchange = "fullscreenchange";
	}
	else if(document["on" + Device.vendor + "fullscreenchange"] !== undefined) {
		str_onfullscreenchange = Device.vendor + "fullscreenchange";
	}

	// onfullscreenerror
	if(document.onfullscreenerror !== undefined) {
		str_onfullscreenerror = "fullscreenerror";
	}
	else if(document["on" + Device.vendor + "fullscreenerror"] !== undefined) {
		str_onfullscreenerror = Device.vendor + "fullscreenerror";
	}	
}

function checkConsoleCSS() 
{
	if(!Device.mobile && (Device.name === "Chrome" || Device.name === "Opera")) {
		Device.supports.consoleCSS = true;
	}
	else {
		Device.supports.consoleCSS = false;
	}		
}

function checkFileAPI() 
{
	if(window.File && window.FileReader && window.FileList && window.Blob) {
		Device.supports.fileAPI = true;
	}
	else {
		Device.supports.fileAPI = false;
	}
}

function checkFileSystemAPI() 
{
	if(!window.requestFileSystem) 
	{
		window.requestFileSystem = window.webkitRequestFileSystem || 
			window.mozRequestFileSystem ||
			window.oRequestFileSystem ||
			window.msRequestFileSystem;
	}

	if(window.requestFileSystem) {
		Device.supports.fileSystemAPI = true;
	}
}

function modernize()
{
	if(!Number.MAX_SAFE_INTEGER) {
		Number.MAX_SAFE_INTEGER = 9007199254740991;
	}

	supportConsole();
	supportRequestAnimFrame();
	supportPerformanceNow();
}

function supportConsole()
{
	if(!window.console) 
	{
		window.console = {
			log: function log() {},
			warn: function warn() {},
			error: function error() {}
		};
	}
}

function supportRequestAnimFrame()
{
	if(!window.requestAnimationFrame)
	{
		window.requestAnimationFrame = (function()
		{
			return window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||

				function(callback, element) {
					window.setTimeout(callback, 1000 / 60);
				};
		})();
	}
}

function supportPerformanceNow()
{
	if(window.performance === undefined) {
		window.performance = {};
	}

	if(window.performance.now === undefined) {
		window.performance.now = Date.now;
	}
}

function addEventListeners()
{
	window.addEventListener("resize", onResize, false);
	window.addEventListener("orientationchange", onOrientationChange, false);	

	if(Device.supports.pageVisibility) {
		Device.visible = !document[str_hidden];
		document.addEventListener(str_visibilityChange, onVisibilityChange);
	}
	else {
		window.addEventListener("focus", onFocus);
		window.addEventListener("blur", onBlur);
	}

	if(Device.supports.fullscreen) {
		document.addEventListener(str_onfullscreenChange, onFullscreenChange);
		document.addEventListener(str_onfullscreenerror, onFullscreenError);
	}
}

function onResize(domEvent)
{
	emit("resize", null);

	if(window.innerHeight > window.innerWidth) 
	{
		if(!Device.portrait) {
			Device.portrait = true;
			emit("portrait", true);
		}
	}
	else if(Device.portrait) {
		Device.portrait = false;
		emit("portrait", false);
	}
}

function onOrientationChange(domEvent)
{
	emit("resize", null);

	if(window.innerHeight > window.innerWidth) {
		Device.portrait = true;
		emit("portrait", true);
	}
	else {
		Device.portrait = false;
		emit("portrait", false);
	}
}

function onFocus(domEvent) {
	Device.visible = true;
	emit("visibile", true);
}

function onBlur(domEvent) {
	Device.visible = false;
	emit("visibile", false);
}

function onVisibilityChange(domEvent) {
	Device.visible = !document[str_hidden];
	emit("visibile", Device.visible);
}

function onFullscreenChange(domEvent) {
	emit("fullscreen", Device.fullscreenElement);
}

function onFullscreenError(domEvent) {
	console.error("Fullscreen denied.");
}
