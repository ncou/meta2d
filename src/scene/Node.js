import { Vector3, Matrix4 } from "meta-math"

export default class Node
{
	constructor() 
	{
		this._position = new Vector3()
		this._scale = new Vector3(1.0, 1.0, 1.0)
		this._transform = new Matrix4()
		this.needUpdateTransform = true

		// this._pickable = false;
		// this._hidden = false;
		// this._opacity = 1.0;

		// this.parent = null;
		// this.children = null;
	}

	set position(vec) {
		this._position.copy(vec)
		this.needUpdateTransform = true
	}

	get position() {
		this.needUpdateTransform = true
		return this._position
	}

	set scale(scale) {
		this._scale.copy(scale)
		this.needUpdateTransform = true
	}

	get scale() {
		this.needUpdateTransform = true
		return this._scale
	}

	move(x, y, z) {
		this._position.addValues(x, y, z)
	}

	updateTransform()
	{
		this._transform.identity()
		this._transform.scale(this._scale.x, this._scale.y, this._scale.y)
		// this._transform.rotate(this._scale.x, this._scale.y, this._scale.y)
		this._transform.translate(this._position.x, this._position.y, this._position.z)
		this.needUpdateTransform = false
	}

	get transform() 
	{
		if(this.needUpdateTransform) {
			this.updateTransform()
		}

		return this._transform
	}

	// flip(x, y) {

	// }

	// set pickable(value) 
	// {
	// 	if(this._pickable === value) { return; }
	// 	this._pickable = value;
	// }

	// get pickable() {
	// 	return this._pickable;
	// }

	// set hidden(value) 
	// {
	// 	if(this._hidden === value) { return; }
	// 	this._hidden = value;
	// }

	// get hidden() {
	// 	return this._hidden;
	// }

	// set opacity(value)
	// {
	// 	if(this._opacity === value) { return; }
	// 	this._opacity = value;
	// }

	// get opacity() {
	// 	return this._opacity;
	// }

	// addChild(child)
	// {

	// }

	// removeChild(child)
	// {

	// }

	// removeAllChildren()
	// {

	// }

	set x(x) {
		this.position.x = x
	}

	set y(y) {
		this.position.y = y
	}

	set z(z) {
		this.position.z = z
	}	

	get x() {
		return this.position.x
	}

	get y() {
		return this.position.y
	}

	get z() {
		return this.position.z
	}		
}
