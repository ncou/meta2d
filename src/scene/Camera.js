import Node from "./Node";
import { Matrix4 } from "meta-math";

export default class Camera extends Node
{
	constructor()
	{
		this.matrixProjection = new Matrix4();
	}

	perspective() {

	}

	ortho() {

	}
}
