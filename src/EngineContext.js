import Device from "./Device"
import Engine from "./Engine"
import Time from "./Time"
import EngineWindow from "./EngineWindow"
import ResourceManager from "./resources/ResourceManager"
import Renderer from "./graphics/Renderer"
import Input from "./Input"
import loadCoreShaders from "../shaders/loader"
import Scene from "./scene/Scene"

class EngineContext
{
	constructor(cfg)
	{
		this.cfg = cfg || {}
		
		Engine.settings = this.cfg.settings || {}
		Engine.window = new EngineWindow(Engine.settings)
		Engine.renderer = new Renderer()
		Engine.input = new Input()
		Engine.time = new Time()
		Engine.resources = new ResourceManager()

		Engine.scene = new Scene()
		Engine.scene.enable = true

		this.setup()
	}

	setup()
	{
		loadCoreShaders()

		Engine.renderer.setup()

		Engine.window.on("resize", this.handleWindowResize.bind(this))
		this.handleWindowResize(this.window)

		if(Engine.settings.store) {
			const data = Engine.settings.store.data
			if(data.assets) {
				Engine.resources.load(data.assets)
			}
			if(data.hierarchy) {
				
			}
		}

		Engine.resources.load(this.cfg.resources)
		Engine.resources.on("load", () => {
			this.ready()
		})

		this.renderFunc = () => {
			this.render()
		}

		Engine.scene.load(this.cfg.hierarchy)

		if(this.cfg.setup) {
			this.cfg.setup()
		}

		if(Engine.resources.loaded) {
			this.ready()
		}
	}

	ready()
	{
		if(this.cfg.ready) {
			this.cfg.ready()
		}

		this.renderFunc()
	}

	handleWindowResize() {
		Engine.renderer.resize(Engine.window.width, Engine.window.height)
	}

	render()
	{
		Engine.time.start()

		if(this.cfg.update) {
			this.cfg.update(Engine.time.deltaF)
		}

		Engine.renderer.update(Engine.time.deltaF)
		Engine.renderer.render(Engine.time.deltaF)

		if(this.cfg.render) {
			this.cfg.render(Engine.time.deltaF)
		}

		Engine.time.end()
		requestAnimationFrame(this.renderFunc)
	}
}

Engine.engineCtxCls = EngineContext
