import Material from "./Material"

export default class DebugMaterial extends Material
{
	constructor(cfg) {
		super(cfg)
	}

	load(cfg) {
		cfg.vertexShader = cfg.vertexShader || "debug-vert"
		cfg.fragmentShader = cfg.fragmentShader || "debug-frag"
		super.load(cfg)
	}
}
