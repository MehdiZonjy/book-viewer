import {BaseShader, PositionTexcoordShader} from './';
import {Texture} from '../core';
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
/**
 * 
 * a simple shader with drawing textures support 
 * @export
 * @class SimpleTextureShader
 * @extends {BaseShader}
 * @implements {PositionTexcoordShader}
 */
export class SimpleTextureShader extends BaseShader implements PositionTexcoordShader {
    /**
     * location of TextureCoord attribute inside vertex shader 
     * 
     * @protected
     */
    protected mTexcoordLocation;

    /**
     * returns the location of TextureCoord attribute inside vertex shader 
     * 
     * @readonly
     */
    public get TexcoordLocation() {
        return this.mTexcoordLocation;
    }

    /**
     * 
     * load a texture to texture Sampler inside the FragmentShader 
     * @param {any} texture
     */
    public setTexture(texture: Texture) {
        //TODO figure out a way to load texture from here and remove it from texture class
    }


    /**
     * Creates an instance of SimpleTextureShader.
     * 
     * @param {WebGLRenderingContext} gl
     */
    constructor(protected gl: WebGLRenderingContext) {
        super(gl, VERTEX_SHADER, FRAGMENT_SHADER);

    }
    /**
     * loads the simple texture shader attributes and uniforms location
     * 
     * @protected
     */
    protected readShaderAttributes() {
        this.mTexcoordLocation = this.gl.getAttribLocation(this.mShaderProgram, TEXTURE_COORDS);
    }
    /**
     * load the ShaderProgram into WebGL for using and enable shader attributes
     * should be called when you are about to use this shader for drawing
     * @param {Float32Array} projection
     */
    public beginDraw(projection) {
        super.beginDraw(projection);
        this.gl.enableVertexAttribArray(this.mTexcoordLocation);
    }

    /**
       * stop using this shader for drawing and disable its attributes
       * should be used once you are done drawing or about to load a different shader 
       */
    public endDraw() {
        this.gl.disableVertexAttribArray(this.mTexcoordLocation);
        super.endDraw();
    }



}