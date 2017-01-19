import Engine from "../Engine";
import Resource from "../resources/Resource";
import ResourceManager from "../resources/ResourceManager";
import fetchContent from "../utils/FetchContent";

ResourceManager.registerType(Shader);

export default class Shader extends Resource
{
	constructor(cfg) 
	{
		this.imports = null;
		this.numToLoad = 0;
		this._src = null;
		this.originalSrc = null;

		super(cfg);
	}

	load(cfg)
	{
		this.loaded = false;
		this.loading = true;

		if(typeof cfg === "string") 
		{
			fetchContent(cfg, (src) => {
				this.src = src;
			});
		}
		else if(cfg.src) {
			this.src = cfg.src;
		}
		else if(cfg.path)
		{
			fetchContent(cfg.path, (src) => {
				this.src = src;
			});
		}
	}

	analyseImports()
	{
		if(this.imports) 
		{
			const num = this.imports.length;
			for(let n = 0; n < num; n++) {
				this.imports[n].unsubscribe(this, this.handleLoad);
			}

			this.imports.lenght = 0;
		}

		const regexp = /import ([a-zA-Z0-9._-]+)/gm;
		
		let result;
		do 
		{
			result = regexp.exec(this.originalSrc);
			if(result) 
			{
				const shaderId = result[1];
				let shader = Engine.ctx.getResource(shaderId);
				if(!shader) {
					console.warn("(Shader.analyseImports) No such shader registered: " + shaderId);
					break;
				}

				if(!this.imports) {
					this.imports = [ shader ];
				}
				else {
					this.imports.push(shader);
				}

				shader.subscribe(this, this.handleLoad);

				if(!shader.loaded) {
					this.numToLoad++;
				}
			}
		} while(result);

		if(this.imports && this.imports.length > 0) {
			this.originalSrc = this.originalSrc.replace(regexp, "");
		}

		if(this.numToLoad === 0) {
			this.loading = false;
			this.loaded = true;
		}
	}

	handleLoad(value)
	{
		if(value) 
		{
			this.numToLoad--;
			if(this.numToLoad === 0) {
				this.loading = false;
				this.loaded = true;
			}
		}
		else {
			this.numToLoad++;
			this.loaded = false;
			this.loading = true;
		}
	}

	set src(src) 
	{
		if(src === this.originalSrc) { return; }

		this.originalSrc = src;
		this.analyseImports();
	}

	get src() {
		return this._src;
	}	

	set loaded(value) 
	{
		if(this._loaded === value) { return; }
		this._loaded = value;

		if(value) 
		{
			if(this.imports)
			{
				let result = "";

				for(let n = 0; n < this.imports.length; n++) {
					result += this.imports[n].src + "\n\n";
				}

				this._src = result + this.originalSrc;
			}
			else {
				this._src = this.originalSrc;
			}
		}

		this.emit(value);
	}

	get loaded() {
		return this._loaded;
	}
}