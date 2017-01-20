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
	}
}
