import Node from "./Node";
import { Matrix4 } from "meta-math";

export default class Camera extends Node
{
	constructor(cfg)
	{
		cfg = cfg || {};
		this._type = cfg.type || Camera.ORTHOGRAPHIC;
		this._fov = cfg.fov || 75.0;

		super();
	}

	updateTransform()
	{
		switch(this._type)
		{
			case Camera.ORTHOGRAPHIC:
				this.transform.ortho();
				break;

			case Camera.PERSPECTIVE:
				this.transform.perspective();
				break;
		}

		this.needUpdateTransform = false;
	}

	set type(type)
	{
		if(this._type === type) { return; }
		this._type = type;

		this.needUpdateTransform = true;
	}

	get type() {
		return this._type;
	}

	set fov(fov) 
	{
		if(this._fov === fov) { return; }
		this._fov = fov;

		this.needUpdateTransform = true;
	}

	get zoomRatio() {
		return 1.0;
	}
}

Camera.ORTHOGRAPHIC = "orthographic";
Camera.PERSPECTIVE = "perspective";
