
const Engine =
{
	engineCtxCls: null,

	create(cfg) {
		const instance = new Engine.engineCtxCls(cfg)
		return instance
	},

	resource(id) 
	{
		const resource = Engine.resources.map[id]
		return resource || null
	},

	set camera(camera) 
	{
		if(this._camera === camera) { return }

		if(this._camera) {
			this._camera.enable = false
		}

		camera.enable = true
		this._camera = camera
	},

	get camera() {
		return this._camera
	},

	settings: null,
	window: null,
	input: null,
	renderer: null,
	resources: null,
	layer: null,

	_camera: null
}

export default Engine
