import "./meta";
import "./Class";
import Engine from "./Engine"
import "./EngineWindow";
import Device from "./Device"
import "./Error";
import "./Utilities";
import "./Signal";
import "./View";
import "./Camera";
import "./World";
import "./Controller";
import "./Timer";
import "./Enum";
import "./Macros";
import "./utils/Ajax";
import "./utils/Tokenizer";
import "./math/Math";
import "./math/Vector2";
import "./math/AABB";
import "./math/AABBext";
import "./math/Circle";
import "./math/Matrix4";
import "./math/Random";
import "./resource/Enum";
import "./resource/Resource.Manager.js";
import "./resource/Resource.AudioManager.js";
import "./resource/Resource.Basic.js";
import "./resource/Resource.Texture.js";
import "./resource/Resource.Sound.js";
import "./resource/Resource.SpriteSheet.js";
import "./resource/Resource.Font.js";
import "./resource/Resource.SVG.js";
import "./input/Enum";
import "./input/Input.Manager.js";
import "./entity/Enum";
import "./entity/Entity.Geometry.js";
import "./entity/Entity.Text.js";
import "./entity/Entity.Tiling.js";
import "./entity/Entity.Particle.js";
import "./components/Component.Basic.js";
import "./components/Component.Anim.js";
import "./tilemap/Entity.Tilemap.js";
import "./tilemap/Entity.TilemapLayer.js";
import "./tilemap/Entity.TilemapOrthoLayer.js";
import "./tilemap/Entity.TilemapIsoLayer.js";
import "./tilemap/Entity.TilemapHexLayer.js";
import "./tilemap/Component.TileBody.js";
import "./tilemap/Entity.TileGeometry.js";
import "./renderer/Renderer";
import "./renderer/CanvasRenderer";
import "./renderer/SparseGrid";
import "./debugger/Debugger.js";
import "./svg/Entity.SVG.js";
import "./svg/Entity.Line.js";
import "./svg/Entity.Rect.js";
import "./svg/Entity.Circle.js";
import "./svg/Entity.Gradient.js";
import "./physics/Physics.Manager.js";
import "./physics/Physics.Body.js";
import "./steering/Steering.Manager.js";
import "./steering/Steering.Component.js";
import "./ui/UI.Controller.js";
import Button from "./ui/button.js";
import "./ui/UI.Checkbox.js";
import "./ui/UI.ProgressBar.js";
import "./ui/UI.Group.js";
import Tab from "./ui/tab.js";
import "./tween/Tween.js";
import "./tween/Easing.js";
import "./tween/Link.js";
import "./Loading.js";
import "./Loader.js";

Engine.create = function(cfg)
{
	cfg = cfg || {}

	Engine.cfg = cfg

	// Engine.cfg = cfg
	// Engine.settings = cfg.settings || {}
	// Engine.time = new Time()
	// Engine.window = new EngineWindow()
	// Engine.input = new Input()
	// Engine.viewport = new Viewport()
	// Engine.layer = new Layer()
	// Engine.renderer = new Renderer()
	// Engine.resources = new ResourceManager()

	// Engine.camera = Engine.viewport.camera
	// Engine.camera.draggable = true

	Engine.init = cfg.init || null
	Engine.setup = cfg.setup || null
	Engine.ready = cfg.ready || null
	Engine.update = cfg.update || null
	Engine.render = cfg.render || null

	if(Engine.init) {
		Engine.init()
	}

	meta.engine.create()

	// loadCoreShaders()
	// Engine.resources.load(cfg.assets)
	
	return Engine
}


export default { 
	Engine, 
	Device,
	Tab, 
	Text, 
	Button 
}
