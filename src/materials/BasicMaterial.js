import Material from "./Material"

export default class BasicMaterial extends Material
{
	constructor(cfg) {
		super(cfg)
	}

	load(cfg) {
		cfg.vertexShader = cfg.vertexShader || "basic-vert"
		cfg.fragmentShader = cfg.fragmentShader || "basic-frag"
		super.load(cfg)
	}
}
