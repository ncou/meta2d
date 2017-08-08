import Resource from "./Resource"
import Log from "../Log"

class Texture extends Resource
{
	constructor(cfg) {
		super(cfg)
		this.clear()
	}

	clear() {
		this.image = null
		this.ptr = null
		this.x = 0
		this.y = 0
		this._width = 0
		this._height = 0
	}

	load()
	{
		if(!this.cfg) { return }
		if(!this.cfg.path) {
			Log.warn("Texture.load", `Invalid path passed: ${cfg}`)
			return
		}

		this.loading = true

		const image = new Image()
		image.onload = () => {
			this.update(image)
		}
		image.onerror = () => {
			this.update(null)
			this.failed()
		}
		image.src = this.cfg.path
	}

	update(image)
	{
		this.image = image

		if(image) {
			this._width = image.width
			this._height = image.height
		}
		else {
			this._width = 0
			this._height = 0
		}

		this.loaded = true
	}

	draw(ctx, x, y)
	{
		if(!this.ptr) {
			ctx.drawImage(this.image, x, y)
		}
		else 
		{
			ctx.drawImage(this.ptr.image, 
				this.x, this.y, this.width, this.height, 
				x, y, this.width, this.height)
		}
	}

	get width() {
		return this._width
	}

	get height() {
		return this._height
	}
}

export default Texture

// meta.class("Resource.Texture", "Resource.Basic", 
// {
// 	/**
// 	 * Constructor.
// 	 * Will generate by default texture based on what rendering is used.
// 	 * @param path {String=} Texture path.
// 	 * @function
// 	 */
// 	onInit: function(data, tag)
// 	{
// 		this.generate();

// 		// If argument is string threat as path:
// 		if(data instanceof File) {
// 			this.loadFile(data);
// 		}
// 		else
// 		{
// 			var type = typeof(data);
// 			if(type === "string") {
// 				this.load(data);
// 			}
// 			else if(type === "object") 
// 			{
// 				for(var key in data) {
// 					this[key] = data[key];
// 				}

// 				if(data.frames) {
// 					this.animated = true;
// 				}
// 				else if(this.framesX > 1 || this.framesY > 1) {
// 					this.frames = this.framesX * this.framesY;
// 					this.animated = true;
// 				}

// 				if(this.path) {
// 					this.load(this.path);
// 				}
// 			}
// 		}
// 	},

// 	remove: function() {
// 		meta.resources.remove(this);
// 	},

// 	/**
// 	 * Generate image object depending from type.
// 	 * @function
// 	 */
// 	generate: function()
// 	{
// 		this.loaded = true;

// 		this.canvas = document.createElement("canvas");
// 		this.canvas.width = this.trueFullWidth;
// 		this.canvas.height = this.trueFullHeight;

// 		this.ctx = this.canvas.getContext("2d");
// 	},

// 	/**
// 	 * Load texture from the source.
// 	 * @param path {string} Source of texture to load from.
// 	 * @function
// 	 */
// 	load: function(path)
// 	{
// 		if(this.loading) { return; }
// 		this.loaded = false;

// 		if(!path) { return; }
// 		this.path = path;

// 		// Check if path is missing it's extension:
// 		var wildCardIndex = this.path.lastIndexOf(".");
// 		if(wildCardIndex === -1 || this.path.length - wildCardIndex > 4) {
// 			this.path += ".png";
// 		}

// 		if(meta.cache.currResolution) {
// 			this.fullPath = meta.resources.rootPath + meta.cache.currResolution.path + this.path;
// 		}
// 		else {
// 			this.fullPath = meta.resources.rootPath + this.path;
// 		}

// 		var self = this;
// 		var img = new Image();

// 		img.onload = function()
// 		{
// 			// Check if still is relevant:
// 			//if(!self.loading) { return; }

// 			if(!img.complete) {
// 				console.warn("(Resource.Texture.load) Could not load texture from - " + img.src);
// 				meta.resources.loadFailed(self);
// 				return;
// 			}

// 			self.createFromImg(img);
// 			meta.resources.loadSuccess(self);

// 			// if(this.path.indexOf("blob:") !== 0) {
// 			// 	console.log("revoke");
// 			// 	window.URL.revokeObjectURL(this.path);
// 			// }
// 		};

// 		img.onerror = function(event) {
// 			meta.resources.loadFailed(self);
// 			self.emit(this, Resource.Event.FAILED);
// 		};		

// 		img.src = this.fullPath;

// 		meta.resources.addToLoad(this);

// 		// var self = this;
// 		// var img = new Image();

// 		// if(meta.engine.isWebGL) {
// 		// 	img.crossOrigin = "anonymous";
// 		// }


// 		// if(this._isLoaded) {
// 		// 	this._isReloading = true;
// 		// }

// 		// img.src = this.fullPath;
// 	},

// 	loadFile: function(file)
// 	{
// 		if(this.loading) { return; }
// 		this.loaded = false;

// 		this.path = window.URL.createObjectURL(file);
// 		this.fullPath = this.path;

// 		var self = this;
// 		var img = new Image();

// 		img.onload = function()
// 		{
// 			if(!img.complete) {
// 				console.warn("(Resource.Texture.load) Could not load texture from - " + img.src);
// 				meta.resources.loadFailed(self);
// 				return;
// 			}

// 			self.createFromImg(img);
// 			meta.resources.loadSuccess(self);

// 			window.URL.revokeObjectURL(self.path);
// 			console.log(self.name)
// 		};

// 		img.onerror = function(event) {
// 			meta.resources.loadFailed(self);
// 			self.emit(this, Resource.Event.FAILED);
// 		};		

// 		img.src = this.fullPath;

// 		meta.resources.addToLoad(this);
// 	},

// 	/**
// 	 * Create texture from DOM Image object.
// 	 * @param img {Image} Image file.
// 	 * @function
// 	 */
// 	createFromImg: function(img)
// 	{
// 		if(this._loaded) {
// 			this.clear();
// 		}

// 		this.resizeSilently(img.width, img.height);
// 		this.ctx.drawImage(img, 0, 0);
// 		this.unitRatio = meta.unitRatio;

// 		this._reloading = false;
// 		this.loaded = true;
// 	},

// 	calcFrame: function()
// 	{
// 		if(this.animated) 
// 		{
// 			if(this.frames > 1 && (this.framesX === 1 && this.framesY === 1)) {
// 				this.framesX = this.trueFullWidth / this.frameWidth;
// 				this.framesY = this.trueFullHeight / this.frameHeight;
// 			}
// 			else {
// 				this.frameWidth = this.trueFullWidth / this.framesX;
// 				this.frameHeight = this.trueFullHeight / this.framesY;
// 			}
// 		}
// 		else {
// 			this.frameWidth = this.trueFullWidth;
// 			this.frameHeight = this.trueFullHeight;
// 		}
// 	},

// 	_createCachedImg: function()
// 	{
// 		if(this._cachedImg) { return; }

// 		this._cachedImg = document.createElement("canvas");
// 		this._cachedImg.width = this.trueFullWidth;
// 		this._cachedImg.height = this.trueFullHeight;
// 		this._cachedCtx = this._cachedImg.getContext("2d");
// 	},

// 	convertToAnim: function(frameWidth, frameHeight, frames, fps)
// 	{
// 		this.frameWidth = frameWidth;
// 		this.frameHeight = frameHeight;	
// 		this.frames = frames;
// 		this.fps = fps || 9;
// 		this.animated = true;

// 		if(this._loaded) {
// 			this.calcFrame();
// 		}
// 	},

// 	createAnim: function(frameNames)
// 	{
// 		this._numToLoad = 0;

// 		var texture, 
// 			textureName, 
// 			wildCard,
// 			wildCardIndex;
// 		var textures = meta.resources.textures;

// 		var num = frameNames.length;
// 		this.frameData = new Array(num);
// 		this.frames = num;

// 		for(var n = 0; n < num; n++) 
// 		{
// 			textureName = frameNames[n];

// 			wildCardIndex = textureName.lastIndexOf(".");
// 			if(wildCardIndex !== -1) {
// 				wildCard = textureName.substr(wildCard + 1);
// 				textureName = textureName.substr(0, wildCardIndex);
// 			}
// 			else {
// 				wildCard = "";
// 			}

// 			texture = textures[textureName];
// 			if(!texture) {
// 			    texture = meta.resources.createTexture(textureName);
// 			}

// 			if(!texture._loaded) {
// 				texture.subscribe(this._handleTextureFrameEvent, this);
// 				this._numToLoad++;
// 			}

// 			this.frameData[n] = new this.Frame(texture, 0, 0);
// 		}

// 		if(this._numToLoad === 0) {
// 			this._prepareFromFrameData();
// 		}
// 	},

// 	createAnimEx: function(frameNames, path)
// 	{
// 		this._numToLoad = 0;

// 		var texture, 
// 			textureName, 
// 			wildCard,
// 			wildCardIndex;
// 		var textures = meta.resources.textures;

// 		var num = frameNames.length;
// 		this.frameData = new Array(num);
// 		this.frames = num;

// 		for(var n = 0; n < num; n++) 
// 		{
// 			textureName = frameNames[n];

// 			wildCardIndex = textureName.lastIndexOf(".");
// 			if(wildCardIndex !== -1) {
// 				wildCard = textureName.substr(wildCard + 1);
// 				textureName = textureName.substr(0, wildCardIndex);
// 			}
// 			else {
// 				wildCard = "";
// 			}

// 			texture = textures[textureName];
// 			if(!texture) {
// 			    texture = new Resource.Texture(path + textureName + wildCard);
// 			}

// 			if(!texture._loaded) {
// 				this._numToLoad++;
// 				texture.subscribe(this._handleTextureFrameEvent, this);
// 			}

// 			this.frameData[n] = new this.Frame(texture, 0, 0);
// 		}

// 		if(this._numToLoad === 0) {
// 			this._prepareFromFrameData();
// 		}
// 	},

// 	_prepareFromFrameData: function()
// 	{
// 		var frameTexture = this.frameData[0].texture;
// 		this.width = frameTexture.width;
// 		this.height = frameTexture.height;

// 		this.loaded = true;
// 	},

// 	_handleTextureFrameEvent: function(data, eventType)
// 	{
// 		if(eventType === Resource.Event.LOADED) {
// 			this._numToLoad--;
// 			data.unsubscribe(this);
// 		}

// 		if(this._numToLoad === 0) {
// 			this._prepareFromFrameData();
// 		}
// 	},	

// 	/**
// 	 * Resize texture.
// 	 * @param width {Number} Width of texture.
// 	 * @param height {Number} Height of texture.
// 	 * @function
// 	 */
// 	resize: function(width, height)
// 	{
// 		if(this.trueFullWidth === width && 
// 		   this.trueFullHeight === height) { return; }

// 		this.resizeSilently(width, height);

// 		this.loaded = true;
// 	},

// 	resizeSilently: function(width, height) 
// 	{
// 		if(this.trueFullWidth === width && this.trueFullHeight === height) { 
// 			return; 
// 		}

// 		this.flags |= this.TextureFlag.RESIZED;

// 		this.trueFullWidth = width;
// 		this.trueFullHeight = height;

// 		this.calcFrame();

// 		var unitRatio = meta.engine.unitRatio;
// 		this.width = (this.frameWidth * unitRatio) + 0.5 | 0;
// 		this.height = (this.frameHeight * unitRatio) + 0.5 | 0;
// 		this.fullWidth = (this.trueFullWidth * unitRatio) + 0.5 | 0;
// 		this.fullHeight = (this.trueFullHeight * unitRatio) + 0.5 | 0;	
// 		this.halfWidth = this.width * 0.5;
// 		this.halfHeight = this.height * 0.5;	

// 		if(this._loaded)
// 		{
// 			if(this.canvas.width > 1 && this.canvas.height > 1)
// 			{
// 				this._tmpImg.width = this.canvas.width;
// 				this._tmpImg.height = this.canvas.height;
// 				this._tmpCtx.drawImage(this.canvas, 0, 0);

// 				this.canvas.width = this.trueFullWidth;
// 				this.canvas.height = this.trueFullHeight;
// 				this.ctx.drawImage(this._tmpImg, 0, 0);
// 			}
// 			else {
// 				this.canvas.width = this.trueFullWidth;
// 				this.canvas.height = this.trueFullHeight;					
// 			}
// 		}
// 		else {
// 			this.canvas.width = this.trueFullWidth;
// 			this.canvas.height = this.trueFullHeight;
// 		}
// 	},

// 	upResize: function(width, height)
// 	{
// 		if(width < this.trueFullWidth) {
// 			width = this.trueFullWidth;
// 		}
// 		if(height < this.trueFullHeight) {
// 			height = this.trueFullHeight;
// 		}

// 		this.resize(width, height);
// 	},


// 	/**
// 	 * Draw texture onto context.
// 	 * @param ctx {*} Context to draw on.
// 	 * @param x {Number} Offset on x axis from left.
// 	 * @param y {Number} Offset on y axis from top.
// 	 * @function
// 	 */


// 	/**
// 	 * Draw frame from the texture.
// 	 * @param ctx {*} Context to draw on.
// 	 * @param x {Number} Offset on x axis from left.
// 	 * @param y {Number} Offset on y axis from top.
// 	 * @param frame {Number} Frame to draw.
// 	 * @function
// 	 */
// 	drawFrame: function(ctx, x, y, frame)
// 	{
// 		if(this.frameData) {
// 			this.frameData[frame].texture.draw(ctx, x, y);
// 		}
// 		else
// 		{
// 			ctx.drawImage(this.canvas,
// 				(this.frameWidth * (frame % this.framesX)),
// 				(this.frameHeight * Math.floor(frame / this.framesX)),
// 				this.frameWidth, this.frameHeight, x, y, this.frameWidth, this.frameHeight);
// 		}
// 	},

// 	/**
// 	 * Clear the texture.
// 	 * @function
// 	 */
// 	clear: function() {
// 		this.ctx.clearRect(0, 0, this.trueFullWidth, this.trueFullHeight);
// 	},

// 	/**
// 	 * Draw over texture
// 	 */
// 	drawOver: function(texture, x, y) 
// 	{
// 		if(!texture) {
// 			console.warn("(Resource.Texture.drawOver) No texture specified.");
// 			return;
// 		}

// 		x = x || 0;
// 		y = y || 0;

// 		if(typeof(texture) === "string") 
// 		{
// 			var obj = meta.resources.textures[texture];
// 			if(!obj) {
// 				console.warn("(Resource.Texture.drawOver) No such texture with name - " + texture);
// 				return;
// 			}
// 			texture = obj;	
// 		}

// 		if(texture.textureType === Resource.TextureType.WEBGL) 
// 		{
// 			if(texture._canvasCache) {
// 				texture = texture._canvasCache;
// 			}
// 			else
// 			{
// 				texture._canvasCache = new Resource.Texture(Resource.TextureType.CANVAS, texture.path);
// 				texture._canvasCache.load();
// 				texture = texture._canvasCache;

// 				this._loadCache = { name: "drawOver", texture: texture, x: x, y: y };
// 				this.loaded = false;
// 				texture.subscribe(this.onTextureCacheEvent, this);
// 				return;	
// 			}		
// 		}

// 		var ctx = this.ctx;
// 		if(this.textureType) {
// 			this._createCachedImg();
// 			ctx = this._cachedCtx;
// 		}

// 		ctx.drawImage(texture.image, x, y);

// 		if(this.textureType) {
// 			var gl = meta.ctx;
// 			gl.bindTexture(gl.TEXTURE_2D, this.image);
// 			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._cachedImg);
// 		}

// 		this.loaded = true;		
// 	},


// 	/**
// 	 * Generate alpha mask from texture.
// 	 * @returns {Resource.Texture} Generated alpha mask texture.
// 	 */
// 	generateAlphaMask: function()
// 	{
// 		if(!this._loaded) {
// 			console.warn("(Resource.Texture.generateMask): Texture is not loaded yet.");
// 			return;
// 		}

// 		if(this.textureType !== 0) {
// 			console.warn("([)Resource.Texture.generateMask): Only canvas textures are supported currently.");
// 			return;
// 		}

// 		var alphaMask = new Resource.Texture(Resource.TextureType.CANVAS);
// 		alphaMask.resize(this.trueFullWidth, this.trueFullHeight);

// 		var imgData = this.ctx.getImageData(0, 0, this.trueFullWidth, this.trueFullHeight);
// 		var data = imgData.data;
// 		var numBytes = data.length;

// 		for(var i = 0; i < numBytes; i += 4) {
// 			data[i] = 255;
// 			data[i + 1] = 255;
// 			data[i + 2] = 255;
// 		}

// 		alphaMask.ctx.putImageData(imgData, 0, 0);
// 		alphaMask.loaded = true;

// 		return alphaMask;
// 	},


// 	onTextureCacheEvent: function(data, event)
// 	{
// 		if(event === Resource.Event.LOADED) 
// 		{
// 			data.unsubscribe(this);
// 			if(this._loadCache.name === "drawOver") {
// 				this.drawOver(this._loadCache.texture, this._loadCache.x, this._loadCache.y);
// 			}
// 			else {
// 				this[this._loadCache.name](this._loadCache.data);
// 			}
// 			this._loadCache = null;
// 		}
// 	},

// 	offset: function(x, y) {
// 		this.offsetX = x;
// 		this.offsetY = y;
// 		if(this._loaded) {
// 			this.emit(this, Resource.Event.CHANGED);
// 		}		
// 	},

// 	getData: function() {
// 		return this.ctx.getImageData(0, 0, this.frameWidth, this.frameHeight).data;
// 	},

// 	getPixelAt: function(x, y) {
// 		return this.ctx.getImageData(x, y, 1, 1).data;
// 	},

// 	applyCanvas: function(canvas) {
// 		this.canvas = canvas;
// 		this.ctx = canvas.getContext("2d");
// 		this.resize(canvas.width, canvas.height);
// 	},

// 	//
// 	TextureFlag: {
// 		RESIZED: 1
// 	},

// 	Frame: function(texture, x, y)
// 	{
// 		this.texture = texture;
// 		this.x = x;
// 		this.y = y;
// 	},

// 	//
// 	type: Resource.Type.TEXTURE,

// 	ptr: null,
// 	canvas: null,
// 	ctx: null,

// 	flags: 0,

// 	x: 0, y: 0,
// 	width: 0, height: 0,
// 	_width: 0, _height: 0,
// 	fullWidth: 0, fullHeight: 0,
// 	trueFullWidth: 0, trueFullHeight: 0,
// 	_widthRatio: 0, _heightRatio: 0,
// 	offsetX: 0, offsetY: 0,
// 	unitRatio: 1,

// 	fps: 9,
// 	frames: 1,
// 	framesX: 1,
// 	framesY: 1,
// 	frameData: null,

// 	reloading: false,

// 	_tmpImg: null,
// 	_tmpCtx: null,
// 	_cachedImg: null,
// 	_cachedCtx: null,
// 	_numToLoad: 0,

// 	_loadCache: null,
// 	_canvasCache: null
// });

// Resource.Texture.prototype._tmpImg = document.createElement("canvas");
// Resource.Texture.prototype._tmpCtx = Resource.Texture.prototype._tmpImg.getContext("2d");

