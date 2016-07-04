import {IDisposable} from '../core';
import {PositionVBO} from '../vertex-buffers';
import {PositionColorShader} from '../shaders';
import {BaseSprite} from './';
import {mat3,GLM} from 'gl-matrix';


const QUAD_VERTICES = [
    1, 0,
    0, 0,
    1, 1,
    0, 1
];
//the vertex buffer is going to be shared between all ColoredSprite instances.
var vbo: PositionVBO;
function initVBO(gl: WebGLRenderingContext) {
    if (vbo)
        return;
    vbo = new PositionVBO(gl, gl.ARRAY_BUFFER, QUAD_VERTICES, Float32Array);
}

var spritesCount = 0;

export class ColoredSprite extends BaseSprite implements IDisposable {
    private mColor: number[];
    private mViewWorld;
    constructor(private gl: WebGLRenderingContext) {
        super();
        initVBO(gl);
        spritesCount++;
        this.mColor = [1, 0, 0, 1];
        this.mViewWorld = mat3.create();
    }
    setColor(r, g, b, a) {
        this.mColor[0] = r;
        this.mColor[1] = g;
        this.mColor[2] = b;
        this.mColor[3] = a;

    }

    private prepareShader(shader: PositionColorShader, view:GLM.IArray) {

        mat3.multiply(this.mViewWorld, view, this.Transformations);
        shader.setViewWorld(this.mViewWorld);
        shader.setColor(this.mColor[0], this.mColor[1], this.mColor[2], this.mColor[3]);
        vbo.loadToShader(shader);
    }

    draw(shader: PositionColorShader, view:GLM.IArray) {
        this.prepareShader(shader,view);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }


    dispose() {
        //decreases instances count
        spritesCount--;
        //if there are no more instances using the VBO then delete it.
        if (spritesCount == 0) {

            vbo.dispose();// this.mGl.deleteBuffer(vbo);
            vbo = null;// gl.deleteBuffer(vbo);

        }
    }

}