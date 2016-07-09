import {IDisposable} from '../core';
import {PositionVBO} from '../vertex-buffers';
import {PositionColorShader} from '../shaders';
import {BaseSprite} from './base-sprite';
import {mat3,GLM} from 'gl-matrix';


const QUAD_VERTICES = [
  //x1,y1
    1, 0,
  //x2,y2    
    0, 0,
  //x3,y3
    1, 1,
  //x4,y4
    0, 1
];
//the vertex buffer is going to be shared between all ColoredSprite instances.
var vbo: PositionVBO;

function initVBO(gl: WebGLRenderingContext) {
    if (vbo)
        return
    vbo = new PositionVBO(gl, QUAD_VERTICES);
}

var spritesCount = 0;

/**
 * a Solid Colored Sprite
 * 
 * @export
 * @class ColoredSprite
 * @extends {BaseSprite}
 * @implements {IDisposable}
 */
export class ColoredSprite extends BaseSprite implements IDisposable {
    /**
     * Sprite Color 
     * 
     * @private
     * @type {number[]}
     */
    private mColor: number[];
    /**
     * Creates an instance of ColoredSprite.
     * 
     * @param {WebGLRenderingContext} gl
     */
    constructor(private gl: WebGLRenderingContext) {
        super();
        initVBO(gl);
        spritesCount++;
        this.mColor = [1, 0, 0, 1];
    }
    /**
     * set Sprite color 
     * 
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {number} a
     */
    setColor(r:number, g:number, b:number, a:number=1) {
        this.mColor[0] = r;
        this.mColor[1] = g;
        this.mColor[2] = b;
        this.mColor[3] = a;

    }
    /**
     * Load Sprite data into shader 
     * 
     * @private
     * @param {PositionColorShader} shader
     * @param {GLM.IArray} view
     */
    private prepareShader(shader: PositionColorShader, view:GLM.IArray) {
        this.loadViewWorldToShader(shader,view);
        shader.setColor(this.mColor[0], this.mColor[1], this.mColor[2], this.mColor[3]);
        vbo.loadToShader(shader);
    }

    /**
     * draw Sprite, should be called inside {Shader.beginDraw}  and {Shader.endDraw} calls
     * 
     * @param {PositionColorShader} shader
     * @param {GLM.IArray} view
     */
    draw(shader: PositionColorShader, view:GLM.IArray) {
        this.prepareShader(shader,view);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

    /**
     *  Dispose sprite
     */
    dispose() {
        //decreases instances count
        spritesCount--;
        //if there are no more instances using the VBO then delete it.
        //TODO if i'm creating sprites and destroying them quickly maybe leaving the VBO in memroy will be more efficent
      /* if (spritesCount == 0) {

            vbo.dispose();// this.mGl.deleteBuffer(vbo);
            vbo = null;// gl.deleteBuffer(vbo);

        }*/
    }

}