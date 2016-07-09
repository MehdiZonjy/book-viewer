import {MatrixHelper} from '../math';
import {mat3, vec2, vec3, GLM} from 'gl-matrix';

/**
 * ecnapsulates a transformation matrix and offers an interface to manipulate 
 * scale and  translation.
 * @export
 * @abstract
 * @class MovableObject
 */
export abstract class MovableObject {

    /**
     * indicates that the transformation matrix has been changed 
     * 
     * @private
     * @type {boolean}
     */
    private mIsTransformationDirty: boolean;
    /**
     * a cahced version of the inverse of transformation matrix 
     * @private
     * @type {GLM.IArray}
     */
    private mCachedInverse: GLM.IArray;
    //   private mPosition;
    //   private mScale;

    /**
     * transformation matrix, encapsulates the object position,scale and rotation 
     * @private
     * @type {GLM.IArray}
     */
    private mTransformation: GLM.IArray;

    /**
     * Creates an instance of MovableObject.
     * 
     */
    constructor() {
        this.mTransformation = mat3.create();
        this.mCachedInverse=mat3.create();
        this.mIsTransformationDirty=true;
    }
    /**
     * returns the transformation matrix.
     * transformation matrix is an instance of {Float32Array} so no casting is required  to load it to shader 
     * Any modification to transformation matrix shouldn't be performed using {MovableObject} interface.
     * @readonly
     */
    public get Transformations():GLM.IArray {
        if (this.mIsTransformationDirty) {
            //recalc transformations matrix
        }
        return this.mTransformation;
    }


    /*  public get Position() {
          return this.mPosition;
      }
      public set Position(position) {
          this.mIsTransformationDirty = true;
      }*/
    /**
     * get X position
     * @readonly 
     * @type {number}
     */  
    public get PositionX():number {
        return this.mTransformation[MatrixHelper.TRANSLATION_X];
    }
    /**
     * get Y position 
     * @readonly
     * @type {number}
     */
    public get PositionY():number {
        return this.mTransformation[MatrixHelper.TRANSLATION_X];
    }
    /**
     * get position as vector 
     * @readonly
     */
    public get Position():number[] {
        return [this.mTransformation[MatrixHelper.TRANSLATION_X], this.mTransformation[MatrixHelper.TRANSLATION_Y]];
    }
    /**
     * get X scale 
     * @readonly
     */
    public get ScaleX() {
        return this.mTransformation[MatrixHelper.SCALE_X];
    }
    /**
     * get Y scale 
     * @readonly
     */
    public get ScaleY() {
        return this.mTransformation[MatrixHelper.SCALE_Y];
    }
    /**
     * returns the inverse of transformation matrix 
     * @readonly
     * @type {GLM.IArray}
     */
    public get InverseTransform(): GLM.IArray {
        if (this.mIsTransformationDirty)
            mat3.invert(this.mCachedInverse, this.mTransformation);
            //TODO should reset mIsTransformationDirty to false, maybe should also call an abstract function so children of this class can do some recalculations as well 
        return this.mCachedInverse;
    }


    /*    public set Scale(scale) {
            this.mIsTransformationDirty = true;
    
        }*/
    /**
     * resets transformation matrix to identity matrix 
     */
    public reset() {
        mat3.identity(this.mTransformation);
    }
    /**
     * apply translation
     * @param {number} deltaX
     * @param {number} deltaY
     */
    public postTranslation(deltaX:number, deltaY:number) {
        mat3.translate(this.mTransformation, this.mTransformation, vec2.fromValues(deltaX, deltaY));
    }
    /**
     * apply scale 
     * @param {number} scaleX
     * @param {number} scaleY
     */
    public postScale(scaleX:number, scaleY:number) {
        mat3.scale(this.mTransformation, this.mTransformation, vec2.fromValues(scaleX, scaleY));
    }
    /**
     * scale x and y uniformly 
     * @param {number} scale
     */
    public postUniformScale(scale:number) {
        this.postScale(scale, scale);
    }
    /**
     * set scale to targetScaleX and targetScaleY 
     * 
     * @param {number} targetScaleX
     * @param {number} targetScaleY
     */
    public setScale(targetScaleX:number, targetScaleY:number) {
        this.postScale(targetScaleX / this.ScaleX, targetScaleY / this.ScaleY);
    }
    /**
     * set position to X and Y 
     * 
     * @param {number} x
     * @param {number} y
     */
    public setTranslation(x:number, y:number) {
        this.postTranslation(-this.PositionX, -this.PositionY);
        this.postTranslation(x, y);

    }

    /**
     * apply transformation to a point 
     * 
     * @param {number} x
     * @param {number} y
     * @returns {GLM.IArray} transformed point
     */
    public transformPoint(x:number, y:number):GLM.IArray {
        let point = vec2.fromValues(x, y);
        vec2.transformMat3(point, point, this.Transformations);
        return point;
    }
    /**
     * apply inverse transformation to a point 
     * 
     * @param {number} x
     * @param {number} y
     * @returns {GLM.IArray}  transformed point
     */
    public transformPointInverse(x:number,y:number):GLM.IArray{
        let point = vec2.fromValues(x,y);
        vec2.transformMat3(point,point,this.InverseTransform);
        return point;
    }
}