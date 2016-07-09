import {ReadOnlyVBO} from './readonly-vbo';
import {PositionTexcoordShader} from '../shaders';

const FLOAT_SIZE=4;

/**
 * Vertex buffer object which holds both position and TextCoord data such as [x1,y1,texCoord1X,texCoord1Y,x2,y2,texCoord2X,textCoord2Y]
 * 
 * @export
 * @class PositionTexcoordVBO
 * @extends {ReadOnlyVBO}
 */
export class PositionTexcoordVBO extends ReadOnlyVBO {

    /**
     * Creates an instance of PositionTexcoordVBO.
     * 
     * @param {WebGLRenderingContext} gl
     * @param {number[]} vertices position and textcoord data [x1,y1,texCoord1X,texCoord1Y,x2,y2,texCoord2X,textCoord2Y]
     */
    constructor(gl: WebGLRenderingContext,  bufferData: number[]) {
        super(gl, gl.ARRAY_BUFFER, bufferData, Float32Array);

    }

    loadToShader(shader: PositionTexcoordShader) {
        this.attach();
        //load position
        this.gl.vertexAttribPointer(shader.PositionLocation, 2, this.gl.FLOAT, false, FLOAT_SIZE * 4, 0);
        //load texcoord
        this.gl.vertexAttribPointer(shader.TexcoordLocation, 2, this.gl.FLOAT, false, FLOAT_SIZE * 4, FLOAT_SIZE * 2);
    }

}



