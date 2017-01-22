
export default 
{
	clsPtr: null,

	create(cfg) {
		const instance = new this.clsPtr(cfg);
	},

	id: -1,
	ctx: null,
	gl: null,
	renderer: null,
	camera: null
}
