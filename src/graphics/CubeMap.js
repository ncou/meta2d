import Engine from "../Engine"
import Resource from "../resources/Resource.js"

export default class CubeMap extends Resource
{
	constructor(cfg)
	{
		this._images = new Array(6)
		
		this.handle = null
		this._repeat = false
		this._minFilter = 0
		this._magFilter = 0
		this._width = 0
		this._height = 0

		this.numToLoad = 0

		this.clear()

		super(cfg)
	}

	clear() 
	{
		this._width = 0
		this._height = 0

		if(this.handle) {
			this.ctx.deleteTexture(this.handle)
			this.handle = null
		}

		for(let n = 0; n < this._images.length; n++) {
			this._images[n] = null
		}
	}

	load(cfg)
	{
		if(!cfg) { return }

		if(cfg instanceof Array) {
			this.images = cfg
		}
		else 
		{
			for(let key in cfg) {
				this[key] = cfg[key]
			}
		}
	}

	handleLoadedImage(image) 
	{
		this._width = image.width
		this._height = image.height

		this.numToLoad--
		if(this.numToLoad === 0) {
			this.updateTextures()
			this.loading = false
		}
	}

	updateTextures()
	{
		const gl = Engine.gl

		if(!this.handle) {
			this.handle = gl.createTexture()
		}

		this._repeat = (this.cfg && this.cfg.repeat) || false
		this._minFilter = (this.cfg && this.cfg.minFilter) || gl.LINEAR
		this._magFilter = (this.cfg && this.cfg.magFilter) || gl.LINEAR

		const wrapType = this._repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE

		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.handle)
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, this._magFilter)
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, this._minFilter)
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, wrapType);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, wrapType);

		for(let n = 0; n < 6; n++) 
		{
			const image = this._images[n]
			const target = gl.TEXTURE_CUBE_MAP_POSITIVE_X + n

			if(!image) 
			{
				gl.texImage2D(target, 0, gl.RGBA, this._width, this._height, 
					0, gl.RGBA, gl.UNSIGNED_BYTE, null)
			}
			else 
			{
				gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
			}
		}

		this.needUpdate = false
	}

	set images(imageSources) 
	{
		this.loading = true
		this.numToLoad = 0

		for(let n = 0; n < imageSources.length; n++) 
		{
			const imageSource = imageSources[n]
			let image = this._images[n]
			if(!image) {
				image = new Image()
				image.onload = () => {
					this.handleLoadedImage(image)
				};
				image.onerror = () => {
					this._images[n] = null
					this.handleLoadedImage(image)
				}
				this._images[n] = image
			}

			this.numToLoad++
			image.src = imageSource
		}

		if(this.numToLoad === 0) {
			this.loading = false
		}
	}

	get repeat() {
		return this._repeat
	}

	get minFilter() {
		return this._minFilter
	}

	get maxFilter() {
		return this._maxFilter
	}

	get width() {
		return this._width
	}

	get height() {
		return this._height
	}
}
