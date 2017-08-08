
class Resources
{
	constructor() {
		this.assets = {}
		this.listeners = {}
		this.loaded = false
		this.numToLoad = 0
	}

	register(dict)
	{
		const types = this.Resource.__inherit

		for(let key in dict)
		{
			if(this.assets[key]) {
				Log.warn("ResourceManager.register", `There is already resource with ID: ${key}`)
				continue
			}

			const cfg = dict[key]
			if(!cfg.type) {
				Log.warn("ResourceManager.register", `Invalid type for key: ${key}`)
				continue
			}

			const cls = types[cfg.type]
			if(!cls) {
				Log.warn("ResourceManagerregister", `No such type registered: ${cfg.type}`)
				continue
			}

			const resource = new cls(cfg)
			resource.id = key
			this.assets[key] = resource
		}
	}

	addLoad(resource) {
		this.loaded = false
		this.numToLoad++
		resource.load()
	}

	removeLoad(resource) {
		this.numToLoad--
		if(this.numToLoad === 0) {
			this.loaded = true
		}
	}

	get(id) {
		const resource = this.assets[id]
		return resource ? resource : null
	}

	on(event, func)
	{
		const buffer = this.listeners[event]
		if(buffer) {
			buffer.push(func)
		}
		else {
			this.listeners[event] = [ func]
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

	set loaded(value)
	{
		if(this._loaded === value) { return }
		this._loaded = value

		if(value) {
			this.emit("load")
		}
		else {
			this.emit("unload")
		}
	}

	get loaded() {
		return this._loaded
	}
}

const instance = new Resources()

export default instance

// meta.class("Resource.Manager",
// {

// 	/**
// 	 * Add a resource for managing.
// 	 * @param resource {Resource.Basic} Resource to add.
// 	 * @return {Resource.Basic|null} Resource added.
// 	 */
// 	add: function(resource)
// 	{
// 		if(resource.flags & resource.Flag.ADDED) {
// 			return;
// 		}
// 		resource.flags |= resource.Flag.ADDED;

// 		// If no name is specified take it from the source.
// 		if(resource.name === "unknown" && resource.path) {
// 			resource.name = resource.tag + meta.getNameFromPath(resource.path);
// 		}

// 		var buffer = this.data[resource.type];

// 		if(buffer[resource.name])
// 		{
// 			console.warn("(Resource.Manager.add) There is already a resource(" + 
// 				meta.enumToString(Resource.Type, resource.type) + ") added with a name: " + resource.name);
// 			return null;
// 		}

// 		buffer[resource.name] = resource;

// 		this.onAdded.emit(resource, Resource.Event.ADDED);

// 		return resource;
// 	},

// 	/**
// 	 * Remove resource from the managing.
// 	 * @param resource {Resource.Basic} Resource to remove.
// 	 */
// 	remove: function(resource)
// 	{
// 		var buffer = this.data[resource.type];

// 		if(!buffer[resource.name])
// 		{
// 			console.warn("(Resource.Manager.remove) Resource(" + 
// 				meta.enumToString(Resource.Type, resource.type) + ")(" + resource.name + ") is not added to the manager.");
// 			return;
// 		}

// 		delete buffer[resource.name];

// 		resource.emit(this, Resource.Event.REMOVED);
// 		this.onRemoved.emit(resource, Resource.Event.REMOVED);
// 	},

// 	createTexture: function(name)
// 	{
// 		var texture;

// 		if(name) 
// 		{
// 			texture = this.textures[name];
// 			if(!texture) {
// 				texture = new Resource.Texture();
// 				texture.name = name;
// 			}
// 		}
// 		else {
// 			texture = new Resource.Texture();
// 		}

// 		texture._loaded = false;
// 		this.add(texture);

// 		return texture;
// 	},

// 	createAnim: function(name, frameNames, fps)
// 	{
// 		var textures = meta.resources.textures;

// 		if(textures[name]) {
// 			console.warn("(meta.createAnim) There is already texture with a name - " + name);
// 			return null;
// 		}

// 		var texture = new Resource.Texture();
// 		texture.name = name; 
// 		texture.createAnim(frameNames);
// 		texture.fps = fps || 9;
// 		meta.resources.add(texture);

// 		return texture;
// 	},

// 	createAnimEx: function(name, frameNames, path, fps)
// 	{
// 		var textures = meta.resources.textures;

// 		if(textures[name]) {
// 			console.warn("(meta.createAnimEx) There is already texture with a name - " + name);
// 			return null;
// 		}

// 		var texture = new Resource.Texture();
// 		texture.name = name; 
// 		texture.createAnimEx(frameNames, path);
// 		texture.fps = fps || 9;
// 		meta.resources.add(texture);

// 		return texture;
// 	},

// 	_updateLoading: function()
// 	{
// 		this.numToLoad--;
// 		this.onLoadingUpdate.emit(this, Resource.Event.LOADING_UPDATE);

// 		if(this.numToLoad === 0) 
// 		{
// 			var texture;
// 			for(var key in this.textures) {
// 				texture = this.textures[key];
// 				if(!texture._loaded) {
// 					console.log("(Resource.Manager.loadSuccess) Texture requested but not loaded: " + texture.name);
// 					this.remove(texture);
// 				}
// 			}

// 			this.numTotalToLoad = 0;
// 			this.loading = false;
// 			this.onLoadingEnd.emit(this, Resource.Event.LOADING_END);
// 		}		
// 	},

// 	loadFile: function(path, onSuccess)
// 	{
// 		if(!this.loading) {
// 			this.loading = true;
// 			this.onLoadingStart.emit(this, Resource.Event.LOADING_START);
// 		}

// 		this.numToLoad++;
// 		this.numTotalToLoad++;		

// 		var self = this;
// 		meta.ajax({
// 			url: path,
// 			success: function(response) 
// 			{
// 				if(onSuccess) {
// 					onSuccess(response);
// 				}
// 				self._updateLoading();
// 			},
// 			error: function() {
// 				self._updateLoading();
// 			}
// 		})
// 	},

// 	/**
// 	 * Flag texture that must be loaded.
// 	 * @param resource {Resource.Basic} Resource to load. 
// 	 */
// 	addToLoad: function(resource)
// 	{
// 		if(!this.loading) {
// 			this.loading = true;
// 			this.onLoadingStart.emit(this, Resource.Event.LOADING_START);
// 		}

// 		this.add(resource);
// 		resource.loading = true;

// 		resource.currStep = 0;
// 		this.numToLoad += resource.steps;
// 		this.numTotalToLoad += resource.steps;
// 	},

// 	/**
// 	 * Load resource to "inUse" buffer.
// 	 * @param resource {Resource.Basic}
// 	 */
// 	loadSuccess: function(resource)
// 	{		
// 		resource.currStep++;
// 		this.numLoaded++;

// 		resource.loading = false;
		
// 		this.onLoaded.emit(resource, Resource.Event.LOADED);
// 		this._updateLoading();
// 	},

// 	/**
// 	 * Remove flag that resource is loading.
// 	 * @param resource {Resource.Basic}
// 	 */
// 	loadFailed: function(resource) 
// 	{
// 		this.numLoaded += resource.steps - resource.currStep;
// 		this._updateLoading();

// 		resource.loading = false;
// 	},

// 	nextStep: function(resource) 
// 	{
// 		if(resource.currStep < resource.steps) {
// 			resource.currStep++;
// 			this.numLoaded++;
// 			this._updateLoading();
// 		}
// 	},

// 	/**
// 	 * Add resource loading into queue to guarantee synchronous loading.
// 	 * @param resource {Resource.Basic} Resource to queue.
// 	 */
// 	addToQueue: function(resource) 
// 	{
// 		if(!this._syncQueue) {
// 			this._syncQueue = [];
// 		}

// 		this._syncQueue.push(resource);
// 	},

// 	/** 
// 	 * Load next resource from queue.
// 	 */
// 	loadNextFromQueue: function() 
// 	{
// 		this.isSyncLoading = false;

// 		if(!this._syncQueue || !this._syncQueue.length) { 
// 			return; 
// 		}

// 		this._syncQueue[this._syncQueue.length - 1].forceLoad(true);
// 		this._syncQueue.pop();
// 	},

// 	/**
// 	 * Callback on adapt event.
// 	 * @param data {*} Event data.
// 	 * @param event {*} Type of the event.
// 	 */
// 	onAdapt: function(data, event)
// 	{
// 		var unitRatio = meta.unitRatio;

// 		var texture;
// 		for(var key in textures) {
// 			texture = this.textures[key];
// 			texture.unitRatio = unitRatio;
// 			texture.load();
// 		}
// 	},

// 	preloadResource: function(cls, buffer, folderPath, tag)
// 	{
// 		if(folderPath)
// 		{
// 			var slashIndex = folderPath.lastIndexOf("/");
// 			if(slashIndex !== folderPath.length - 1) {
// 				folderPath += "/";
// 			}
// 		}
// 		else {
// 			folderPath = "";
// 		}

// 		if(buffer instanceof Array)
// 		{
// 			var numResources = buffer.length;
// 			for(var i = 0; i < numResources; i++) {
// 				this._addResource(cls, buffer[i], folderPath, tag);
// 			}
// 		}
// 		else if(typeof(buffer) === "object" || typeof(buffer) === "string") {
// 			this._addResource(cls, buffer, folderPath, tag);
// 		}
// 		else {
// 			return false;
// 		}

// 		return true;
// 	},

// 	_addResource: function(cls, data, folderPath, tag)
// 	{
// 		var resource;

// 		if(typeof(data) === "object") 
// 		{
// 			if(data.path) {
// 				data.path = folderPath + data.path;
// 			}
// 			resource = new cls(data, tag);
// 		}
// 		else {
// 			resource = new cls(folderPath + data, tag);
// 		};

// 		return resource;
// 	},

// 	/**
// 	 * Load textures.
// 	 * @param buffer {Array|String} Buffer with texture sources.
// 	 * @param folderPath {String=} Path applied to texture sources.
// 	 */
// 	loadTexture: function(buffer, folderPath, tag) {
// 		this.preloadResource(Resource.Texture, buffer, folderPath, tag);
// 	},

// 	/**
// 	 * Load spritesheets. 
// 	 * @param buffer {Array|String} Buffer with sound sources.
// 	 * @param folderPath {String=} Path applied to sound sources.
// 	 */
// 	loadSpriteSheet: function(buffer, folderPath, tag) {
// 		this.preloadResource(Resource.SpriteSheet, buffer, folderPath, tag);
// 	},	

// 	/**
// 	 * Load bitmap fonts.
// 	 * @param buffer {Array|String} Buffer with sound sources.
// 	 * @param folderPath {String=} Path applied to sound sources.
// 	 */
// 	loadFont: function(buffer, folderPath, tag) {
// 		this.preloadResource(Resource.Font, buffer, folderPath, tag);
// 	},	

// 	/**
// 	 * Load sounds.
// 	 * @param buffer {Array|String} Buffer with sound sources.
// 	 * @param folderPath {String=} Path applied to sound sources.
// 	 */
// 	loadSound: function(buffer, folderPath, tag) {
// 		this.preloadResource(Resource.Sound, buffer, folderPath, tag);
// 	},

// 	/**
// 	 * Get unique id.
// 	 * @return {number} Generated unique id.
// 	 */
// 	getUniqueID: function() {
// 		return ++this._uniqueID;
// 	},

// 	//
// 	data: null,
// 	textures: null,
// 	spriteSheets: null,
// 	fonts: null,
// 	sounds: null,

// 	rootPath: "",

// 	numLoaded: 0,
// 	numToLoad: 0,
// 	numTotalToLoad: 0,

// 	_syncQueue: null,
// 	isSyncLoading: false,

// 	_uniqueID: 0,

// 	loading: false,

// 	onAdded: null,
// 	onRemoved: null,
// 	onLoaded: null,
// 	onLoadingStart: null,
// 	onLoadingEnd: null,
// 	onLoadingUpdate: null	
// });
