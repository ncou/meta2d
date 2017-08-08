import Resources from "./Resources"

function Subscriber(owner, func) {
	this.owner = owner
	this.func = func
}

class Resource 
{
	constructor(cfg) 
	{
		this.cfg = cfg || null
		this.id = null
		this.listeners = []
		this._loaded = false
		this._loading = false
	}

	failed() 
	{
		this._loaded = false
		
		this.emit("failed")
		
		this.loading = false
	}

	use(func, owner) 
	{
		this.listeners.push(new Subscriber(owner, func))

		if(!this.loaded) {
			this.loading = true
		}
	}

	unuse(func, owner)
	{
		const num = this.subscribers.length
		for(let n = 0; n < num; n++) {
			const subscriber = this.subscribers[n]
			if(subscriber.owner === owner && subscriber.func === subscriber.func) {
				this.subscribers[n] = this.subscribers[num - 1]
				this.subscribers.pop()
				break
			}
		}

		if(this.listeners.length === 0) {
			this.loaded = false
		}
	}

	emit(event)
	{
		const num = this.listeners.length
		for(let n = 0; n < num; n++) {
			const listener = this.listeners[n]
			listener.func.call(listener.owner, event, this)
		}
	}

	set loaded(value) 
	{
		const prevLoaded = this._loaded
		this._loaded = value

		if(value)
		{
			if(prevLoaded) {
				this.emit("update")
			}
			else {
				this.emit("loaded")
			}

			if(this._loading) 
			{
				this._loading = false

				Resources.removeLoad(this)
			}
		}
		else 
		{
			if(prevLoaded) {
				this.emit("unload")
			}
		}
	}

	get loaded() {
		return this._loaded
	}

	set loading(value) 
	{
		if(this._loading === value) { return }
		this._loading = value

		if(value) 
		{
			if(this._loaded) {
				this._loaded = false
				this.emit("unload")
			}

			Resources.addLoad(this)
		}
		else 
		{
			const prevLoaded = this._loaded
			this._loaded = true 

			if(prevLoaded) {
				this.emit("update")
			}
			else {
				this.emit("loaded")
			}

			Resources.removeLoad(this)
		}
	}

	get loading() {
		return this._loading
	}
}

Resources.Resource = Resource

export default Resource

// "use strict";

// meta.class("Resource.Basic", 
// {
// 	init: function(data, tag) 
// 	{
// 		this.id = meta.resources.getUniqueID();
// 		if(tag) {
// 			this.tag = tag;
// 		}	

// 		if(this.onInit) {
// 			this.onInit(data, tag);
// 		}	
// 	},

// 	onInit: null,


// 	/**
// 	 * Subscribe to resource events.
// 	 * @param owner {*} Listener object.
// 	 * @param func {Function} Listener callback function.
// 	 */
// 	subscribe: function(func, owner)
// 	{
// 		if(!this.chn) {
// 			this.chn = meta.createChannel("__res" + this.id);
// 		}

// 		return this.chn.add(func, owner);
// 	},

// 	/**
// 	 * Unsubscribe from resource events.
// 	 * @param owner {*} Listener object.
// 	 */
// 	unsubscribe: function(owner)
// 	{
// 		if(!this.chn) { return; }

// 		this.chn.remove(owner);
// 		if(this.chn.numSubs === 0) {
// 			this.chn.remove();
// 			this.chn = null;
// 		}
// 	},

// 	/**
// 	 * emit an event to onrs.
// 	 * @param data {*} Data linked with the event.
// 	 * @param event {*} Type of the event.
// 	 */
// 	emit: function(data, event)
// 	{
// 		if(this.chn) {
// 			this.chn.emit(data, event);
// 		}
// 	},

// 	set loaded(value)
// 	{
// 		if(value)
// 		{
// 			if(!this._loaded) 
// 			{
// 				this._loaded = value;
// 				this.emit(this, Resource.Event.LOADED);
// 			}
// 			else {
// 				this._loaded = value;
// 				this.emit(this, Resource.Event.CHANGED);
// 			}
// 		}
// 		else
// 		{
// 			if(this._loaded) {
// 				this._loaded = value;
// 				this.emit(this, Resource.Event.UNLOADED);
// 			}
// 		}
// 	},

// 	get loaded() { return this._loaded; },

// 	Flag: {
// 		ADDED: 8
// 	},

// 	//
// 	id: 0,
// 	flags: 0,
// 	type: Resource.Type.BASIC,
// 	name: "unknown",
// 	path: "",
// 	fullPath: "",
// 	tag: "",

// 	chn: null,

// 	_loaded: false,
// 	loading: false,
// 	used: false,

// 	steps: 1,
// 	currStep: 0
// });
