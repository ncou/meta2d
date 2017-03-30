import SphereMesh from "./SphereMesh"
import Geometry from "../scene/Geometry"

class Box extends Geometry
{
	constructor(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength) {
		const mesh = SphereMesh(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength)
		super(mesh)
	}
}

export default Box
