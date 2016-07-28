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


    private mVersion: number;
    private mInverseTransVersion: number;

    /**
     * Creates an instance of MovableObject.
     * 
     */
    constructor() {
        this.mTransformation = mat3.create();
        this.mCachedInverse = mat3.create();
        this.mVersion = 0;
    }
    /**
     * returns the transformation matrix.
     * transformation matrix is an instance of {Float32Array} so no casting is required  to load it to shader 
     * Any modification to transformation matrix shouldn't be performed using {MovableObject} interface.
     * @readonly
     */
    public get Transformations(): GLM.IArray {
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
    public get PositionX(): number {
        return this.mTransformation[MatrixHelper.TRANSLATION_X];
    }
    /**
     * get Y position 
     * @readonly
     * @type {number}
     */
    public get PositionY(): number {
        return this.mTransformation[MatrixHelper.TRANSLATION_X];
    }
    /**
     * get position as vector 
     * @readonly
     */
    public get Position(): number[] {
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

    public get Version() {
        return this.mVersion;
    }
    /**
     * returns the inverse of transformation matrix 
     * @readonly
     * @type {GLM.IArray}
     */
    public get InverseTransform(): GLM.IArray {
        if (this.mInverseTransVersion !== this.mVersion) {
            mat3.invert(this.mCachedInverse, this.mTransformation);
            this.mInverseTransVersion = this.mVersion;
        }
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
        this.mVersion++;
    }
    /**
     * apply translation
     * @param {number} deltaX
     * @param {number} deltaY
     */
    public postTranslation(deltaX: number, deltaY: number) {
        mat3.translate(this.mTransformation, this.mTransformation, vec2.fromValues(deltaX, deltaY));
        this.mVersion++;
    }
    /**
     * apply scale 
     * @param {number} scaleX
     * @param {number} scaleY
     */
    public postScale(scaleX: number, scaleY: number) {
        mat3.scale(this.mTransformation, this.mTransformation, vec2.fromValues(scaleX, scaleY));
        this.mVersion++;
    }
    /**
     * scale x and y uniformly 
     * @param {number} scale
     */
    public postUniformScale(scale: number) {
        this.postScale(scale, scale);
        this.mVersion++;
    }
    /**
     * set scale to targetScaleX and targetScaleY 
     * 
     * @param {number} targetScaleX
     * @param {number} targetScaleY
     */
    public setScale(targetScaleX: number, targetScaleY: number) {
        this.postScale(targetScaleX / this.ScaleX, targetScaleY / this.ScaleY);
        this.mVersion++;
    }
    /**
     * set position to X and Y 
     * 
     * @param {number} x
     * @param {number} y
     */
    public setTranslation(x: number, y: number) {
        this.postTranslation(-this.PositionX, -this.PositionY);
        this.postTranslation(x, y);
        this.mVersion++;

    }

    /**
     * apply transformation to a point 
     * 
     * @param {number} x
     * @param {number} y
     * @returns {GLM.IArray} transformed point
     */
    public transformPoint(x: number, y: number): GLM.IArray {
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
    public transformPointInverse(x: number, y: number): GLM.IArray {
        let point = vec2.fromValues(x, y);
        vec2.transformMat3(point, point, this.InverseTransform);
        return point;
    }
}