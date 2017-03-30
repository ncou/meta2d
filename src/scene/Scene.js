import Node from "./Node"
import Light from "./Light"
import Camera from "../camera/Camera"
import Engine from "../Engine"

class Scene
{
	constructor()
	{
		this.nodes = []
		this.lights = []
		this.scenes = []

		this.camera = new Camera()
		this.enabled = false
	}

	load(data)
	{
		if(!data) { return }

		const types = Node.__inherit

		for(let key in data) 
		{
			const item = data[key]

			const cls = types[item.type]
			if(!cls) {
				console.warn(`(Scene.load) Invalid item(${id}) type: ${item.type}`)
				continue
			}

			const node = new cls(item)
			this._add(node)
		}
	}

	add(node)
	{
		if(node.added) { return }
		node.added = true
		
		this.__add(node)
	}

	_add(node) 
	{
		this.nodes.push(node)

		if(node instanceof Light) {
			this.lights.push(node)
		}
	}

	remove()
	{

	}

	set enable(value)
	{
		if(this.enabled === value) { return }
		this.enabled = value

		if(value) {
			Engine.camera = this.camera
		}
		else {
			Engine.camera = null
		}
	}

	get enable() {
		return this.enabled
	}
}

export default Scene