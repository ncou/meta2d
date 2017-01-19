import Engine from "../Engine";
import Resource from "../resources/Resource";
import ResourceManager from "../resources/ResourceManager";
import Shader from "../graphics/Shader";
import Texture from "../graphics/Texture";

let materialId = 0;

ResourceManager.registerType(Material);

function Attrib(name, loc) {
	this.name = name;
	this.loc = loc;
}

function Uniform(name, loc, type) {
	this.name = name;
	this.loc = loc;
	this.type = type;
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
		this.program = null;
		this.attrib = null;
		this.attribData = null;
		this.uniform = null;
		this.uniformData = null;
		this.numAttribs = 0;
		this._uniforms = {};
		this.needUpdate = false;

		super(cfg);
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
			newVertexShader = Engine.ctx.getResource(cfg.vertexShader);
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
			console.log("(Material.load) Missing vertexShader from: " + this.id);
			return;
		}

		if(cfg.fragmentShader) 
		{
			newFragmentShader = Engine.ctx.getResource(cfg.fragmentShader);
			if(!newFragmentShader) {
				console.log("(Material.load) Could not find fragmentShader: " + cfg.fragmentShader);
				return;
			}
		}
		else if(cfg.fragmentSrc) {
			newFragmentShader = new Shader();
			newFragmentShader.src = cfg.fragmentSrc;
		}
		else if(!newFragmentShader) {
			console.log("(Material.load) Missing vertexShader from: " + this.id);
			return;
		}		

		// Vertex shader
		if(newVertexShader && this.vertexShader !== newVertexShader)
		{
			if(this.vertexShader) {
				this.vertexShader.unsubscribe(this);
			}

			newVertexShader.subscribe(this);
			this.vertexShader = newVertexShader;
		}

		// Fragment shader
		if(newFragmentShader && this.fragmentShader !== newFragmentShader)
		{
			if(this.fragmentShader) {
				this.fragmentShader.unsubscribe(this);
			}

			newFragmentShader.subscribe(this);
			this.fragmentShader = newFragmentShader;
		}

		if(this.vertexShader.loaded && this.fragmentShader.loaded) {
			this.compile();
			this.loaded = true;
		}
		else {
			this.loading = true;
		}

		if(cfg.uniforms) {
			this.uniforms = cfg.uniforms;
		}
	}

	compile()
	{
		const gl = Engine.gl;

		if(this.program) {
			this.cleanup();
		}

		this.vertexShaderInstance = this.compileShader(gl.VERTEX_SHADER, this.vertexShader);
		if(!this.vertexShaderInstance) {
			return false;
		}

		this.fragmentShaderInstance = this.compileShader(gl.FRAGMENT_SHADER, this.fragmentShader);
		if(!this.fragmentShaderInstance) {
			this.cleanup();
			return false;
		}

		this.program = gl.createProgram();
		gl.attachShader(this.program, this.vertexShaderInstance);
		gl.attachShader(this.program, this.fragmentShaderInstance);
		gl.linkProgram(this.program);

		const success = gl.getProgramParameter(this.program, gl.LINK_STATUS);
		if(!success) {
			console.warn("(Material.compile) Program failed to link: " + gl.getProgramInfoLog(this.program));
			this.cleanup();
			return false;
		}

		this.extractAttribs();
		this.extractUniforms();

		this.loaded = true;

		return true;
	}

	compileShader(type, shader)
	{
		const gl = Engine.gl;
		const instance = gl.createShader(type);

		gl.shaderSource(instance, shader.src);
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

		for(let n = 0; n < this.uniformData.length; n++) 
		{
			const uniform = this.uniformData[n];
			let value = this._uniforms[uniform.name];
			if(!value) { continue;}

			switch(uniform.type)
			{
				case gl.SAMPLER_2D:
				{
					if(typeof value === "string") {
						value = Engine.ctx.resource(value);
						this._uniforms[uniform.name] = value;
					}
					
					if(!(value instanceof Texture)) {
						console.warn(`(Material.update) Invalid SAMPLER_2D uniform "${uniform.name}" for: ${this.constructor.name}`);
					}
				} break;
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
		this._uniforms = uniforms;
		this.update();
	}

	get uniforms() {
		this.needUpdate = true;
		return this._uniforms;
	}
}
