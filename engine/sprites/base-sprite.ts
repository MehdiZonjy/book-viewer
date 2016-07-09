import {MovableObject} from  '../core/';
import {GLM, mat3} from 'gl-matrix';
import {IShader} from '../shaders';

/**
 * a base class for Sprite
 * 
 * @export
 * @class BaseSprite
 * @extends {MovableObject}
 */
export class BaseSprite extends MovableObject {

    /**
     * holds camera.View * MobableObject.Transformation
     * 
     * @protected
     * @type {GLM.IArray}
     */
    protected mViewWorld: GLM.IArray;

    /**
     * Creates an instance of BaseSprite.
     * 
     */
    constructor() {
        super();
        this.mViewWorld = mat3.create();
    }


    /**
     * recalculate {mViewWorld} matrix
     * 
     * @protected
     * @param {GLM.IArray} view
     */
    protected updateViewWorld(view: GLM.IArray) {
        mat3.multiply(this.mViewWorld, view, this.Transformations);

    }
    /**
     * loads updates and loads mViewWorld matrix  into shader
     * 
     * @protected
     * @param {IShader} shader
     * @param {GLM.IArray} view
     */
    protected loadViewWorldToShader(shader: IShader, view: GLM.IArray) {
        this.updateViewWorld(view);
        shader.setViewWorld(this.mViewWorld);
    }
    /**
     * set sprite Width (scaleX) 
     * 
     * @param {any} width
     */
    public setWidth(width) {
        this.setScale(width, this.ScaleY);
    }
    /**
     *  set sprite Height {scaleY}
     * 
     * @param {any} height
     */
    public setHeight(height) {
        this.setScale(this.ScaleX, height);
    }
}