import {BaseShader} from './base-shader';
import {PositionColorShader} from './interfaces';
const VERTEX_SHADER = `
    attribute vec2 mPosition; //the position of the point
    uniform mat3 mProjection;
    uniform mat3 mViewWorld;
    void main(void){
        vec3 pos = vec3(mPosition,1);
        gl_Position = vec4((mProjection*mViewWorld*pos).xy,0.0,1.0);
    }

`;

const FRAGMENT_SHADER = `
    precision mediump float;
    uniform vec4 mColor;
    void main(void){
        gl_FragColor = mColor;
    }
`;


const POSITION = "mPosition";
const COLOR = "mColor"

export class SimpleColorShader extends BaseShader implements PositionColorShader {
    protected mColorLocation;

    public get ColorLocation() {
        return this.mColorLocation;
    }

    public setColor(r, g, b, a) {
        this.gl.uniform4f(this.mColorLocation, r, g, b, a);
    }
    public getColor(){
        return this.gl.getUniform(this.mShaderProgram,this.mColorLocation);
    }
    constructor(protected gl: WebGLRenderingContext) {
        super(gl, VERTEX_SHADER, FRAGMENT_SHADER);

    }

    protected readShaderAttributes() {
        this.mColorLocation = this.gl.getUniformLocation(this.mShaderProgram, COLOR);
    }


}