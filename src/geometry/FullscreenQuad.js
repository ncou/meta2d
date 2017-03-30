import Mesh from "../graphics/Mesh"

const FullscreenQuad = function()
{
	const vertices = new Float32Array([ -1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0 ])
	const indices = new Uint16Array([ 0, 2, 1, 0, 3, 2 ])
	const mesh = new Mesh({ 
		vertices, 
		indices
	})

	return mesh
}

export default FullscreenQuad