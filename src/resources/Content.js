import Resource from "./Resource"
import fetchContent from "../utils/FetchContent"

class Content extends Resource
{
	constructor(cfg) 
	{
		this.path = null;
		this.content = null;

		super(cfg);
	}

	load(cfg)
	{
		this.loaded = false;
		this.content = null;

		let path;

		if(typeof cfg === "string") {
			path = cfg;
		}
		else {
			path = cfg.path;
		}

		if(!path) {
			console.warn("(Content) Invalid path passed"); 
			return;
		}

		this.path = path;
		this.loading = true;
		fetchContent(path, this.loadContent.bind(this), this.onLoadError.bind(this));
	}

	loadContent(text)
	{
		this.content = text;
		this.loading = false;
		this.loaded = true;
	}

	onLoadError(error) {
		this.loading = false;
		console.warn("(Content) Error occurred while loading: " + error);
	}
}
