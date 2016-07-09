import {ReadOnlyVBO} from './readonly-vbo';
import {PositionShader} from '../shaders/';

/**
 * a vertex buffer object that holds only position data such as [x1,y1,x2,y2,x3,y3.....]  
 * @export
 * @class PositionVBO
 * @extends {ReadOnlyVBO}
 */
export class PositionVBO extends ReadOnlyVBO {
    /**
     * Creates an instance of PositionVBO.
     * 
     * @param {WebGLRenderingContext} gl
     * @param {number[]} vertices position information [x1,y1,x2,y2....]
     * @param {Float32Array|Float64Array|Int32Array|Int16Array|Int8Array} bufferDataType possible values 
      */
    constructor( gl: WebGLRenderingContext,   bufferData: number[], bufferDataType=Float32Array) {
        super(gl, gl.ARRAY_BUFFER, bufferData, bufferDataType);
    }

    loadToShader(shader: PositionShader) {
        this.attach();
        this.gl.vertexAttribPointer(shader.PositionLocation, 2, this.gl.FLOAT, false, 0, 0);
    }

}



