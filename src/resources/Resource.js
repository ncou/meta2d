
function Subscriber(owner, func)
{
	this.owner = owner;
	this.func = func;
}

export default class Resource
{
	constructor(cfg) 
	{
		this.id = null;
		this.subscribers = [];
		this._loaded = false;

		if(cfg) {
			this.load(cfg);
		}
	}

	subscribe(owner, func) {
		this.subscribers.push(new Subscriber(owner, func));
	}

	unsubscribe(owner, func)
	{
		const num = this.subscribers.length;
		for(let n = 0; n < num; n++) {
			const subscriber = this.subscribers[n];
			if(subscriber.owner === owner && subscriber.func === subscriber.func) {
				this.subscribers[n] = this.subscribers[num - 1];
				this.subscribers.pop();
				break;
			}
		}
	}

	emit(event)
	{
		const num = this.subscribers.length;
		for(let n = 0; n < num; n++) {
			const subscriber = this.subscribers[n];
			subscriber.func.call(subscriber.owner, event, this);
		}
	}

	set loaded(value) 
	{
		if(this._loaded === value) { return; }
		this._loaded = value;

		if(value) 
		{
			if(this._loaded) {
				this.emit("update");
			}
			else {
				this.emit("load");
			}
		}
		else {
			this.emit("unload");
		}
	}

	get loaded() {
		return this._loaded;
	}
}
