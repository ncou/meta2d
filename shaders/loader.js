import basicVert from "./webgl/basic-vert.glsl";
import basicFrag from "./webgl/basic-frag.glsl";
import debugVert from "./webgl/debug-vert.glsl";
import debugFrag from "./webgl/debug-frag.glsl";
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
		"debug-vert": {
			type: "Shader",
			src: debugVert
		},
		"debug-frag": {
			type: "Shader",
			src: debugFrag
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
