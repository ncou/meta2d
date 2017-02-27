import Material from "./Material"

export default class ReflectionMaterial extends Material
{
	constructor(cfg) {
		super(cfg)
	}

	load(cfg) 
	{
		cfg.vertexShader = cfg.vertexShader || "reflection-vert"
		cfg.fragmentShader = cfg.fragmentShader || "reflection-frag"
		super.load(cfg)
	}
}
