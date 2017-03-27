import Node from "./Node"
import Mesh from "../graphics/Mesh"
import Texture from "../graphics/Texture"
import Engine from "../Engine"

class Geometry extends Node
{
	constructor(mesh, material) 
	{
		this._material = null

		this.mesh = mesh
		this.material = material

		super()
	}

	draw() {
		Engine.renderer.draw(this.mesh, this._material, this.transform)
	}

	set material(material) 
	{
		if(typeof material === "string") 
		{
			const newMaterial = Engine.resource(material)
			if(!newMaterial) {
				console.warn("(Geometry.material) Could not find texture: " + material)
			}
			
			this._material = newMaterial
		}
		else {
			this._material = material
		}
	}

	get material() {
		return this._material
	}
}

export default Geometry
