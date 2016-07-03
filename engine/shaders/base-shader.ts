import {IDisposable} from  '../interfaces';
import {IShader} from './interfaces';
const POSITION = "aPosition";
const VIEWWORLD='uViewWorld';
const PROJECTION='uProjection';
export abstract class BaseShader implements IDisposable, IShader {
    private mVertexShader;
    private mFragmentShader;

    protected mShaderProgram: WebGLProgram;

    protected mPositionLocation;
    protected mViewWorldLocation;
    protected mProjectionLocation;


    public get ViewWorldLocation() {
        return this.mViewWorldLocation;
    }
    public get ProjectionLocation() {
        return this.mProjectionLocation;
    }

    public get PositionLocation() {
        return this.mPositionLocation;
    }

    constructor(protected gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource) {
        this.mVertexShader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER, "VERTEX");
        this.mFragmentShader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER, "FRAGMENT");
        this.mShaderProgram = createShaderProgram(gl, this.mVertexShader, this.mFragmentShader);
        this.readIShaderAttributes();
        this.readShaderAttributes();
    }


    public use() {
        this.gl.useProgram(this.mShaderProgram);
    }
    public unuse(){
        this.gl.useProgram(null);
    }
    public dispose() {
        this.gl.deleteProgram(this.mShaderProgram);
        this.gl.deleteShader(this.mVertexShader);
        this.gl.deleteShader(this.mFragmentShader);
        this.gl = null;

    }

    private readIShaderAttributes() {
        this.mPositionLocation = this.gl.getAttribLocation(this.mShaderProgram, POSITION);
        this.mProjectionLocation = this.gl.getUniformLocation(this.mShaderProgram, PROJECTION);
        this.mViewWorldLocation = this.gl.getUniformLocation(this.mShaderProgram, VIEWWORLD);
    }


    setProjection(projection){
        this.gl.uniformMatrix3fv(this.ProjectionLocation,false, projection);
    }
    setViewWorld(viewWorld){
        this.gl.uniformMatrix3fv(this.ViewWorldLocation,false,viewWorld);

    }

    beginShader(projection){
        this.use();
        this.setProjection(projection);
        this.gl.enableVertexAttribArray(this.mPositionLocation);
    }

    endShader(){
        this.gl.disableVertexAttribArray(this.mPositionLocation);
        this.unuse();
    }

        protected abstract readShaderAttributes();

}



function createShader(gl: WebGLRenderingContext, shaderSource: string, glShaderType, shaderTypeName) {
    let shader = gl.createShader(glShaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        //TODO add logging 
        console.error(gl.getShaderInfoLog(shader));
    }
    return shader;
}



function createShaderProgram(gl: WebGLRenderingContext, fragmentShader, vertexShader) {
    let shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {

        //TODO add logging
        console.error(gl.getProgramInfoLog(shaderProgram));
    }
    return shaderProgram;


}