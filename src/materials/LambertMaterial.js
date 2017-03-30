import Material from "./Material"

export default class LambertMaterial extends Material
{
	constructor(cfg) {
		super(cfg || {})
	}

	load(cfg) {
		cfg.vertexShader = cfg.vertexShader || "lambert-vert"
		cfg.fragmentShader = cfg.fragmentShader || "lambert-frag"
		super.load(cfg)
	}
}
