
// TODO: Remove default values, they should be handled by engine normally
const Flags = {
	webGL: true,
	audioAPI: true,
	culling: true
}

const parse = function()
{
	const buffer = window.location.hash.substr(1).split(",")
	for(let n = 0; n < buffer.length; n++) {
		const flag = buffer[n]
		const flagSepIndex = flag.indexOf("=")
		if(flagSepIndex > 0) {
			const flagName = flag.substr(0, flagSepIndex).replace(/ /g, "")
			const flagValue = eval(flag.substr(flagSepIndex + 1).replace(/ /g, ""))
			Flags[flagName] = flagValue
		}
	}
}

parse()

export default Flags
