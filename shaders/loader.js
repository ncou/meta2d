import BasicVert from "./webgl/basic-vert.glsl"
import BasicFrag from "./webgl/basic-frag.glsl"
import DebugVert from "./webgl/debug-vert.glsl"
import DebugFrag from "./webgl/debug-frag.glsl"
import TextureVert from "./webgl/texture-vert.glsl"
import TextureFrag from "./webgl/texture-frag.glsl"
import LambertVert from "./webgl/lambert-vert.glsl"
import LambertFrag from "./webgl/lambert-frag.glsl"
import ReflectionVert from "./webgl/reflection-vert.glsl"
import ReflectionFrag from "./webgl/reflection-frag.glsl"
import SkyboxVert from "./webgl/skybox-vert.glsl"
import SkyboxFrag from "./webgl/skybox-frag.glsl"
import Gamma from "./webgl/gamma.glsl"

export default function load(resources)
{
	resources.load({
		"gamma.glsl": {
			type: "Shader",
			src: Gamma
		},
		"basic-vert": {
			type: "Shader",
			src: BasicVert
		},
		"basic-frag": {
			type: "Shader",
			src: BasicFrag
		},
		"debug-vert": {
			type: "Shader",
			src: DebugVert
		},
		"debug-frag": {
			type: "Shader",
			src: DebugFrag
		},
		"texture-vert": {
			type: "Shader",
			src: TextureVert
		},
		"texture-frag": {
			type: "Shader",
			src: TextureFrag
		},
		"lambert-vert": {
			type: "Shader",
			src: LambertVert
		},
		"lambert-frag": {
			type: "Shader",
			src: LambertFrag
		},
        "reflection-vert": {
            type: "Shader",
            src: ReflectionVert
        },
        "reflection-frag": {
            type: "Shader",
            src: ReflectionFrag
        },
        "skybox-vert": {
            type: "Shader",
            src: SkyboxVert
        },
        "skybox-frag": {
            type: "Shader",
            src: SkyboxFrag
		},
	});
}
