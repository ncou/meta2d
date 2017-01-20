import Material from "./Material";
import ResourceManager from "../resources/ResourceManager";

ResourceManager.registerType(DebugMaterial);

const params = {
	vertexShader: "debug-vert",
	fragmentShader: "debug-frag"
};

export default class DebugMaterial extends Material
{
	constructor() {
		super(params);
	}
}
