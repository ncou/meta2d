import Engine from "../Engine";
import Material from "./Material";
import ResourceManager from "../resources/ResourceManager";

ResourceManager.registerType(TextureMaterial);

const params = {
	vertexShader: "texture-vert",
	fragmentShader: "texture-frag"
};

export default class TextureMaterial extends Material
{
	constructor(uniforms) 
	{
		super(params);

		if(uniforms) {
			this.uniforms = uniforms;
		}
	}

	set map(texture)
	{
		if(typeof texture === "string") {
			const textureName = texture;
			texture = Engine.ctx.getResource(textureName);
			if(!texture) {
				console.warn("(TextureMaterial.map) No such texture found: " + textureName);
			}
		}

		this.uniforms.map = texture;
	}

	get map() {
		return this.uniforms.map;
	}
}
