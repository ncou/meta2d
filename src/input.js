
export default class Input
{
	constructor()
	{
		this.listeners = [];

		this.prevX = 0;
		this.prevY = 0;
	}

	add(obj)
	{
		this.listeners.push(obj)
	}

	remove(obj)
	{

	}
}
