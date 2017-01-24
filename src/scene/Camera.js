import Engine from "../Engine";
import Input from "../Input";
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

	set draggable(value)
	{
		if(this._draggable === value) { return; }
		this._draggable = value;

		if(value) {
			Engine.input.on("down", this.handleInputDown, this);
			Engine.input.on("up", this.handleInputUp, this);
			Engine.input.on("move", this.handleInputMove, this);
		}
		else {
			Engine.input.off("down", this.handleInputDown, this);
			Engine.input.off("up", this.handleInputUp, this);
			Engine.input.off("move", this.handleInputMove, this);
		}
	}

	get draggable() {
		return this._draggable;
	}

	handleInputDown(event) {
		this._dragging = true;
	}

	handleInputUp(event) {
		this._dragging = false;
	}

	handleInputMove(event) 
	{
		if(this._dragging) {
			this.move(event.deltaX, event.deltaY, 0.0);
		}
	}
}

Camera.ORTHOGRAPHIC = "orthographic";
Camera.PERSPECTIVE = "perspective";
