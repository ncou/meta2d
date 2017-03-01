import Engine from "../Engine"
import Resource from "../resources/Resource"
import fetchContent from "../utils/FetchContent"

export default class Shader extends Resource
{
	constructor(cfg) 
	{
		this.imports = null
		this.importStrPos = 0
		this.numToLoad = 0
		this._src = null
		this.originalSrc = null

		super(cfg)
	}

	load(cfg)
	{
		this.loaded = false;

		if(typeof cfg === "string") 
		{
			this.loading = true;

			fetchContent(cfg.path, 
				(src) => { this.src = src; }, 
				() => { failed(); });
		}
		else if(cfg.src) {
			this.src = cfg.src;
		}
		else if(cfg.path)
		{
			this.loading = true;

			fetchContent(cfg.path, 
				(src) => { this.src = src; }, 
				() => { failed(); });
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

		const regexp = /import ([a-zA-Z0-9\/._-]+)/gm
		
		let result
		do 
		{
			result = regexp.exec(this.originalSrc)
			if(result) 
			{
				const shaderId = result[1]
				let shader = Engine.ctx.resource(shaderId)
				if(!shader) {
					console.warn("(Shader.analyseImports) No such shader registered: " + shaderId)
					break;
				}

				if(!this.imports) {
					this.imports = [ shader ]
				}
				else {
					this.imports.push(shader)
				}

				if(this.imports.length === 1) {
					this.importStrPos = result.index
				}

				shader.subscribe(this, this.handleLoad)

				if(!shader.loaded) {
					this.numToLoad++
				}
			}
		} while(result)

		if(this.imports && this.imports.length > 0) {
			this.originalSrc = this.originalSrc.replace(regexp, "")
		}

		if(this.numToLoad === 0) {
			this.finalize()
			this.loading = false
		}
		else {
			this.loading = true
		}
	}

	handleLoad(value)
	{
		if(value) 
		{
			this.numToLoad--
			if(this.numToLoad === 0) 
			{
				this.finalize()
				this.loading = false
			}
		}
		else {
			this.numToLoad++
			this.loaded = false
		}
	}

	finalize() 
	{
		if(this.imports) 
		{
			let result = ""

			for(let n = this.imports.length - 1; n >= 0; n--) {
				const shader = this.imports[n]
				result += shader.src + "\n"
			}

			this._src = this.originalSrc.slice(0, this.importStrPos) + result + this.originalSrc.slice(this.importStrPos)
		}
		else {
			this._src = this.originalSrc
		}
	}

	set src(src) 
	{
		if(src === this.originalSrc) { return }

		this.originalSrc = src
		this.analyseImports()

		if(this.loading) { return }

		this.finalize()
		this.loaded = true
	}

	get src() {
		return this._src;
	}
}