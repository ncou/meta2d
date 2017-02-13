import Engine from "../Engine";
import Resource from "../resources/Resource";
import ResourceManager from "../resources/ResourceManager";

ResourceManager.registerType(Texture);

export default class Texture extends Resource
{
	constructor(cfg)
	{
		this.instance = null;
		this._width = 0;
		this._height = 0;
		this._minFilter = 0;
		this._magFilter = 0;
		this._wrapS = 0;
		this._wrapT = 0;

		super(cfg);
	}

	clear() 
	{
		this._width = 0;
		this._height = 0;

		if(this.instance) {
			Engine.gl.deleteTexture(this.instance);
			this.instance = null;
		}
	}

	load(cfg)
	{
		if(!cfg) { return; }
		
		this.loading = true;

		if(typeof cfg !== "object") {
			cfg = { path: cfg };
		}

		const image = new Image();
		image.onload = () => {
			this.update(image, cfg);
		};
		image.onerror = () => {
			this.update(null, cfg);
			this.failed();
		};

		image.src = cfg.path;
	}

	update(image, cfg) 
	{
		const gl = Engine.gl;

		if(!this.instance) {
			this.instance = gl.createTexture();
		}

		// const ext = Engine.renderer.extension("EXT_sRGB");

		this._minFilter = cfg.minFilter || Texture.LINEAR;
		this._magFilter = cfg.magFilter || Texture.LINEAR;

		if(cfg.repeat) {
			this._wrapS = Texture.REPEAT;
			this._wrapT = Texture.REPEAT;
		}
		else {
			this._wrapS = cfg.wrapS || Texture.CLAMP_TO_EDGE;
			this._wrapT = cfg.wrapT || Texture.CLAMP_TO_EDGE;
		}

		Engine.renderer.bindTexture(this.instance);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		// gl.texImage2D(gl.TEXTURE_2D, 0, ext.SRGB_EXT, ext.SRGB_EXT, gl.UNSIGNED_BYTE, image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this._minFilter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this._magFilter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this._wrapS);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this._wrapT);
		// gl.generateMipmap(gl.TEXTURE_2D);

		if(image) {
			this._width = image.width;
			this._height = image.height;
		}
		else {
			this._width = 0;
			this._height = 0;
		}

		this.loaded = true;
	}

	get width() {
		return this._width;
	}

	get height() {
		return this._height;
	}

	set repeat(value) 
	{
		const gl = Engine.gl;
		const flag = value ? gl.REPEAT : gl.CLAMP_TO_EDGE;

		this._wrapS = flag;
		this._wrapT = flag;

		Engine.renderer.bindTexture(this.instance);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, flag);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, flag);
	}

	get repeat() {
		const gl = Engine.gl;
		return (this._wrapS === gl.REPEAT && this._wrapT === gl.REPEAT);
	}

	set wrapS(flag)
	{
		if(this._wrapS === flag) { return; }
		this._wrapS = flag;

		const gl = Engine.gl;

		Engine.renderer.bindTexture(this.instance);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, flag);
	}

	get wrapS() {
		return this._wrapS;
	}

	set wrapT(flag)
	{
		if(this._wrapT === flag) { return; }
		this._wrapT = flag;

		const gl = Engine.gl;

		Engine.renderer.bindTexture(this.instance);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, flag);
	}

	get wrapT() {
		return this._wrapT;
	}

	set minFilter(flag)
	{
		if(this._minFilter === flag) { return; }
		this._minFilter = flag;

		const gl = Engine.gl;

		Engine.renderer.bindTexture(this.instance);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, flag);
	}

	get minFilter() {
		return this._minFilter;
	}

	set magFilter(flag)
	{
		if(this._magFilter === flag) { return; }
		this._magFilter = flag;

		const gl = Engine.gl;

		Engine.renderer.bindTexture(this.instance);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, flag);
	}

	get magFilter() {
		return this._magFilter;
	}
}

const webgl = WebGLRenderingContext;
Texture.NEAREST = webgl.NEAREST;
Texture.LINEAR = webgl.LINEAR;
Texture.CLAMP_TO_EDGE = webgl.CLAMP_TO_EDGE;
Texture.REPEAT = webgl.REPEAT;
