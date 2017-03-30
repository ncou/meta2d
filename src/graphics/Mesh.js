import Engine from "../Engine"
import Resource from "../resources/Resource"
import parseOBJ from "../loaders/OBJ"
import fetchContent from "../utils/FetchContent"

export default class Mesh extends Resource
{
	constructor(cfg)
	{
		this.vertexBuffer = null
		this.indexBuffer = null
		this.uvBuffer = null
		this.normalBuffer = null

		this._vertices = null
		this._indices = null
		this._uvs = null
		this._normals = null

		this.numVertices = 0

		this.path = null

		super(cfg)
	}

	destroy()
	{
		const gl = Engine.gl

		if(this.vertexBuffer) {
			gl.deleteBuffer(this.vertexBuffer)
			this.vertexBuffer = null
		}

		if(this.indexBuffer) {
			gl.deleteBuffer(this.indexBuffer)
			this.indexBuffer = null
		}

		if(this.uvBuffer) {
			gl.deleteBuffer(this.uvBuffer)
			this.uvBuffer = null
		}

		if(this.normalBuffer) {
			gl.deleteBuffer(this.normalBuffer)
			this.normalBuffer = null
		}
	}

	load(cfg)
	{
		if(!cfg) { return }

		if(cfg.path)
		{
			const path = (typeof cfg === String) ? cfg : cfg.path
			const index = path.lastIndexOf(".")
			if(index === -1) {
				console.warn("(Mesh.load) Invalid mesh extension")
				return
			}

			this.path = path
			this.loading = true

			const ext = path.slice(index + 1)

			fetchContent(this.path, (data) => {
				this.loadFromData(data, ext)
			})
		}
		else
		{
			this.vertices = cfg.vertices || null
			this.indices = cfg.indices || null
			this.uvs = cfg.uvs || null
			this.normals = cfg.normals || null

			this.loading = false
		}
	}

	loadFromData(data, type)
	{
		let meshData

		switch(type)
		{
			case "obj":
				meshData = parseOBJ(data)
				break

			default:
				console.warn("(Mesh.loadFromData) Unknown data type: " + type)
				break
		}

		this.vertices = meshData.vertices || null
		this.indices = meshData.indices || null
		this.uv = meshData.uv || null
		this.normals = meshData.normals || null

		this.loading = false
	}

	set vertices(vertices)
	{
		const gl = Engine.gl

		if(vertices)
		{
			if(!(vertices instanceof Float32Array)) {
				this._vertices = new Float32Array(vertices)
			}
			else {
				this._vertices = vertices
			}

			this.numVertices = this._vertices.length
		}
		else
		{
			if(this.vertexBuffer) {
				gl.deleteBuffer(this.vertexBuffer)
				this.vertexBuffer = null
			}

			this.numVertices = 0

			return
		}

		if(!this.vertexBuffer) {
			this.vertexBuffer = gl.createBuffer()
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.STATIC_DRAW)
		gl.bindBuffer(gl.ARRAY_BUFFER, null)
	}

	get vertices() {
		return this._vertices
	}

	set indices(indices)
	{
		const gl = Engine.gl

		if(indices)
		{
			if(!(indices instanceof Uint16Array)) {
				this._indices = new Uint16Array(indices)
			}
			else {
				this._indices = indices
			}
		}
		else
		{
			if(this.indexBuffer) {
				gl.deleteBuffer(this.indexBuffer)
				this.indexBuffer = null
			}

			return
		}

		if(!this.indexBuffer) {
			this.indexBuffer = gl.createBuffer()
		}
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.STATIC_DRAW)
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
	}

	get indices() {
		return this._indices
	}

	set uvs(uvs)
	{
		const gl = Engine.gl

		if(uvs)
		{
			if(!(uvs instanceof Float32Array)) {
				this._uvs = new Float32Array(uvs)
			}
			else {
				this._uvs = uvs
			}
		}
		else
		{
			if(this.uvBuffer) {
				gl.deleteBuffer(this.uvBuffer)
				this.uvBuffer = null
			}

			return
		}

		if(!this.uvBuffer) {
			this.uvBuffer = gl.createBuffer()
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, this._uvs, gl.STATIC_DRAW)
		gl.bindBuffer(gl.ARRAY_BUFFER, null)
	}

	get uvs() {
		return this._uvs
	}

	set normals(normals)
	{
		const gl = Engine.gl

		if(normals)
		{
			if(!(normals instanceof Float32Array)) {
				this._normals = new Float32Array(normals)
			}
			else {
				this._normals = normals
			}
		}
		else
		{
			if(this.normalBuffer) {
				gl.deleteBuffer(this.normalBuffer)
				this.normalBuffer = null
			}

			return
		}

		if(!this.normalBuffer) {
			this.normalBuffer = gl.createBuffer()
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, this._normals, gl.STATIC_DRAW)
		gl.bindBuffer(gl.ARRAY_BUFFER, null)
	}

	get normals() {
		return this._normals
	}
}
