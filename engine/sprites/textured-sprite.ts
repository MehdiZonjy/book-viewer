import {IDisposable, Texture} from '../core';
import {PositionTexcoordVBO} from '../vertex-buffers/';
import {PositionVBO} from '../vertex-buffers/';
import {PositionTexcoordShader} from '../shaders/';
import {BaseSprite} from './';
import {mat3,GLM} from 'gl-matrix';
const QUAD_VERTICES = [
    1, 0,
    1, 0,
    0, 0,
    0, 0,
    1, 1,
    1, 1,
    0, 1,
    0, 1
];
//the vertex buffer is going to be shared between all TexturedSprite instances.
var vbo: PositionTexcoordVBO;
function initVBO(gl: WebGLRenderingContext) {
    if (vbo)
        return;
    vbo = new PositionTexcoordVBO(gl, gl.ARRAY_BUFFER, QUAD_VERTICES, Float32Array);
}

var spritesCount = 0;

export class TexturedSprite extends BaseSprite implements IDisposable {
    constructor(private mGl: WebGLRenderingContext, private mTexture: Texture) {
        super();
        initVBO(mGl);
        spritesCount++;
    }


    private  prepareShader(shader: PositionTexcoordShader, view:GLM.IArray) {
        this.loadViewWorldToShader(shader,view);
        vbo.loadToShader(shader);
        this.mTexture.loadToShader();
    }

    draw(shader: PositionTexcoordShader, view:GLM.IArray) {
        this.prepareShader(shader,view);
        this.mGl.drawArrays(this.mGl.TRIANGLE_STRIP, 0, 4);
    }


    dispose() {
        this.mTexture.dispose();
        //decreases instances count
        spritesCount--;
        //if there are no more instances using the VBO then delete it.
        if (spritesCount == 0) {
            vbo.dispose();// this.mGl.deleteBuffer(vbo);
            vbo = null;
        }
    }

}