import Meta from "./meta";
// import { Matrix4 } from "math/matrix4";
// import { sphere } from "geometry/sphere";
// import { Plane } from "geometry/plane";
// import { Geometry } from "geometry/geometry";
import { box } from "./geometry/box";
import Geometry from "./geometry";

import Tilemap from "./tilemap/tilemap";
import "./substance/SubstanceMaterial";

// export function main()
// {
// 	const meta = new Meta({
// 		resources: {
// 			basicMaterial: {
// 				type: "material",
// 				vert: "assets/shaders/basicVert.glsl",
// 				frag: "assets/shaders/basicFrag.glsl"
// 			},			
// 			tilemapMaterial: {
// 				type: "material",
// 				vert: "assets/shaders/tilemapVert.glsl",
// 				frag: "assets/shaders/tilemapFrag.glsl"
// 			},
// 			spritesheet: {
// 				type: "texture",
// 				path: "assets/tilemap/spelunky-tiles.png"
// 			},
// 			layer0: {
// 				type: "texture",
// 				path: "assets/tilemap/spelunky0.png"
// 			}
// 		},
// 		setup() 
// 		{
// 			const ctx = this.ctx;

// 			this.tilemap = new Tilemap(ctx, "spritesheet", 16, 2);
// 			this.tilemap.createLayer("layer0");
// 		},
// 		draw()
// 		{
// 			this.tilemap.draw(this.ctx);
// 		}
// 	});
// }

const verts = [
	-1, -1, 0,
	1, -1, 0,
	1, 1, 0,
	-1, 1, 0
];

const uv = [
	0, 1,
	1, 1,
	1, 0,
	0, 0
];

const indices = [
	0, 1, 2, 0, 2, 3
];

export function main()
{
	const engine = new Meta({
		resources: 
		{
			// tileMaterial: {
			// 	type: "material",
			// 	vert: "assets/shaders/_tileVert.glsl",
			// 	frag: "assets/shaders/_tileFrag.glsl"
			// },
			SphereRoughness: {
				type: "Texture",
				path: "assets/Sphere_Roughness.png"
			},
			SphereBaseColor: {
				type: "Texture",
				path: "assets/Sphere_Base_Color.png"
			},
			SphereMetallic: {
				type: "Texture",
				path: "assets/Sphere_Metallic.png"
			},
			SphereNormal: {
				type: "Texture",
				path: "assets/Sphere_Normal.png"
			},
			SphereHeight: {
				type: "Texture",
				path: "assets/Sphere_Height.png"
			},
			substanceMaterial: {
				type: "SubstanceMaterial",
				vert: "assets/shaders/substanceVert.glsl",
				frag: "assets/shaders/pbr.glsl"
			},
			basicMaterial: {
				type: "Material",
				vert: "assets/shaders/basicVert.glsl",
				frag: "assets/shaders/basicFrag.glsl"
			},			
			sphereMesh: {
				type: "Mesh",
				path: "assets/mesh/sphere.obj"
			}		
		},
		ready()
		{
			const gl = this.gl;

			// gl.enable(gl.DEPTH_TEST);
			// gl.enable(gl.CULL_FACE);
			// gl.cullFace(gl.FRONT);
			gl.enable(gl.DEPTH_TEST);
			
			// gl.enable(gl.BLEND);
			// gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

			this.box = box(gl, 1);
			this.plane = new Geometry(gl, verts, indices, uv);

			this.camera = new Float32Array([ 0.0, 0.0, 0.0 ]);

			this.substanceMaterial = this.ctx.getResource("substanceMaterial");
			this.basicMaterial = this.ctx.getResource("basicMaterial");
			this.sphereRoughness = this.ctx.getResource("SphereRoughness");
			this.sphereBaseColor = this.ctx.getResource("SphereBaseColor");
			this.sphereMetallic = this.ctx.getResource("SphereMetallic");
			this.sphereNormal = this.ctx.getResource("SphereNormal");
			this.sphereHeight = this.ctx.getResource("SphereHeight");

			const mesh = this.ctx.getResource("sphereMesh").mesh;
			// this.meshConstructed = new Geometry(gl, mesh.vertices, mesh.indices, mesh.);
			this.meshConstructed = new Geometry(gl, mesh.vertices, mesh.indices, mesh.uvs, mesh.normals);

			this.angle = 0;
		},
		render()
		{
			const gl = this.gl;
			const ctx = this.ctx;

			this.geometry = this.meshConstructed;
			this.material = this.substanceMaterial;

			this.angle += 0.01;

			ctx.setMaterial(this.material);
			ctx.viewMatrix.identity();
			ctx.viewMatrix.translate(0, 0, -2);
			// ctx.viewMatrix.rotate(this.angle, 0, 0, 1);
			// ctx.viewMatrix.rotate(-2.4, 0, 1, 0);
			ctx.viewMatrix.rotate(this.angle, 1, .3, 0.5);

			ctx.normalMatrix.copy(ctx.viewMatrix);
			ctx.normalMatrix.inverse();
			ctx.normalMatrix.transpose();

			// ctx.viewMatrix.identity();
			// ctx.viewMatrix.translate(0, 0, -5);
			// ctx.viewMatrix.rotate(this.angle, 1, 0, 0);

			gl.uniformMatrix4fv(this.material.uniform.matrixProjection, false, ctx.projectionMatrix.m);
			gl.uniformMatrix4fv(this.material.uniform.matrixModelView, false, ctx.viewMatrix.m);
			gl.uniformMatrix4fv(this.material.uniform.matrixNormal, false, ctx.normalMatrix.m);

			gl.bindBuffer(gl.ARRAY_BUFFER, this.geometry.vbo);
			gl.vertexAttribPointer(this.material.attrib.position, 3, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, this.geometry.uvBuffer);
			gl.vertexAttribPointer(this.material.attrib.uv, 2, gl.FLOAT, false, 0, 0); 

			gl.bindBuffer(gl.ARRAY_BUFFER, this.geometry.normalBuffer);
			gl.vertexAttribPointer(this.material.attrib.normal, 3, gl.FLOAT, false, 0, 0);

			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.sphereRoughness.texture);
			gl.uniform1i(this.material.uniform.roughness_tex, 0);
			gl.bindTexture(gl.TEXTURE_2D, this.sphereBaseColor.texture);
			gl.uniform1i(this.material.uniform.basecolor_tex, 0);
			gl.bindTexture(gl.TEXTURE_2D, this.sphereMetallic.texture);
			gl.uniform1i(this.material.uniform.metallic_tex, 0);
			gl.bindTexture(gl.TEXTURE_2D, this.sphereHeight.texture);
			gl.uniform1i(this.material.uniform.height_texture, 0);
			gl.bindTexture(gl.TEXTURE_2D, this.sphereNormal.texture);
			gl.uniform1i(this.material.uniform.normal_texture, 0);
			gl.uniform1i(this.material.uniform.base_normal_texture, 0);	

			gl.uniform1f(this.material.uniform.unlit_outline_thickness, 0.4);
			gl.uniform1f(this.material.uniform.lit_outline_thickness, 0.1);
			gl.uniform3fv(this.material.uniform.camera_pos, this.camera);

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.geometry.ibo);
			gl.drawElements(gl.TRIANGLES, this.geometry.indices.length, gl.UNSIGNED_SHORT, 0);	

		}
	});
}

// export function main() 
// {
// 	const viewer = new Viewer({
		// settings: {
		// 	width: 1024,
		// 	height: 576
		// },
// 		resources: {
// 			Texture: {
// 				customTexture: "assets/PinkTile.png",
// 				pisa: "assets/envmaps/pisa_preview.jpg"
// 			},
// 			Cubemap: {
// 				debug: [ 
// 					"assets/envmaps/test_px.png", 
// 					"assets/envmaps/test_nx.png", 
// 					"assets/envmaps/test_py.png", 
// 					"assets/envmaps/test_ny.png", 
// 					"assets/envmaps/test_pz.png", 
// 					"assets/envmaps/test_nz.png"
// 				],
// 				pisa: [
// 					"assets/envmaps/pisa_px.jpg", 
// 					"assets/envmaps/pisa_nx.jpg", 
// 					"assets/envmaps/pisa_py.jpg", 
// 					"assets/envmaps/pisa_ny.jpg", 
// 					"assets/envmaps/pisa_pz.jpg", 
// 					"assets/envmaps/pisa_nz.jpg"
// 				]
// 			},
// 			HDR: {
// 				pisa: "assets/envmaps/pisa_latlong_256.hdr"
// 			},
// 			Shader: {
// 				basic: "assets/materials/basic",
// 				reflection: "assets/materials/reflection",
// 				skybox: "assets/materials/skybox",
// 				skybox2: "assets/materials/skybox2",
// 			},
// 			shader: {
// 				basic: "assets/shaders/"
// 			}
// 		},
// 		setup: function()
// 		{


// 			const gl = this.gl;

			// gl.enable(gl.DEPTH_TEST);
			// // gl.enable(gl.CULL_FACE);
			// gl.cullFace(gl.BACK);

// 			this.geometry = null;
// 			this.cubemapGeometry = box(this.gl, 1);
// 			this.sphere = sphere(this.gl, 1);
// 			this.box = box(this.gl, 1);

// 			const skyboxVertices = [ -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0 ];
// 			const skyboxFaces = [ 0, 1, 2, 0, 2, 3 ];
// 			this.skybox = new Geometry(this.gl, skyboxVertices, skyboxFaces);

// 			// console.log(createBox2(1))

// 		// const plane = new Plane(this.gl, 2, 2);
// 			// const sphere = Sphere(1, 64, 64); 

// 			// // this.geometry = this.createGeometry(vertices, cubeVertexIndices, null, vertexNormals);
// 			// this.shader = this.resources.getShader("lighting");
// 			this.basicShader = this.resources.getShader("basic");
// 			this.skyboxShader = this.resources.getShader("skybox");
// 			this.skyboxShader2 = this.resources.getShader("skybox2");
// 			this.reflectionShader = this.resources.getShader("reflection");
// 			// // this.sphere = new Sphere(this.gl, 5, 16, 16);

// 			this.texture = this.resources.getTexture("customTexture");
// 			this.skyboxTexture = this.resources.getTexture("pisa");
// 			this.skyboxHDR = this.resources.get("HDR", "pisa");
// 			this.angle = 0;
// 			this.exposure = 3;

// 			this.cubemap = this.resources.getCubemap("pisa");

// 			this.prevX = 0;
// 			this.prevY = 0;

// 			window.addEventListener("mousemove", (event) => {

// 				// this.prevX = event.x;
// 				// this.prevY = event.y;
// 			});
// 		},
// 		update: function(tDelta)
// 		{
// 			this.angle += tDelta * 0.001;
// 		},
// 		draw: function()
// 		{
// 			const gl = this.gl;

// 			//
// 			gl.disable(gl.DEPTH_TEST);
// 			this.geometry = this.skybox;
			// this.bindShader(this.skyboxShader2);

			// this.viewMatrix.identity();
			// this.viewMatrix.translate(0, 0, -6);
			// this.viewMatrix.rotate(Math.PI, 0, 1, 0);

			// gl.uniformMatrix4fv(this.shader.uniform.projectionMatrix, false, this.projectionMatrix.m);
			// gl.uniformMatrix4fv(this.shader.uniform.viewMatrix, false, this.viewMatrix.m);
			// gl.uniform1f(this.shader.uniform.exposure, this.exposure);

			// gl.bindBuffer(gl.ARRAY_BUFFER, this.geometry.vbo);
			// gl.vertexAttribPointer(this.shader.attrib.position, 3, gl.FLOAT, false, 0, 0);

			// gl.activeTexture(gl.TEXTURE0);
			// gl.bindTexture(gl.TEXTURE_2D, this.skyboxHDR.texture);
			// gl.uniform1i(this.shader.uniform.texture, 0);	

			// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.geometry.ibo);
			// gl.drawElements(gl.TRIANGLES, this.geometry.indices.length, gl.UNSIGNED_SHORT, 0);	

// 			//
// 			gl.enable(gl.DEPTH_TEST);
// 			gl.cullFace(gl.BACK);

// 			this.geometry = this.sphere;
// 			this.bindShader(this.reflectionShader);

// 			this.modelViewMatrix.identity();
// 			this.modelViewMatrix.translate(0, 0, -6);
// 			this.modelViewMatrix.rotate(Math.PI, 0, 1, 0);
			
// 			let inverseViewMatrix = new Matrix4();
// 			inverseViewMatrix.copy(this.modelViewMatrix);
// 			inverseViewMatrix.inverse();
// 			// inverseViewMatrix.transpose();

// 			this.normalMatrix.copy(this.modelViewMatrix);
// 			this.normalMatrix.inverse();
// 			this.normalMatrix.transpose();

// 			gl.uniformMatrix4fv(this.shader.uniform.projectionMatrix, false, this.projectionMatrix.m);
// 			gl.uniformMatrix4fv(this.shader.uniform.modelViewMatrix, false, this.modelViewMatrix.m);
// 			gl.uniformMatrix4fv(this.shader.uniform.normalMatrix, false, this.normalMatrix.m);
// 			gl.uniformMatrix4fv(this.shader.uniform.inverseViewMatrix, false, inverseViewMatrix.m);
// 			gl.uniform1f(this.shader.uniform.exposure, this.exposure);

// 			gl.bindBuffer(gl.ARRAY_BUFFER, this.geometry.vbo);
// 			gl.vertexAttribPointer(this.shader.attrib.position, 3, gl.FLOAT, false, 0, 0);

			// gl.bindBuffer(gl.ARRAY_BUFFER, this.geometry.normalBuffer);
			// gl.vertexAttribPointer(this.shader.attrib.normal, 3, gl.FLOAT, false, 0, 0);  

			// gl.activeTexture(gl.TEXTURE0);
			// gl.bindTexture(gl.TEXTURE_2D, this.skyboxHDR.texture);
			// gl.uniform1i(this.shader.uniform.envMap, 0);

// 			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.geometry.ibo);
// 			gl.drawElements(gl.TRIANGLES, this.geometry.indices.length, gl.UNSIGNED_SHORT, 0);		
// 		}			
// 	});
// }
