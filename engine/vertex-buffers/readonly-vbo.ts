import {IDisposable} from '../core';
import {VBO} from './interfaces';
/**
 * Encapsulates a WeblGL Vertex Buffer Object (VBO) 
 * 
 * @export
 * @class PositionVBO
 * @extends {ReadOnlyVBO}
 */
export  class ReadOnlyVBO implements IDisposable,VBO {
    /**
     * WebGL buffer handler 
     * 
     * @protected
     * @type {WebGLBuffer}
     */
    protected mVBO:WebGLBuffer;
    /**
     * WebGL buffer handler 
     * 
     * @readonly
     */
    public get VBO(){
        return this.mVBO;
    }
    /**
     * Creates an instance of ReadOnlyVBO.
     * 
     * @param {WebGLRenderingContext} gl
     * @param {gl.ARRAY_BUFFER| gl.ELEMENT_ARRAY_BUFFER} glBufferType possible values  
     * @param {number[]} bufferData vertices data array
     * @param {Float32Array|Float64Array|Int32Array|Int16Array|Int8Array} bufferDataType possible values 
     */
    constructor(protected gl:WebGLRenderingContext,protected glBufferType,bufferData:number[],bufferDataType){
        this.mVBO=gl.createBuffer();
        this.attach();
        this.gl.bufferData(this.glBufferType,new bufferDataType(bufferData),gl.STATIC_DRAW);
    }
    /**
     * bind buffer 
     */
    attach(){
        this.gl.bindBuffer(this.glBufferType,this.mVBO);
    }

    /**
     * deletes the buffer from memory 
     */
    dispose(){

        this.gl.deleteBuffer(this.mVBO);
    }

}



