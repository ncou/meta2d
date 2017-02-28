
class RenderState
{
    constructor(gl)
    {
        this.gl = gl
        this._depthTest = false
        this._cullFace = gl.BACK
    }

    set depthTest(value)
    {
        this._depthTest = value

        if(value) {
            this.gl.enable(this.gl.DEPTH_TEST)
        }
        else {
            this.gl.disable(this.gl.DEPTH_TEST)
        }
    }

    get depthTest() {
        return this._depthTest
    }

    set cullFace(value)
    {
        this._cullFace = value
        this.gl.cullFace(value)
    }

    get cullFace() {
        return this._cullFace
    }
}

export default RenderState