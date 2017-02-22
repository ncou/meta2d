import Resource from "./Resource"

export default class ResourceManager
{
	constructor()
	{
		this.map = {};
		this.listeners = {};
		this.loading = false;
		this.loadingCfg = false;
		this.loaded = true;
		this.numToLoad = 0;
	}

	load(cfg)
	{
		if(!cfg) { return; }

		this.loading = true;
		this.loadingCfg = true;
		this.loaded = false;

		register(this, cfg);
		load(this, cfg);
	
		this.loadingCfg = false;

		if(this.numToLoad === 0) {
			this.loading = false;
			this.loaded = true;
		}
	}

	add(resource) 
	{
		if(!resource) {
			console.warn("(ResourceManager.add) Invalid resource passed");
			return null;
		}

		if(!resource.id) {
			console.warn("(ResourceManager.add) Invalid resource id");
			return null;			
		}

		if(this.map[resource.id]) {
			console.warn("(ResourceManager.add) There is already resource with such id: " + resource.id);
			return null;				
		}

		this.map[resource.id] = resource;

		return resource;
	}

	on(event, func) 
	{
		let buffer = this.listeners[event];
		if(!buffer) {
			buffer = [ func ];
			this.listeners[event] = buffer;
		}
		else {
			buffer.push(func);
		}
	}

	off(event, func)
	{
		let buffer = this.listeners[event];
		if(!buffer) {
			console.error("(ResourceManager.off) No listeners found for event: " + event);
			return;
		}

		const index = buffer.indexOf(func);
		if(index === -1) {
			console.error("(ResourceManager.off) No such listener found for event: " + event);
			return;
		}

		buffer.splice(index, 1);
	}

	emit(event)
	{
		const buffer = this.listeners[event];
		if(!buffer) {
			return;
		}

		for(let n = 0; n < buffer.length; n++) {
			buffer[n](event, this);
		}
	}

	addLoad(resource) {
		this.numToLoad++
		console.log("addLoad", resource.id, this.numToLoad)
	}

	removeLoad(resource)
	{
		this.numToLoad--;
		console.log("removeLoad", resource.id, this.numToLoad)
		
		if(this.numToLoad < 0) {
			console.error("(ResourceManager.handleResourceEvent) Negative `numToLoad` value - this should not happen");
		}

		if(this.numToLoad === 0 && !this.loadingCfg) 
		{
			this.loading = false;
			this.loaded = true;
		}
	}

	set loaded(value) 
	{
		if(this._loaded === value) { return; }
		this._loaded = value;

		if(value) {
			this.emit("load");
		}
		else {
			this.emit("unload");
		}
	}

	get loaded() {
		return this._loaded;
	}
}

const register = function(mgr, cfg)
{
	const types = Resource.__inherit
	const map = mgr.map

	for(let key in cfg)
	{
		if(map[key]) {
			console.warn("(ResourceManager::register) There is already resource with ID: " + key);
			continue;
		}

		const resourceCfg = cfg[key];
		if(!resourceCfg.type) {
			cfg[key] = null;
			console.warn("(ResourceManager::register) Invalid type for key: " + key);
			continue;
		}

		const cls = types[resourceCfg.type]
		if(!cls) {
			console.warn("(ResourceManager::register) No such type registered: " + resourceCfg.type);
			continue;
		}

		const resource = new cls()
		resource.id = key
		map[key] = resource
	}	
}

const load = function(mgr, cfg)
{
	const map = mgr.map;

	for(let key in cfg)
	{
		const resourceCfg = cfg[key];
		if(!resourceCfg) { continue; }

		const resource = map[key]
		if(!resource) {
			console.warn(`(ResourceManager::load) No resource "${key}" registered with type "${resourceCfg.type}`);
			continue;
		}

		resource.load(resourceCfg);
	}
}
