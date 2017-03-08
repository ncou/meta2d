
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

	settings: null,
	window: null,
	input: null,
	renderer: null,
	resources: null,

	state: "init"
}

export default Engine
