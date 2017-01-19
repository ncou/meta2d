import Material from "./Material";
import ResourceManager from "../resources/ResourceManager";

ResourceManager.registerType(BasicMaterial);

const params = {
	vertexShader: "basic-vert",
	fragmentShader: "basic-frag"
};

export default class BasicMaterial extends Material
{
	constructor() {
		super(params);
	}
}
