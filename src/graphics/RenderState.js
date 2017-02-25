
class RenderState 
{
    constructor(gl) {
        this.gl = gl
        this._depthTest = false
    }

    set depthTest(value)
    {
        console.log("depth-test", value)

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
}

export default RenderState