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
		};

		if(typeof cfg === "string") {
			image.src = cfg;
		}
		else {
			image.src = cfg.path;
		}
	}

	handleLoadedImage(image) 
	{
		this.update(image);
		this.loading = false;
		this.loaded = true;
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
		// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		// gl.generateMipmap(gl.TEXTURE_2D);
	}

	get width() {
		return this._width;
	}

	get height() {
		return this._height;
	}
}
