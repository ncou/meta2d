import Engine from "../Engine"
import Resource from "../resources/Resource"

export default class Mesh extends Resource
{
	constructor(vertices, indices, uv, normals)
	{
		this.vertexBuffer = null;
		this.indexBuffer = null;
		this.uvBuffer = null;
		this.normalBuffer = null;
		this.numVertices = 0;
		this._vertices = null;
		this._indices = null;
		this._uv = null;
		this._normals = null;

		if(vertices) { this.vertices = vertices; }
		if(indices) { this.indices = indices; }
		if(uv) { this.uv = uv; }
		if(normals) { this.normals = normals; }
	}

	set vertices(vertices)
	{
		if(!(vertices instanceof Float32Array)) {
			this._vertices = new Float32Array(vertices);
		}
		else {
			this._vertices = vertices;
		}

		this.numVertices = this._vertices.length;

		const gl = Engine.gl;

		if(!this.vertexBuffer) {
			this.vertexBuffer = gl.createBuffer();
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	get vertices() {
		return this._vertices;
	}	

	set indices(indices) 
	{
		if(!(indices instanceof Uint16Array)) {
			this._indices = new Uint16Array(indices);
		}
		else {
			this._indices = indices;
		}

		const gl = Engine.gl;

		if(!this.indexBuffer) {
			this.indexBuffer = gl.createBuffer();
		}
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}

	get indices() {
		return this._indices;
	}

	set uv(uv) 
	{
		if(!(uv instanceof Float32Array)) {
			this._uv = new Float32Array(uv);
		}
		else {
			this._uv = uv;
		}

		const gl = Engine.gl;

		if(!this.uvBuffer) {
			this.uvBuffer = gl.createBuffer();
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this._uv, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	get uv() {
		return this._uv;
	}	

	set normals(normals) 
	{
		if(!(normals instanceof Float32Array)) {
			this._normals = new Float32Array(normals);
		}
		else {
			this._normals = normals;
		}

		const gl = Engine.gl;

		if(!this.normalBuffer) {
			this.normalBuffer = gl.createBuffer();
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this._normals, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	get normals() {
		return this._normals;
	}	
}


// export default class Mesh extends Resource
// {
// 	constructor(cfg)
// 	{
// 		this.path = null;
// 		this.mesh = null;

// 		super(cfg);
// 	}

// 	load(cfg)
// 	{
// 		this.loaded = false;

// 		if(!cfg) {
// 			console.warn("(Mesh.load) Invalid `cfg` param passed.");
// 			return;
// 		}

// 		const path = (typeof cfg === String) ? cfg : cfg.path;
// 		const index = path.lastIndexOf(".");
// 		if(index === -1) {
// 			console.warn("(Mesh.load) Unknown mesh extenssion.");
// 			return;
// 		}

// 		this.path = path;
// 		const ext = path.slice(index + 1);

// 		this.loading = true;

// 		fetchContent(this.path, (data) => {
// 			this.loadFromData(data, ext);
// 		});
// 	}

// 	loadFromData(data, type)
// 	{
// 		switch(type)
// 		{
// 			case "obj":
// 				const mesh = new OBJ.Mesh(data);
// 				this.mesh = {
// 					vertices: mesh.vertices,
// 					indices: mesh.indices,
// 					uvs: mesh.textures,
// 					normals: mesh.vertexNormals
// 				}
// 				console.log(this.mesh)
// 				// this.mesh = loadObj(data); 
// 				// console.log(this.mesh)
// 				break;

// 			default:
// 				console.warn("(Mesh.loadFromData) Unknown data type: " + type);
// 				break;
// 		}

// 		this.loading = false;
// 		this.loaded = true;
// 	}
// }