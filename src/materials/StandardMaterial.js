import Material from "./Material"

export default class StandardMaterial extends Material
{
	constructor(cfg) {
		super(cfg || {})
	}

	load(cfg) {
		cfg.vertexShader = cfg.vertexShader || "pbr-vert"
		cfg.fragmentShader = cfg.fragmentShader || "pbr-frag"
		super.load(cfg)
	}
}
