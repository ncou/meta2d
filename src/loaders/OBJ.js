import { 
	isSpace, 
	isNewline,
	isDigit,
	isAlpha,
	isAlphaNum
} from "../utils/Utils"

function Token() {
	this.str = null
	this.value = null
	this.line = 0
}

class Tokenizer
{
	constructor(buffer) {
		this.buffer = buffer;
		this.bufferLength = buffer.length;
		this.index = 0;
		this.line = 0;
		this.cursor = 0;
		this.currChar = "";
		this.token = new Token();
	}

	next()
	{
		this.token.str = "";
		this.token.value = null;

		this.nextChar();

		while(isSpace(this.currChar)) {
			this.nextChar();
		}

		// Name
		if(isAlpha(this.currChar))
		{
			this.token.str += this.currChar;
			this.nextChar();
			while(isAlphaNum(this.currChar)) {
				this.token.str += this.currChar;
				this.nextChar();
			}
			this.cursor--;
			return this.token;
		}

		// Number
		if(isDigit(this.currChar))
		{
			this.token.str += this.currChar;

			this.nextChar();
			while(isDigit(this.currChar)) {
				this.token.str += this.currChar;
				this.nextChar();
			}
			this.cursor--;

			// Only a symbol:
			if(this.token.str === ".") {
				this.token.value = this.token.str;
				return this.token;
			}

			this.token.value = parseFloat(this.token.str);
			return this.token;
		}

		// Comment
		if(this.currChar === "#")
		{
			this.nextChar();
			while(!isNewline(this.currChar)) {
				this.nextChar();
			}

			this.token.str = "#";
			this.token.value = "#";
			return this.token;
		}

		// EOF
		if(this.currChar === "\0") {
			this.token.str = this.currChar;
			this.token.value = this.currChar;
			return this.token;
		}

		this.token.str = this.currChar;
		return this.token;
	}

	nextFace()
	{
		this.token.str = "";
		this.token.value = null;
		this.token.line = this.line

		this.nextChar()

		while(isSpace(this.currChar)) {
			this.nextChar()
		}

		if(this.currChar === "\0") {
			return this.token
		}

		do {
			this.token.str += this.currChar
			this.nextChar()
			if(this.currChar === "\0") {
				return this.token
			}
		} while(!isSpace(this.currChar))

		return this.token;
	}

	nextChar()
	{
		if(this.cursor >= this.bufferLength) {
			this.currChar = "\0";
		}
		else {
			this.currChar = this.buffer[this.cursor];
			this.cursor++;
			if(this.currChar === "\n") {
				this.line++;
			}
		}
	}
}

function Cache() 
{
	this.vertices = [];
	this.normals = [];
	this.uvs = [];

	this.verticesUnpacked = [];
	this.normalsUnpacked = [];
	this.uvsUnpacked = [];
	this.indices = [];
	this.hashedIndices = {};
	this.index = 0;
}

function parseVertices(tokenizer, cache) 
{
	do {
		cache.vertices.push(tokenizer.next().value);
		cache.vertices.push(tokenizer.next().value);
		cache.vertices.push(tokenizer.next().value);
	} while(tokenizer.token.str === "v");
}

function parseUV(tokenizer, cache) 
{
	do {
		cache.uvs.push(tokenizer.next().value);
		cache.uvs.push(tokenizer.next().value);
	} while(tokenizer.token.str === "v");
}

function parseNormals(tokenizer, cache) 
{
	do {
		cache.normals.push(tokenizer.next().value);
		cache.normals.push(tokenizer.next().value);
		cache.normals.push(tokenizer.next().value);
	} while(tokenizer.token.str === "v");
}

function parseFaces(tokenizer, cache) 
{
	const line = tokenizer.line

	tokenizer.nextFace()
	parseFace(tokenizer, cache)

	tokenizer.nextFace()
	parseFace(tokenizer, cache)

	tokenizer.nextFace()
	parseFace(tokenizer, cache)

	tokenizer.nextFace()
	if(tokenizer.token.line === line) {
		const indices = cache.indices
		indices.push(indices[indices.length - 1])
		parseFace(tokenizer, cache)
		indices.push(indices[indices.length - 5])
		tokenizer.next()
	}
}

function parseFace(tokenizer, cache)
{
	const token = tokenizer.token

	const index = cache.hashedIndices[token.str];
	if(index !== undefined) {
		cache.indices.push(index);
	}
	else 
	{
		const values = token.str.split("/");

		const vertexIndex = (values[0] - 1) * 3;
		cache.verticesUnpacked.push(cache.vertices[vertexIndex + 0]);
		cache.verticesUnpacked.push(cache.vertices[vertexIndex + 1]);
		cache.verticesUnpacked.push(cache.vertices[vertexIndex + 2]);

		if(values[1].length > 0) {
			const uvIndex = (values[1] - 1) * 2;
			cache.uvsUnpacked.push(cache.uvs[uvIndex + 0]);
			cache.uvsUnpacked.push(cache.uvs[uvIndex + 1]);
		}

		if(values[2].length > 0) {
			const normalIndex = (values[2] - 1) * 3;
			cache.normalsUnpacked.push(cache.normals[normalIndex + 0]);
			cache.normalsUnpacked.push(cache.normals[normalIndex + 1]);
			cache.normalsUnpacked.push(cache.normals[normalIndex + 2]);
		}

		cache.hashedIndices[token.str] = cache.index;
		cache.indices.push(cache.index);
		cache.index++;
	}
}

function parseOBJ(data)
{
	const cache = new Cache();
	const tokenizer = new Tokenizer(data);
	tokenizer.next();

	for(;;)
	{
		switch(tokenizer.token.str)
		{
			case "v": parseVertices(tokenizer, cache); break;
			case "vt": parseUV(tokenizer, cache); break;
			case "vn": parseNormals(tokenizer, cache); break;
			case "f": parseFaces(tokenizer, cache); break;
			default: tokenizer.next(); break;
		}

		if(tokenizer.token.str === "\0") {
			break;
		}
	}
	
	return {
		vertices: cache.verticesUnpacked,
		indices: cache.indices,
		uv: (cache.uvsUnpacked.length > 0) ? cache.uvsUnpacked : null,
		normals: (cache.normalsUnpacked.length > 0) ? cache.normalsUnpacked : null
	}
}

export default parseOBJ
