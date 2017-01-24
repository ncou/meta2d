import { Vector3, Matrix4 } from "meta-math";

export default class Node
{
	constructor() 
	{
		this._position = new Vector3();
		// this.rotation = new Quaterion();
		this._scale = new Vector3(1.0, 1.0, 1.0);
		this._transform = new Matrix4();
		this.needUpdateTransform = true;

		this._pickable = false;
		this._hidden = false;
		this._opacity = 1.0;

		this.parent = null;
		this.children = null;
	}

	setPosition(x, y, z) {
		this._position.set(x, y, z || 0.0)
	}

	move(x, y, z) {
		this._position.addValues(x, y, z);
	}

	get position() {
		return this._position;
	}

	updateTransform()
	{
		this.needUpdateTransform = false;
	}

	get transform() 
	{
		if(this.needUpdateTransform) {
			this.updateTransform();
		}

		return this._transform;
	}

	flip(x, y) {

	}

	set pickable(value) 
	{
		if(this._pickable === value) { return; }
		this._pickable = value;
	}

	get pickable() {
		return this._pickable;
	}

	set hidden(value) 
	{
		if(this._hidden === value) { return; }
		this._hidden = value;
	}

	get hidden() {
		return this._hidden;
	}

	set opacity(value)
	{
		if(this._opacity === value) { return; }
		this._opacity = value;
	}

	get opacity() {
		return this._opacity;
	}

	addChild(child)
	{

	}

	removeChild(child)
	{

	}

	removeAllChildren()
	{

	}

	get x() {
		return this._position.x;
	}

	get y() {
		return this._position.y;
	}

	get z() {
		return this._position.z;
	}		
}
