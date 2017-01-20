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
		this._minFilter = Texture.LINEAR;
		this._magFilter = Texture.LINEAR;
		this._wrapS = Texture.CLAMP_TO_EDGE;
		this._wrapT = Texture.CLAMP_TO_EDGE;

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
		this.loaded = false;

		const image = new Image();
		image.onload = () => {
			this.handleLoadedImage(image);
		};
		image.onerror = () => {
			this.handleLoadedImage(null);
			this.failed();
		};

		if(typeof cfg === "string") {
			image.src = cfg;
		}
		else {
			image.src = cfg.path;
		}
	}

	handleLoadedImage(image) {
		this.update(image);
	}

	update(image) 
	{
		const gl = Engine.gl;

		if(!this.instance) {
			this.instance = gl.createTexture();
		}

		const ext = Engine.renderer.extension("EXT_sRGB");

		gl.bindTexture(gl.TEXTURE_2D, this.instance);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		// gl.texImage2D(gl.TEXTURE_2D, 0, ext.SRGB_EXT, ext.SRGB_EXT, gl.UNSIGNED_BYTE, image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this._magFilter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this._minFilter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this._wrapS);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this._wrapT);
		// gl.generateMipmap(gl.TEXTURE_2D);

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

		
	}

	get minFilter() {
		return this._minFilter;
	}

	set magFilter(flag)
	{
		if(this._magFilter === flag) { return; }
		this._magFilter = flag;
	}

	get magFilter() {
		return this._magFilter;
	}	
}
