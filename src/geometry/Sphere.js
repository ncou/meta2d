import Mesh from "../graphics/Mesh"

const Sphere = function(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength) 
{
	radius = radius || 1
	widthSegments = widthSegments || 32
	heightSegments = heightSegments || 32

	phiStart = (phiStart !== undefined) ? phiStart : 0
	phiLength = (phiLength !== undefined) ? phiLength : Math.PI * 2
	thetaStart = (thetaStart !== undefined) ? thetaStart : 0
	thetaLength = (thetaLength !== undefined) ? thetaLength : Math.PI

	const thetaEnd = thetaStart + thetaLength

	const grid = []
	const indices = []
	const vertices = []
	const normals = []
	const uvs = []

	let indexVertices = 0
	let indexIndices = 0
	let indexNormals = 0
	let indexUvs = 0
	let indexGrid = 0

	for(let ny = 0; ny <= heightSegments; ny++) 
	{
		const verticesRow = []
		const v = ny / heightSegments

		for(let nx = 0; nx <= widthSegments; nx++) 
		{
			const u = nx / widthSegments

			const x = - radius * Math.cos( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );
			const y = radius * Math.cos( thetaStart + v * thetaLength );
			const z = radius * Math.sin( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );

			vertices[indexVertices++] = x
			vertices[indexVertices++] = y
			vertices[indexVertices++] = z

			let length = x * x + y * y + z * z
			if(length > 0) 
			{
				length = 1 / Math.sqrt(length)
				normals[indexNormals++] = x * length
				normals[indexNormals++] = y * length
				normals[indexNormals++] = z * length
			}
			else 
			{
				normals[indexNormals++] = 0
				normals[indexNormals++] = 0
				normals[indexNormals++] = 0
			}

			uvs[indexUvs++] = u
			uvs[indexUvs++] = 1 - v

			verticesRow.push(indexGrid++)
		}

		grid.push(verticesRow)
	}

	for(let ny = 0; ny < heightSegments; ny++) 
	{
		for(let nx = 0; nx < widthSegments; nx++) 
		{
			const a = grid[ny][nx + 1]
			const b = grid[ny][nx]
			const c = grid[ny + 1][nx]
			const d = grid[ny + 1][nx + 1]

			if(ny !== 0 || thetaStart > 0) 
			{
				indices[indexIndices++] = a
				indices[indexIndices++] = b
				indices[indexIndices++] = d
			}

			if(ny !== heightSegments - 1 || thetaEnd < Math.PI) 
			{
				indices[indexIndices++] = b
				indices[indexIndices++] = c
				indices[indexIndices++] = d
			}
		}

	}

	const mesh = new Mesh(vertices, indices, uvs, normals)
	return mesh
}

export default Sphere
