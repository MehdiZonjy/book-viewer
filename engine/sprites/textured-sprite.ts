import {IDisposable, Texture} from '../core';
import {PositionTexcoordVBO} from '../vertex-buffers/';
import {PositionVBO} from '../vertex-buffers/';
import {PositionTexcoordShader} from '../shaders/';
import {BaseSprite} from './';
import {mat3, GLM} from 'gl-matrix';
const QUAD_VERTICES = [
    //x1,y1
    1, 0,
    //texCoordX1,texCoordY1  
    1, 0,
    //x2,y2
    0, 0,
    //texCoordX2,texCoordY2
    0, 0,
    //x3,y3
    1, 1,
    //texCoordX3,texCoordY3
    1, 1,
    //x1,y1
    0, 1,
    //texCoordX4,texCoordY4
    0, 1
];
//the vertex buffer is going to be shared between all TexturedSprite instances.
var vbo: PositionTexcoordVBO;
function initVBO(gl: WebGLRenderingContext) {
    if (vbo)
        return;
    vbo = new PositionTexcoordVBO(gl, QUAD_VERTICES);
}

var spritesCount = 0;

/**
 * Textured Sprite
 * 
 * @export
 * @class TexturedSprite
 * @extends {BaseSprite}
 * @implements {IDisposable}
 */
export class TexturedSprite extends BaseSprite implements IDisposable {
    /**
     * indicates if the sprite has been disposed yet
     * 
     * @protected
     * @type {boolean}
     */
    protected mDisposed: boolean;

    /**
     * Creates an instance of TexturedSprite.
     * 
     * @param {WebGLRenderingContext} mGl
     * @param {Texture} mTexture
     * @param {boolean} [mShaderTexture=true] if set false then {Texture.dispose} will be called when the sprite is dispoed
     */
    constructor(protected mGl: WebGLRenderingContext, protected mTexture: Texture, protected mSharedTexture = true) {
        super();
        initVBO(mGl);
        spritesCount++;
        this.mDisposed = false;
    }

    /**
     * load sprite data into shader
     * 
     * @private
     * @param {PositionTexcoordShader} shader
     * @param {GLM.IArray} view
     */
    private prepareShader(shader: PositionTexcoordShader, view: GLM.IArray) {
        this.loadViewWorldToShader(shader, view);
        vbo.loadToShader(shader);
        this.mTexture.loadToShader();
    }

    /**
    * draw Sprite, should be called inside {Shader.beginDraw}  and {Shader.endDraw} calls
    * 
    * @param {PositionColorShader} shader
    * @param {GLM.IArray} view
    */
    draw(shader: PositionTexcoordShader, view: GLM.IArray) {
        this.prepareShader(shader, view);
        this.mGl.drawArrays(this.mGl.TRIANGLE_STRIP, 0, 4);
    }

    /**
     * Dispose sprite 
     */
    dispose() {
        this.mDisposed = true;
        if (this.mTexture && !this.mSharedTexture)
            this.mTexture.dispose();
        //decreases instances count
        spritesCount--;
        //if there are no more instances using the VBO then delete it.
        //TODO if i'm creating sprites and destroying them quickly maybe leaving the VBO in memroy will be more efficent
        /*
        if (spritesCount == 0) {
            vbo.dispose();// this.mGl.deleteBuffer(vbo);
            vbo = null;
        }*/
    }

}