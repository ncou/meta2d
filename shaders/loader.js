import basicVert from "./webgl/basic-vert.glsl";
import basicFrag from "./webgl/basic-frag.glsl";
import textureVert from "./webgl/texture-vert.glsl";
import textureFrag from "./webgl/texture-frag.glsl";

export default function load(resources)
{
	resources.load({
		"basic-vert": {
			type: "Shader",
			src: basicVert
		},
		"basic-frag": {
			type: "Shader",
			src: basicFrag
		},
		"texture-vert": {
			type: "Shader",
			src: textureVert
		},
		"texture-frag": {
			type: "Shader",
			src: textureFrag
		}		
	});
}
