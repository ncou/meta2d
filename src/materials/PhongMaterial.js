import Material from "./Material"

export default class PhongMaterial extends Material
{
	constructor(cfg) {
		super(cfg)
	}

	load(cfg) 
	{
		cfg.vertexShader = cfg.vertexShader || "phong-vert"
		cfg.fragmentShader = cfg.fragmentShader || "phong-frag"
		super.load(cfg)
	}

	set ambient(color) {
		this.uniforms.ambient = color
	}

	get ambient() {
		return this.uniforms.ambient
	}

	set diffuse(color) {
		this.uniforms.diffuse = color
	}

	get diffuse() {
		return this.uniforms.diffuse
	}

	set specular(color) {
		this.uniforms.specular = color
	}

	get specular() {
		return this.uniforms.specular
	}
}
