import Node from "./Node"

class Light extends Node
{
	constructor(cfg) 
	{
		
		if(cfg) {
			this.load(cfg)
		}
	}

	load() {

	}
}

export default Light