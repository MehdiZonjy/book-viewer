import {IDisposable} from  '../core/';
import {IShader} from './';
//vertex shaders using this class should have an attribute named {POSITION}
const POSITION = "aPosition";
//vertex shaders using this class should have a unifrom named {VIEWWORLD} 
const VIEWWORLD = 'uViewWorld';
//vertex shaders using this class should have a unifrom named {uProjection}
const PROJECTION = 'uProjection';

/**
 * Encapsulates the following shader functionalities
 * 1: create vertex and fragment shaders
 * 2: create a shader program
 * 3: load aPosition/uViewModel/uProjection data to ShaderProgram
 * 4: loading and unloading the ShaderProgram prior to drawing by {beginDraw} and {endDraw}
 * @export
 * @abstract
 * @class BaseShader
 * @implements {IDisposable}
 * @implements {IShader}
 */
export abstract class BaseShader implements IDisposable, IShader {

    /**
     * 
     * reference to the vertexShader
     * @private
     * @type {WebGLShader}
     */
    private mVertexShader: WebGLShader;

    /**
     * 
     * reference to FragmentShader
     * @private
     * @type {WebGLShader}
     */
    private mFragmentShader: WebGLShader;

    /**
     * 
     * reference to shaderProgram 
     * @protected
     * @type {WebGLProgram}
     */
    protected mShaderProgram: WebGLProgram;

    /**
     * 
     * location of {POSITION} attribute inside vertexShader 
     * @protected
     * @type {number}
     */
    protected mPositionLocation: number;
    /**
     * 
     * location of {VIEWWORLD} uniform inside vertexShader
     * @protected
     * @type {WebGLUniformLocation}
     */
    protected mViewWorldLocation: WebGLUniformLocation;
    /**
     * location of {PROJECTION} uniform inside vertexShader 
     * @protected
     * @type {WebGLUniformLocation}
     */
    protected mProjectionLocation: WebGLUniformLocation;

    ///Getters

    /**
     * ViewWorld Uniform Location
     * 
     * @readonly
     */
    public get ViewWorldLocation() {
        return this.mViewWorldLocation;
    }
    /**
     * Projection Unifrom Location
     * 
     * @readonly
     */
    public get ProjectionLocation() {
        return this.mProjectionLocation;
    }

    /**
     * Postion attribute location
     * @readonly
     */
    public get PositionLocation() {
        return this.mPositionLocation;
    }

    /**
     * Creates an instance of BaseShader.
     * 
     * @param {WebGLRenderingContext} gl
     * @param {string} vertexShaderSource
     * @param {string} fragmentShaderSource
     */
    constructor(protected gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {
    
        //create shaders for fragment and vertex
        this.mVertexShader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER, "VERTEX");
        this.mFragmentShader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER, "FRAGMENT");
        
        //create shader program and load uniform/attribute locations
        this.mShaderProgram = createShaderProgram(gl, this.mVertexShader, this.mFragmentShader);
        this.readIShaderAttributes();
        this.readShaderAttributes();
    }


    /**
     * load shader program into WebGL
     */
    protected use() {
        this.gl.useProgram(this.mShaderProgram);
    }

    /**
     * unload shader program from WebGL
     */
    protected unuse() {
        this.gl.useProgram(null);
    }

    /**
     * delete shaderProgram as well as VertexShader and FragmentShader
     */
    public dispose() {
        this.gl.deleteProgram(this.mShaderProgram);
        this.gl.deleteShader(this.mVertexShader);
        this.gl.deleteShader(this.mFragmentShader);
        this.gl = null;

    }
    
    /**
     * 
     * load BaseShader attributes and uniforms locations
     * @private
     */
    private readIShaderAttributes() {
        this.mPositionLocation = this.gl.getAttribLocation(this.mShaderProgram, POSITION);
        this.mProjectionLocation = this.gl.getUniformLocation(this.mShaderProgram, PROJECTION);
        this.mViewWorldLocation = this.gl.getUniformLocation(this.mShaderProgram, VIEWWORLD);
    }


    /**
     * 
     * set load Projection Matrix into shader
     * @param {Float32Array} projection
     */
    setProjection(projection:Float32Array) {
        this.gl.uniformMatrix3fv(this.ProjectionLocation, false, projection);
    }

    /**
     * 
     * load ViewWorld Matrix into shader
     * @param {Float32Array} viewWorld
     */
    setViewWorld(viewWorld:Float32Array) {
        this.gl.uniformMatrix3fv(this.ViewWorldLocation, false, viewWorld);

    }

    /**
     * load the ShaderProgram into WebGL for using and enable shader attributes (if any)
     * should be called when you are about to use this shader for drawing
     * @param {Float32Array} projection
     */
    beginDraw(projection:Float32Array) {
        this.use();
        this.setProjection(projection);
        this.gl.enableVertexAttribArray(this.mPositionLocation);
    }

    /**
     * stop using this shader for drawing and disable its attributes
     * should be used once you are done drawing or about to load a different shader 
     */
    endDraw() {
        this.gl.disableVertexAttribArray(this.mPositionLocation);
        this.unuse();
    }

    /**
     * 
     * Children of {BaseShader} should implement this to load their own Uniforms and Attributes locations
     * @protected
     * @abstract
     */
    protected abstract readShaderAttributes();

}



/**
 * creates a shader from sourceCode and type
 * 
 * @param {WebGLRenderingContext} gl
 * @param {string} shaderSource
 * @param {gl.VERTEX_SHADER | gl.FRAGMENT_SHADER} glShaderType
 * @param {string} shaderTypeName - a helper string to identify type of shader such as 'FRAGMENT' or 'VERTEX, used for logging error 
 * @returns {WebGLShader}
 */
function createShader(gl: WebGLRenderingContext, shaderSource: string, glShaderType, shaderTypeName:string):WebGLShader {
    let shader = gl.createShader(glShaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    //log any errors and return null
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        //TODO add logging 
        console.error(gl.getShaderInfoLog(shader));
    }
    return shader;
}



/**
 * 
 * Creates a ShaderProgram using the provided FragmentShader and VertexShader
 * @param {WebGLRenderingContext} gl
 * @param {WebGLShader} fragmentShader
 * @param {WebGLShader} vertexShader
 * @returns {WebGLProgram}
 */
function createShaderProgram(gl: WebGLRenderingContext, fragmentShader:WebGLShader, vertexShader:WebGLShader):WebGLProgram {
    let shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    //log any errors and return null
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {

        //TODO add logging
        console.error(gl.getProgramInfoLog(shaderProgram));
    }
    return shaderProgram;
}