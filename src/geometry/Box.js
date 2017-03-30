import BoxMesh from "./BoxMesh"
import Geometry from "../scene/Geometry"

class Box extends Geometry
{
	constructor(width, height, depth, widthSegments, heightSegments, depthSegments) {
		const mesh = BoxMesh(width, height, depth,widthSegments, heightSegments, depthSegments)
		super(mesh)
	}
}

export default Box
