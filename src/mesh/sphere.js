import { Geometry } from "../geometry";

export function sphere(ctx, radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength)
{
	let vertices = null;
	let indices = null;
	let uvs = null;
	let normals = null;

	var latitudeBands = 30;
	var longitudeBands = 30;
	var radius = 2;
	var vertexPositionBuffer;
	var vertexNormalBuffer;
	var vertexTextureCoordBuffer;
	var vertexIndexBuffer;

	var vertexPositionData = [];
	var normalData = [];
	var textureCoordData = [];

	for(var latNumber = 0; latNumber <= latitudeBands; latNumber++) 
	{
		var theta = latNumber * Math.PI / latitudeBands;
		var sinTheta = Math.sin(theta);
		var cosTheta = Math.cos(theta);
		for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
			var phi = longNumber * 2 * Math.PI / longitudeBands;
			var sinPhi = Math.sin(phi);
			var cosPhi = Math.cos(phi);
			var x = cosPhi * sinTheta;
			var y = cosTheta;
			var z = sinPhi * sinTheta;
			var u = 1- (longNumber / longitudeBands);
			var v = latNumber / latitudeBands;
			normalData.push(x);
			normalData.push(y);
			normalData.push(z);
			textureCoordData.push(u);
			textureCoordData.push(v);
			vertexPositionData.push(radius * x);
			vertexPositionData.push(radius * y);
			vertexPositionData.push(radius * z);
		}
	}

	var indexData = [];
	for(var latNumber = 0; latNumber < latitudeBands; latNumber++) 
	{
		for(var longNumber = 0; longNumber < longitudeBands; longNumber++) 
		{
			var first = (latNumber * (longitudeBands + 1)) + longNumber;
			var second = first + longitudeBands + 1;
			indexData.push(first);
			indexData.push(second);
			indexData.push(first + 1);
			indexData.push(second);
			indexData.push(second + 1);
			indexData.push(first + 1);
		}
	}

	const geometry = new Geometry(ctx, vertexPositionData, 
								new ( vertexPositionData.count > 65535 ? Uint32Array : Uint16Array )( indexData, 1 ),
								textureCoordData,
								normalData);
	return geometry;
}