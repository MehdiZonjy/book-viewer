import {IDisposable} from '../interfaces';
import {PositionTexcoordVBO} from '../vertex-buffers/position-tex-vbo';
import {PositionVBO} from '../vertex-buffers/position-vbo';
import {PositionTexcoordShader} from '../shaders/interfaces';
import {BaseSprite} from './base-sprite';
import {Texture} from '../core/texture';

const QUAD_VERTICES = [
    1, 0,
    1 ,0,
    0, 0,
    0, 0,
    1, 1,
    1, 1,
    0, 1,
    0, 1
];
//the vertex buffer is going to be shared between all ColoredSprite instances.
var vbo: PositionTexcoordVBO;
function initVBO(gl: WebGLRenderingContext) {
    if (vbo)
        return;
    vbo = new PositionTexcoordVBO(gl, gl.ARRAY_BUFFER, QUAD_VERTICES, Float32Array);
}

var spritesCount = 0;

export class TexturedSprite extends BaseSprite implements IDisposable {
    private mViewWorld;
    constructor(private mGl: WebGLRenderingContext,private mTexture:Texture) {
        super();
        initVBO(mGl);
        spritesCount++;
        this.mViewWorld = mat3.create();
    }


    prepareShader(shader: PositionTexcoordShader, view) {

        mat3.multiply(this.mViewWorld, view, this.Transformations);
        shader.setViewWorld(this.mViewWorld);
        vbo.loadToShader(shader);
        this.mTexture.loadToShader();
    }

    draw() {
        this.mGl.drawArrays(this.mGl.TRIANGLE_STRIP, 0, 4);
    }


    dispose() {
        this.mTexture.dispose();
        //decreases instances count
        spritesCount--;
        //if there are no more instances using the VBO then delete it.
        if (spritesCount == 0)
        {
           vbo.dispose();// this.mGl.deleteBuffer(vbo);
            vbo=null;
        }
    }

}