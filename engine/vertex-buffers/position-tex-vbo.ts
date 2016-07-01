import {ReadOnlyVBO} from './readonly-vbo';
import {PositionTexcoordShader} from '../shaders/interfaces';
export class PositionTexcoordVBO extends ReadOnlyVBO {
    constructor( gl: WebGLRenderingContext,  glBufferType, bufferData: number[], bufferDataType) {
        super(gl, glBufferType, bufferData, bufferDataType);
    }

    loadToShader(shader: PositionTexcoordShader) {
        this.attach();
        //load position
        this.gl.vertexAttribPointer(shader.PositionLocation, 2, this.gl.FLOAT, false, 4*2, 0);
        //load texcoord
        this.gl.vertexAttribPointer(shader.TexcoordLocation, 2, this.gl.FLOAT, false, 4*2, 2);
    }

}



