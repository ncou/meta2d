import Material from "./Material"

export default class SkyboxMaterial extends Material
{
	constructor(cfg) {
		super(cfg)
	}

	load(cfg) 
	{
		cfg.vertexShader = cfg.vertexShader || "skybox-vert"
		cfg.fragmentShader = cfg.fragmentShader || "skybox-frag"
		super.load(cfg)

		this.depthTest = cfg.depthTest || false
	}
}
