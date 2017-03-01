import Mesh from "../graphics/Mesh"

let vertices = null
let indices = null
let uvs = null
let normals = null

let vertexOffset = 0
let uvOffset = 0
let indexOffset = 0
let vertexIndex = 0

export default function Box(width, height, depth, widthSegments, heightSegments, depthSegments) 
{
	if(width === undefined) { width = 1.0 }
	if(height === undefined) { height = width }
	if(depth === undefined) { depth = width }

	if(widthSegments === undefined) { widthSegments = 1.0 }
	if(heightSegments === undefined) { heightSegments = widthSegments }
	if(depthSegments === undefined) { depthSegments = widthSegments }

	const halfWidth = width / 2
	const halfHeight = height / 2
	const halfDepth = depth / 2

	const numVertices = (widthSegments + 1) * (heightSegments + 1) * 2 + 
				(widthSegments + 1) * (depthSegments + 1) * 2 + 
				(depthSegments + 1) * (heightSegments + 1) * 2;
	const numIndices = ((widthSegments * heightSegments * 2) + 
				(widthSegments * depthSegments * 2) +
				(depthSegments * heightSegments * 2)) * 6

	vertices = new Float32Array(numVertices * 3)
	indices = new (numIndices > 65535 ? Uint32Array : Uint16Array)(numIndices)
	uvs = new Float32Array(numVertices * 2)
	normals = new Float32Array(numVertices * 3)

	buildPlane(2, 1, 0, depth, height, width, depthSegments, heightSegments, -1, -1)
	buildPlane(2, 1, 0, depth, height, -width, depthSegments, heightSegments, 1, -1)
	buildPlane(0, 2, 1, width, depth, height, widthSegments, depthSegments, 1, 1)
	buildPlane(0, 2, 1, width, depth, -height, widthSegments, depthSegments, 1, -1)
	buildPlane(0, 1, 2, width, height, depth, widthSegments, heightSegments, 1, -1)
	buildPlane(0, 1, 2, width, height, -depth, widthSegments, heightSegments, -1, -1)

	const mesh = new Mesh(vertices, indices, uvs, normals)

	vertices = null
	indices = null
	uvs = null
	normals = null

	vertexOffset = 0
	uvOffset = 0
	indexOffset = 0
	vertexIndex = 0

	return mesh
}

function buildPlane(u, v, w, width, height, depth, gridX, gridY, udir, vdir) 
{
	const segmentWidth = width / gridX
	const segmentHeight = height / gridY

	const widthHalf = width / 2
	const heightHalf = height / 2
	const depthHalf = depth / 2
	const normalW = depth > 0 ? 1 : - 1

	const gridX1 = gridX + 1
	const gridY1 = gridY + 1

	for(let iy = 0; iy < gridY1; iy++) 
	{
		const y = iy * segmentHeight - heightHalf

		for(let ix = 0; ix < gridX1; ix++) 
		{
			const x = ix * segmentWidth - widthHalf

			vertices[vertexOffset + u] = x * udir
			vertices[vertexOffset + v] = y * vdir
			vertices[vertexOffset + w] = depthHalf

			normals[vertexOffset + u] = 0
			normals[vertexOffset + v] = 0
			normals[vertexOffset + w] = normalW

			uvs[uvOffset] = ix / gridX
			uvs[uvOffset + 1] = 1 - (iy / gridY)

			vertexOffset += 3
			uvOffset += 2
		}
	}

	for(let iy = 0; iy < gridY; iy++) 
	{
		for(let ix = 0; ix < gridX; ix++) 
		{
			const a = vertexIndex + ix + gridX1 * (iy + 1)
			const b = vertexIndex + (ix + 1) + gridX1 * iy

			indices[indexOffset] = vertexIndex + ix + gridX1 * iy
			indices[indexOffset + 1] = a
			indices[indexOffset + 2] = b

			indices[indexOffset + 3] = a
			indices[indexOffset + 4] = vertexIndex + (ix + 1) + gridX1 * (iy + 1)
			indices[indexOffset + 5] = b

			indexOffset += 6
		}
	}

	vertexIndex += (gridX1 * gridY1)
}
