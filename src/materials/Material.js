import Engine from "../Engine"
import Resource from "../resources/Resource"
import Shader from "../graphics/Shader"
import Texture from "../graphics/Texture"
import CubeMap from "../graphics/CubeMap"

let materialId = 0

function Attrib(name, loc) {
	this.name = name
	this.loc = loc
}

function Uniform(name, loc, type) {
	this.name = name
	this.loc = loc
	this.type = type
}

export default class Material extends Resource
{
	constructor(cfg)
	{
		this.materialId = materialId++;
		this.vertexShader = null;
		this.vertexShaderInstance = null;
		this.fragmentShader = null;
		this.fragmentShaderInstance = null;
		this.program = null
		this.attrib = null
		this.attribData = {}
		this.uniform = {}
		this.uniformData = {}
		this.numAttribs = 0
		this._uniforms = {}
		this._defines = {}
		this.needUpdate = false
		this.needCompile = false

		this.depthTest = true
		this.cullFace = Material.BACK

		super(cfg)
	}

	cleanup()
	{
		const gl = Engine.gl;

		this.loaded = false;

		if(this.vertexShaderInstance) {
			gl.deleteShader(this.vertexShaderInstance);
			this.vertexShaderInstance = null;
		}
		if(this.fragmentShaderInstance) {
			gl.deleteShader(this.fragmentShaderInstance);
			this.fragmentShaderInstance = null;
		}
		if(this.program) {
			gl.deleteProgram(this.program);
			this.program = null;
		}
	}

	load(cfg)
	{
		this.loaded = false;
		this.loading = false;

		if(!cfg) {
			console.log("(Material.load) Invalid config passed");
			return;
		}

		let newVertexShader;
		let newFragmentShader;

		if(cfg.vertexShader)
		{
			newVertexShader = Engine.ctx.resource(cfg.vertexShader);
			if(!newVertexShader) {
				console.log("(Material.load) Could not find vertexShader: " + cfg.vertexShader);
				return;
			}
		}
		else if(cfg.vertexSrc) {
			newVertexShader = new Shader();
			newVertexShader.src = cfg.vertexSrc;
		}
		else if(!newVertexShader) {
			console.log("(Material.load) Missing vertexShader in: " + this.id);
			return;
		}

		if(cfg.fragmentShader)
		{
			newFragmentShader = Engine.ctx.resource(cfg.fragmentShader);
			if(!newFragmentShader) {
				console.log("(Material.load) Could not find fragmentShader: " + cfg.fragmentShader);
				return;
			}
		}
		else if(cfg.fragmentSrc) {
			newFragmentShader = new Shader()
			newFragmentShader.src = cfg.fragmentSrc
		}
		else if(!newFragmentShader) {
			console.log("(Material.load) Missing vertexShader in: " + this.id)
			return
		}

		// Vertex shader
		if(newVertexShader && this.vertexShader !== newVertexShader)
		{
			if(this.vertexShader) {
				this.vertexShader.unsubscribe(this, this.handleLoad)
			}

			newVertexShader.subscribe(this, this.handleLoad)
			this.vertexShader = newVertexShader
		}

		// Fragment shader
		if(newFragmentShader && this.fragmentShader !== newFragmentShader)
		{
			if(this.fragmentShader) {
				this.fragmentShader.unsubscribe(this, this.handleLoad)
			}

			newFragmentShader.subscribe(this, this.handleLoad)
			this.fragmentShader = newFragmentShader
		}

		if(cfg.uniforms) {
			this.uniforms = cfg.uniforms
		}

		if(this.vertexShader.loaded && this.fragmentShader.loaded) {
			this.compile()
		}
		else {
			this.loading = true
		}
	}

	compile()
	{
		const gl = Engine.gl

		if(this.program) {
			this.cleanup()
		}

		let definesOutput = ""
		if(this._defines)
		{
			for(let key in this._defines) {
				const value = this._defines[key]
				if(value) {
					definesOutput += `#define ${key}` + "\n"
				}
			}

			if(definesOutput) {
				definesOutput += "\n"
			}
		}

		this.vertexShaderInstance = this.compileShader(gl.VERTEX_SHADER, this.vertexShader, definesOutput)
		if(!this.vertexShaderInstance) {
			this.failed()
			return false
		}

		this.fragmentShaderInstance = this.compileShader(gl.FRAGMENT_SHADER, this.fragmentShader, definesOutput)
		if(!this.fragmentShaderInstance) {
			this.cleanup()
			this.failed()
			return false
		}

		this.program = gl.createProgram();
		gl.attachShader(this.program, this.vertexShaderInstance);
		gl.attachShader(this.program, this.fragmentShaderInstance);
		gl.linkProgram(this.program);

		const success = gl.getProgramParameter(this.program, gl.LINK_STATUS);
		if(!success) {
			console.warn("(Material.compile) Program failed to link: " + gl.getProgramInfoLog(this.program));
			this.cleanup();
			this.failed();
			return false;
		}

		this.extractAttribs()
		this.extractUniforms()

		this.needCompile = false

		if(this.loading) {
			this.loading = false
		}
		else {
			this.loaded = true
		}

		return true
	}

	compileShader(type, shader, defines)
	{
		const gl = Engine.gl;
		const instance = gl.createShader(type);

		gl.shaderSource(instance, defines + shader.src);
		gl.compileShader(instance);

		const success = gl.getShaderParameter(instance, gl.COMPILE_STATUS)
		if(!success) {
			console.warn("(Shader.compile) [" + this.getStrShaderType(type) + ":" + shader.id + "] " + gl.getShaderInfoLog(instance));
			return null;
		}

		return instance;
	}

	getStrShaderType(type)
	{
		const gl = Engine.gl;

		switch(type) {
			case gl.VERTEX_SHADER: return "VERTEX_SHADER";
			case gl.FRAGMENT_SHADER: return "FRAGMENT_SHADER";
			default: return "Unknown";
		}
	}

	extractAttribs()
	{
		this.attrib = {};
		this.attribData = [];

		const gl = Engine.gl;

		this.numAttribs = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
		for(let n = 0; n < this.numAttribs; n++) {
			const attrib = gl.getActiveAttrib(this.program, n);
			const attribLoc = gl.getAttribLocation(this.program, attrib.name);
			this.attrib[attrib.name] = attribLoc;
			this.attribData.push(new Attrib(attrib.name, attribLoc));
		}
	}

	extractUniforms()
	{
		this.uniform = {};
		this.uniformData = [];

		const gl = Engine.gl;
		const num = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
		for(let n = 0; n < num; n++) {
			const uniform = gl.getActiveUniform(this.program, n);
			const name = uniform.name.replace("[0]", "");
			const loc = gl.getUniformLocation(this.program, name);
			this.uniform[name] = loc;
			this.uniformData.push(new Uniform(name, loc, uniform.type));
		}
	}

	update()
	{
		const gl = Engine.gl;

		for(let key in this._uniforms)
		{
			const value = this._uniforms[key]
			if(typeof value === "string") {
				this._uniforms[key] = Engine.ctx.resource(value)
			}
		}

		const envmap = this._uniforms.envmap
		if(envmap)
		{
			if(envmap instanceof CubeMap) {
				this.define("CUBEMAP", true)
			}
			else {
				this.define("CUBEMAP", false)
			}
		}
		else
		{
			if(this._defines.CUBEMAP) {
				this.define("CUBEMAP", false)
			}
		}

		this.needUpdate = false;
	}

	handleLoad(value)
	{
		if(value)
		{
			if(this.vertexShader.loaded && this.fragmentShader.loaded) {
				this.compile();
			}
		}
		else {
			this.cleanup();
		}
	}

	set uniforms(uniforms)
	{
		this._uniforms = uniforms
		this.update()
	}

	get uniforms() {
		this.needUpdate = true;
		return this._uniforms;
	}

	define(key, value)
	{
		this._defines[key] = value
		this.needCompile = true;
	}
}

const webgl = WebGLRenderingContext;
Material.FRONT = webgl.BACK
Material.BACK = webgl.FRONT
Material.FRONT_AND_BACK = webgl.FRONT_AND_BACK