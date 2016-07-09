import {BaseShader,PositionColorShader} from './';
const VERTEX_SHADER = `
    attribute vec2 aPosition; //the position of the point
    uniform mat3 uProjection;
    uniform mat3 uViewWorld;
    void main(void){
        vec3 pos = vec3(aPosition,1);
        gl_Position = vec4((uProjection*uViewWorld*pos).xy,0.0,1.0);
    }

`;

const FRAGMENT_SHADER = `
    precision mediump float;
    uniform vec4 uColor;
    void main(void){
        gl_FragColor = uColor;
    }
`;


const COLOR = "uColor"
/**
 * a simple shader that uses a uniform color to draw pixels 
 * @export
 * @class SimpleColorShader
 * @extends {BaseShader}
 * @implements {PositionColorShader}
 */
/**
 * 
 * 
 * @export
 * @class SimpleColorShader
 * @extends {BaseShader}
 * @implements {PositionColorShader}
 */
export class SimpleColorShader extends BaseShader implements PositionColorShader {
    /**
     * color uniform location inside shader
     * 
     * @protected
     */
    protected mColorLocation;

    /**
     * returns color uniform location inside shader
     * 
     * @readonly
     */
    public get ColorLocation() {
        return this.mColorLocation;
    }

    /**
     * set a uniform color to use when drwaing all vertices
     * 
     * @param {any} r
     * @param {any} g
     * @param {any} b
     * @param {any} a
     */
    public setColor(r, g, b, a=1) {
        this.gl.uniform4f(this.mColorLocation, r, g, b, a);
    }
    /**
     * return a uniform color used to when drwaing vertices
     * 
     * @returns
     */
    public getColor(){
        return this.gl.getUniform(this.mShaderProgram,this.mColorLocation);
    }
    /**
     * Creates an instance of SimpleColorShader.
     * 
     * @param {WebGLRenderingContext} gl
     */
    constructor(protected gl: WebGLRenderingContext) {
        super(gl, VERTEX_SHADER, FRAGMENT_SHADER);

    }
    /**
     * load simple color shader attributes and uniforms
     * @protected
     */
    protected readShaderAttributes() {
        this.mColorLocation = this.gl.getUniformLocation(this.mShaderProgram, COLOR);
    }


}