import {MovableObject} from  '../core/';
import {GLM,mat3} from 'gl-matrix';
import {IShader} from '../shaders';

export class BaseSprite extends MovableObject {

    protected mViewWorld: GLM.IArray;

    constructor() {
        super();
        this.mViewWorld = mat3.create();
    }


    protected updateViewWorld(view: GLM.IArray) {
        mat3.multiply(this.mViewWorld, view, this.Transformations);

    }
    protected loadViewWorldToShader(shader: IShader, view: GLM.IArray) {
        this.updateViewWorld(view);
        shader.setViewWorld(this.mViewWorld);
    }

    public setWidth(width) {
        this.setScale(width, this.ScaleY);
    }
    public setHeight(height) {
        this.setScale(this.ScaleX, height);
    }
}