import Engine from "../Engine"
import Resource from "../resources/Resource"
import parseHDR from "../loaders/HDR"

export default class Texture extends Resource
{
	constructor(cfg)
	{
		this.handle = null
		this.target = WebGLRenderingContext.TEXTURE_2D
		this._width = 0
		this._height = 0
		this._minFilter = 0
		this._magFilter = 0
		this._wrapS = 0
		this._wrapT = 0
		this.ext = null

		super(cfg)
	}

	clear()
	{
		this._width = 0;
		this._height = 0;

		if(this.handle) {
			Engine.gl.deleteTexture(this.handle);
			this.handle = null;
		}
	}

	load(cfg)
	{
		if(!cfg) { return; }
		if(!cfg.path) {
			console.warn("(Texture.load) Invalid path passed")
			return
		}

		this.loading = true;

		if(typeof cfg !== "object") {
			cfg = { path: cfg }
		}

		const extIndex = cfg.path.lastIndexOf(".")
		if(extIndex === -1) {
			this.ext = "png"
			cfg.path += ".png"
		}
		else {
			this.ext = cfg.path.slice(extIndex + 1)
		}

		if(this.ext === "dds" || this.ext === "hdr")
		{
			const xhr = new XMLHttpRequest()
			xhr.open("GET", cfg.path, true)
			xhr.responseType = "arraybuffer"
			xhr.onload = () => {
				this.updateCustom(xhr.response)
			}
			xhr.onerror = () => {
				this.update(null, cfg)
				this.failed()
			}
			xhr.send(null)
		}
		else
		{
			const image = new Image()
			image.onload = () => {
				this.update(image, cfg)
			};
			image.onerror = () => {
				this.update(null, cfg)
				this.failed()
			};

			image.src = cfg.path
		}
	}

	update(image, cfg)
	{
		const gl = Engine.gl

		if(!this.handle) {
			this.handle = gl.createTexture()
		}

		this._minFilter = cfg.minFilter || Texture.LINEAR
		this._magFilter = cfg.magFilter || Texture.LINEAR

		if(cfg.repeat) {
			this._wrapS = Texture.REPEAT
			this._wrapT = Texture.REPEAT
		}
		else {
			this._wrapS = cfg.wrapS || Texture.CLAMP_TO_EDGE
			this._wrapT = cfg.wrapT || Texture.CLAMP_TO_EDGE
		}

		Engine.renderer.bindTexture(this.handle)
		// gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, image.width, image.height, 0, gl.RGBA8, gl.UNSIGNED_BYTE, image)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.SRGB8, gl.RGB, gl.UNSIGNED_BYTE, image)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this._minFilter)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this._magFilter)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this._wrapS)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this._wrapT)
		// gl.generateMipmap(gl.TEXTURE_2D);

		if(image) {
			this._width = image.width
			this._height = image.height
		}
		else {
			this._width = 0
			this._height = 0
		}

		this.loaded = true
	}

	updateCustom(data)
	{
		switch(this.ext)
		{
			case "dds":
				this.updateDDS(data)
				break

			case "hdr":
				this.updateHDR(data)
				break
		}
	}

	updateDDS(data)
	{
		const gl = Engine.gl
        const header = new Int32Array(data, 0, DDS_HEADER.headerLengthInt)

		if(!this.handle) {
			this.handle = gl.createTexture()
		}

        if(header[DDS_HEADER.offsetMagic] != DDS_MAGIC) {
            console.error("Invalid magic number in DDS header")
			this.failed()
			return
        }

        if(!header[DDS_HEADER.offsetPfFlags] & DDPF_FOURCC) {
            console.error("Unsupported format, must contain a FourCC code")
            this.failed()
			return
        }

		const ext = Engine.renderer.extension("WEBGL_compressed_texture_s3tc")

		let blockBytes, internalFormat
        const fourCC = header[DDS_HEADER.offsetPfFourCC]
        switch(fourCC)
		{
            case FOURCC_DXT1:
                blockBytes = 8
                internalFormat = ext.COMPRESSED_RGBA_S3TC_DXT1_EXT
                break

            case FOURCC_DXT5:
                blockBytes = 16
                internalFormat = ext.COMPRESSED_RGBA_S3TC_DXT5_EXT
                break

            default:
                console.error("Unsupported FourCC code:", Int32ToFourCC(fourCC))
				this.failed()
				return
        }

        let mipmaps = 1;
        if(header[DDS_HEADER.offsetFlags] & DDSD_MIPMAPCOUNT) {
            mipmaps = Math.max(1, header[DDS_HEADER.offsetMipmapCount])
        }

        let width = header[DDS_HEADER.offsetWidth]
        let height = header[DDS_HEADER.offsetHeight]
        let dataOffset = header[DDS_HEADER.offsetSize] + 4
		this._width = width
		this._height = height

		Engine.renderer.bindTexture(this.handle)

        for(let n = 0; n < mipmaps; n++)
		{
            const dataLength = Math.max(4, width) / 4 * Math.max(4, height) / 4 * blockBytes
            const byteArray = new Uint8Array(data, dataOffset, dataLength)
            gl.compressedTexImage2D(gl.TEXTURE_2D, n, internalFormat, width, height, 0, byteArray)
            dataOffset += dataLength
            width *= 0.5
            height *= 0.5
        }

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mipmaps > 1 ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR)

		this.loaded = true
	}

	updateHDR(data)
	{
		const result = parseHDR(data)
		const gl = Engine.gl

		if(!this.handle) {
			this.handle = gl.createTexture()
		}

		this._width = result.width
		this._height = result.height

		Engine.renderer.bindTexture(this.handle)

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, result.width, result.height, 0, gl.RGBA, gl.FLOAT, result.data)

		this.loaded = true
	}

	get width() {
		return this._width
	}

	get height() {
		return this._height
	}

	set repeat(value)
	{
		const gl = Engine.gl
		const flag = value ? gl.REPEAT : gl.CLAMP_TO_EDGE

		this._wrapS = flag
		this._wrapT = flag

		Engine.renderer.bindTexture(this.handle)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, flag)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, flag)
	}

	get repeat() {
		const gl = Engine.gl
		return (this._wrapS === gl.REPEAT && this._wrapT === gl.REPEAT)
	}

	set wrapS(flag)
	{
		if(this._wrapS === flag) { return }
		this._wrapS = flag

		const gl = Engine.gl

		Engine.renderer.bindTexture(this.handle)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, flag)
	}

	get wrapS() {
		return this._wrapS
	}

	set wrapT(flag)
	{
		if(this._wrapT === flag) { return; }
		this._wrapT = flag

		const gl = Engine.gl

		Engine.renderer.bindTexture(this.handle)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, flag)
	}

	get wrapT() {
		return this._wrapT
	}

	set minFilter(flag)
	{
		if(this._minFilter === flag) { return; }
		this._minFilter = flag

		const gl = Engine.gl

		Engine.renderer.bindTexture(this.handle);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, flag);
	}

	get minFilter() {
		return this._minFilter
	}

	set magFilter(flag)
	{
		if(this._magFilter === flag) { return; }
		this._magFilter = flag

		const gl = Engine.gl

		Engine.renderer.bindTexture(this.handle)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, flag)
	}

	get magFilter() {
		return this._magFilter
	}
}

const FourCCToInt32 = function(value) {
	return value.charCodeAt(0) +
		(value.charCodeAt(1) << 8) +
		(value.charCodeAt(2) << 16) +
		(value.charCodeAt(3) << 24)
}

const Int32ToFourCC = function(value) {
	return String.fromCharCode(
		value & 0xff,
		(value >> 8) & 0xff,
		(value >> 16) & 0xff,
		(value >> 24) & 0xff
	)
}

const DDS_MAGIC = 0x20534444

const DDSD_CAPS = 0x1
const DDSD_HEIGHT = 0x2
const DDSD_WIDTH = 0x4
const DDSD_PITCH = 0x8
const DDSD_PIXELFORMAT = 0x1000
const DDSD_MIPMAPCOUNT = 0x20000
const DDSD_LINEARSIZE = 0x80000
const DDSD_DEPTH = 0x800000

const DDSCAPS_COMPLEX = 0x8
const DDSCAPS_MIPMAP = 0x400000
const DDSCAPS_TEXTURE = 0x1000

const DDSCAPS2_CUBEMAP = 0x200
const DDSCAPS2_CUBEMAP_POSITIVEX = 0x400
const DDSCAPS2_CUBEMAP_NEGATIVEX = 0x800
const DDSCAPS2_CUBEMAP_POSITIVEY = 0x1000
const DDSCAPS2_CUBEMAP_NEGATIVEY = 0x2000
const DDSCAPS2_CUBEMAP_POSITIVEZ = 0x4000
const DDSCAPS2_CUBEMAP_NEGATIVEZ = 0x8000
const DDSCAPS2_VOLUME = 0x200000

const DDPF_ALPHAPIXELS = 0x1
const DDPF_ALPHA = 0x2
const DDPF_FOURCC = 0x4
const DDPF_RGB = 0x40
const DDPF_YUV = 0x200
const DDPF_LUMINANCE = 0x20000

const DDS_HEADER = {
	headerLengthInt: 31,
	offsetMagic: 0,
	offsetSize: 1,
	offsetFlags: 2,
	offsetHeight: 3,
	offsetWidth: 4,
	offsetMipmapCount: 7,
	offsetPfFlags: 20,
	offsetPfFourCC: 21
}

const FOURCC_DXT1 = FourCCToInt32("DXT1")
const FOURCC_DXT5 = FourCCToInt32("DXT5")

const webgl = WebGLRenderingContext;
Texture.NEAREST = webgl.NEAREST;
Texture.LINEAR = webgl.LINEAR;
Texture.CLAMP_TO_EDGE = webgl.CLAMP_TO_EDGE;
Texture.REPEAT = webgl.REPEAT;
