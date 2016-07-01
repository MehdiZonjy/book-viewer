import {ReadOnlyVBO} from './readonly-vbo';
import {PositionShader} from '../shaders/interfaces';
export class PositionVBO extends ReadOnlyVBO {
    constructor( gl: WebGLRenderingContext,  glBufferType, bufferData: number[], bufferDataType) {
        super(gl, glBufferType, bufferData, bufferDataType);
    }

    loadToShader(shader: PositionShader) {
        this.attach();
        this.gl.vertexAttribPointer(shader.PositionLocation, 2, this.gl.FLOAT, false, 0, 0);
    }

}



