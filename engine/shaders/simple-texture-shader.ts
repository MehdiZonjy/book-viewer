import {BaseShader,PositionTexcoordShader} from './';
const VERTEX_SHADER = `
    attribute vec2 aPosition; //the position of the point
    attribute vec2 aTexCoord;
    uniform mat3 uProjection;
    uniform mat3 uViewWorld;
    
    varying vec2 vTexCoord;
    void main(void){
        vec3 pos = vec3(aPosition,1);
        gl_Position = vec4((uProjection*uViewWorld*pos).xy,0.0,1.0);
        vTexCoord=aTexCoord;
    }

`;

const FRAGMENT_SHADER = `
    precision mediump float;
    uniform sampler2D uTexture;
    varying vec2 vTexCoord;    
    void main(void){
        gl_FragColor = texture2D(uTexture,vTexCoord);
    }
`;


const TEXTURE_COORDS = "aTexCoord"

export class SimpleTextureShader extends BaseShader implements PositionTexcoordShader {
    protected mTexcoordLocation;

    public get TexcoordLocation() {
        return this.mTexcoordLocation;
    }

    public setTexture(texture) {
        //TODO figure out a way to load texture from here and remove it from texture class
    }



    constructor(protected gl: WebGLRenderingContext) {
        super(gl, VERTEX_SHADER, FRAGMENT_SHADER);

    }

    protected readShaderAttributes() {
        this.mTexcoordLocation = this.gl.getAttribLocation(this.mShaderProgram, TEXTURE_COORDS);
    }
    beginShader(projection) {
        super.beginShader(projection);
        this.gl.enableVertexAttribArray(this.mTexcoordLocation);
    }

    endShader() {
        this.gl.disableVertexAttribArray(this.mTexcoordLocation);
        super.endShader();
    }



}