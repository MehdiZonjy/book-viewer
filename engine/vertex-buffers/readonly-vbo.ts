import {IDisposable} from '../core';
import {VBO} from './interfaces';
export  class ReadOnlyVBO implements IDisposable,VBO {

    protected mVBO:WebGLBuffer;
    public get VBO(){
        return this.mVBO;
    }
    constructor(protected gl:WebGLRenderingContext,protected glBufferType,bufferData,bufferDataType){
        this.mVBO=gl.createBuffer();
        this.attach();
        this.gl.bufferData(this.glBufferType,new bufferDataType(bufferData),gl.STATIC_DRAW);
    }

    attach(){
        this.gl.bindBuffer(this.glBufferType,this.mVBO);
    }


    dispose(){

        this.gl.deleteBuffer(this.mVBO);
    }

}



