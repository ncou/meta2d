import Node from "./Node"
import Mesh from "../graphics/Mesh"
import Texture from "../graphics/Texture"
import Engine from "../Engine"

const vertices = [
	-1, -1, 0,
	1, -1, 0,
	1, 1, 0,
	-1, 1, 0
]

const uvs = [
	0, 1,
	1, 1,
	1, 0,
	0, 0
]

const indices = [
	0, 2, 1, 0, 3, 2
]

class Sprite extends Node
{
	constructor(cfg) 
	{
		super()

		this.mesh = new Mesh({
			vertices,
			uvs,
			indices
		})

		this._material = Engine.renderer.spriteMaterial
		this._texture = null

		if(cfg) {
			this.load(cfg)
		}
	}

	load(cfg) 
	{
		for(let key in cfg) 
		{
			if(this[key] === undefined) { continue }
			
			if(key === "position") {
				this.position.fromArray(cfg.position)
			}
			else {
				this[key] = cfg[key]
			}
		}
	}

	draw() 
	{
		this._material.uniforms.albedo = this._texture
		Engine.renderer.draw(this.mesh, this._material, this.transform)
	}

	set material(material) 
	{
		if(typeof material === "string") 
		{
			const newMaterial = Engine.resource(material)
			if(!newMaterial) {
				console.warn("(Sprite.material) Could not find texture: " + material)
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

	set texture(texture) 
	{
		if(typeof texture === "string") {
			const newTexture = Engine.resource(texture)
			if(this._texture === newTexture) { return }
			this._texture = newTexture
		}
		else {
			if(this._texture === texture) { return }
			this._texture = texture
		}
	}

	get texture() {
		return this._texture
	}
}

export default Sprite
