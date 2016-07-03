import {ReadOnlyVBO} from './readonly-vbo';
import {PositionTexcoordShader} from '../shaders/interfaces';
export class PositionTexcoordVBO extends ReadOnlyVBO {
 //   private mTxtBuffer;
    constructor(gl: WebGLRenderingContext, glBufferType, bufferData: number[], bufferDataType) {
        super(gl, glBufferType, bufferData, bufferDataType);

      //  this.mTxtBuffer = gl.createBuffer();
        //this.attach();

    /*    const QUAD_VERTICES = [
            1, 0,
            0, 0,
            1, 1,
            0, 1
        ];

        this.gl.bindBuffer(this.glBufferType, this.mTxtBuffer);

        this.gl.bufferData(this.glBufferType, new bufferDataType(QUAD_VERTICES), gl.STATIC_DRAW);
*/
    }

    loadToShader(shader: PositionTexcoordShader) {
        this.attach();
        //load position
           this.gl.vertexAttribPointer(shader.PositionLocation, 2, this.gl.FLOAT, false,4*4, 0);
      /*  this.gl.vertexAttribPointer(shader.PositionLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.bindBuffer(this.glBufferType, this.mTxtBuffer);
        this.gl.enableVertexAttribArray(shader.TexcoordLocation);
        this.gl.vertexAttribPointer(shader.TexcoordLocation, 2, this.gl.FLOAT, false, 0, 0);*/
        //load texcoord
         this.gl.vertexAttribPointer(shader.TexcoordLocation, 2, this.gl.FLOAT, false, 4*4, 4*2);
    }

}



