import Time from "./Time";
import EngineWindow from "./EngineWindow";
import ResourceManager from "./resources/ResourceManager";
import Renderer from "./graphics/Renderer";
import Input from "./input";
import loadCoreShaders from "../shaders/loader";

export default class Engine
{
	constructor(cfg)
	{		
		cfg = cfg || {};
		cfg.settings = cfg.settings || {};

		this.cfg = cfg;
		this.window = new EngineWindow(cfg.settings);
		this.window.on("resize", this.handleWindowResize.bind(this));
		this.gl = this.window.gl;

		this.time = new Time();
		this.renderer = new Renderer(this.gl);
		this.handleWindowResize(this.window);

		Engine.ctx = this;
		Engine.gl = this.gl;
		Engine.renderer = this.renderer;

		this.resources = new ResourceManager();
		loadCoreShaders(this.resources);
		this.resources.load(cfg.resources);	

		cfg.gl = this.gl;
		cfg.ctx = this;
		cfg.renderer = this.renderer;

		this.setup();

		if(this.resources.loaded) {
			this.ready();
		}

		this.resources.on("load", () => {
			this.ready();
		});		
	}

	setup() 
	{
		this.renderFunc = () => {
			this.render();
		};

		if(this.cfg.setup) {
			this.cfg.setup();
		}
	}

	ready() 
	{
		Engine.ctx = this;
		Engine.gl = this.gl;
		Engine.renderer = this.renderer;

		if(this.cfg.ready) {
			this.cfg.ready();
		}	

		this.renderFunc();
	}

	handleWindowResize(window) {
		this.renderer.resize(window.width, window.height);
	}

	render()
	{
		this.time.start();

		Engine.ctx = this;
		Engine.gl = this.gl;
		Engine.renderer = this.renderer;

		if(this.cfg.update) {
			this.cfg.update(this.time.deltaF);
		}
		this.renderer.update(this.time.deltaF);

		this.renderer.render(this.time.deltaF);

		if(this.cfg.render) {
			this.cfg.render(this.time.deltaF);
		}

		this.time.end();
		requestAnimationFrame(this.renderFunc);
	}

	resource(id) 
	{
		const resource = this.resources.map[id];
		return resource || null;
	}
}
