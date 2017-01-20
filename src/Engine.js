
export default 
{
	clsPtr: null,

	create(cfg) {
		const instance = new this.clsPtr(cfg);
	},

	ctx: null,
	gl: null,
	renderer: null
}
