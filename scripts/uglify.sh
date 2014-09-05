#!/bin/bash
cd ../src/
cat Engine.js \
	Device.js \
	Error.js \
	Utilities.js \
	Signal.js \
	View.js \
	Camera.js \
	World.js \
	Class.js \
	Controller.js \
	Timer.js \
	Shader.js \
	Style.js \
	Enum.js \
	Macros.js \
	utils/LinkedList.js \
	math/Math.js \
	math/Vector2.js \
	math/AABB.js \
	math/AdvAABB.js \
	math/Matrix4.js \
	math/Random.js \
	tween/Tween.js \
	tween/Easing.js \
	tween/Link.js \
	plugins/Component/Component.js \
	plugins/Resource/Resource.Controller.js \
	plugins/Resource/Enum.js \
	plugins/Resource/Resource.Basic.js \
	plugins/Resource/Resource.Texture.js \
	plugins/Resource/Resource.Sound.js \
	plugins/Resource/Resource.SpriteSheet.js \
	plugins/Resource/Resource.Font.js \
	plugins/Entity/Entity.Controller.js \
	plugins/Entity/Enum.js \
	plugins/Entity/Entity.WebGLRenderer.js \
	plugins/Entity/Entity.CanvasRenderer.js \
	plugins/Entity/Entity.Geometry.js \
	plugins/Entity/Entity.Text.js \
	plugins/Entity/Entity.DepthList.js \
	plugins/Entity/Entity.CellArray.js \
	plugins/Input/Input.Controller.js \
	plugins/Input/Enum.js \
	plugins/UI/UI.Controller.js \
	plugins/UI/UI.Style.js \
	plugins/UI/UI.Button.js \
	plugins/UI/UI.ProgressBar.js \
	Loader.js \
	| uglifyjs --output ../versions/meta.latest.js --mangle -c dead_code=false,unused=false,side_effects=false --screw-ie8
