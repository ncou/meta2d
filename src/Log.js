
const error = function(type, msg) 
{
	if(msg) {
		console.error(`${type}: ${msg}`)
	}
	else {
		console.error(`${type}`)
	}
}

const warn = function(type, msg) 
{
	if(msg) {
		console.warn(`${type}: ${msg}`)
	}
	else {
		console.warn(`${type}`)
	}
}

export { error, warn }