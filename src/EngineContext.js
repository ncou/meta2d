import Device from "./Device";
import Engine from "./Engine";
import Time from "./Time";
import EngineWindow from "./EngineWindow";
import ResourceManager from "./resources/ResourceManager";
import Renderer from "./graphics/Renderer";
import Camera from "./scene/Camera";
import Input from "./Input";
import loadCoreShaders from "../shaders/loader";

let engineId = 0;

class EngineContext
{
	constructor(cfg)
	{		
		cfg = cfg || {};
		cfg.settings = cfg.settings || {};

		this.id = engineId++;
		this.cfg = cfg;
		this.window = new EngineWindow(cfg.settings);
		this.window.on("resize", this.handleWindowResize.bind(this));
		this.gl = this.window.gl;

		this.camera = new Camera();
		this.input = new Input();
		this.time = new Time();
		this.renderer = new Renderer(this.gl);
		this.resources = new ResourceManager();

		this.handleWindowResize(this.window);

		this.activateEngineContext();

		this.setup();
	}

	setup() 
	{
		loadCoreShaders(this.resources);
		this.renderer.setup();
		this.resources.load(this.cfg.resources);

		this.resources.on("load", () => {
			this.ready();
		});	

		this.renderFunc = () => {
			this.render();
		};

		if(this.cfg.setup) {
			this.cfg.setup();
		}

		if(this.resources.loaded) {
			this.ready();
		}
	}

	ready() 
	{
		this.activateEngineContext();

		if(this.cfg.ready) {
			this.cfg.ready();
		}	

		this.renderFunc();
	}

	handleWindowResize() {
		this.renderer.resize(this.window.width, this.window.height);
	}

	render()
	{
		this.time.start();

		this.activateEngineContext();

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

	activateEngineContext()
	{
		if(Engine.id === this.id) { return; }

		Engine.id = this.id;
		Engine.ctx = this;
		Engine.gl = this.gl;
		Engine.window = this.window;
		Engine.renderer = this.renderer;
		Engine.input = this.input;	
		Engine.camera = this.camera;
	}
}

Engine.clsPtr = EngineContext;