import Material from "./Material"

export default class TextureMaterial extends Material
{
	constructor(cfg) {
		super(cfg || {})
	}

	load(cfg) {
		cfg.vertexShader = cfg.vertexShader || "texture-vert"
		cfg.fragmentShader = cfg.fragmentShader || "texture-frag"
		super.load(cfg)
	}
}
