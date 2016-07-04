import  {MatrixHelper} from '../math';
import {mat3,vec2,GLM} from 'gl-matrix';

export abstract class MovableObject {

    private mIsTransformationDirty:boolean;
    private mCachedInverse:GLM.IArray;
    //   private mPosition;
    //   private mScale;
    private mTransformation:GLM.IArray;


    constructor() {
        this.mTransformation = mat3.create();
    }

    public get Transformations() {
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
    public get PositionX() {
        return this.mTransformation[MatrixHelper.TRANSLATION_X];
    }
    public get PositionY() {
        return this.mTransformation[MatrixHelper.TRANSLATION_X];
    }
    public get Position() {
        return [this.mTransformation[MatrixHelper.TRANSLATION_X], this.mTransformation[MatrixHelper.TRANSLATION_Y]];
    }
    public get ScaleX() {
        return this.mTransformation[MatrixHelper.SCALE_X];
    }
    public get ScaleY() {
        return this.mTransformation[MatrixHelper.SCALE_Y];
    }
    public get InverseTransform():GLM.IArray {
        if (this.mIsTransformationDirty)
            mat3.invert(this.mCachedInverse, this.mTransformation);
        return this.mCachedInverse;
    }


    /*    public set Scale(scale) {
            this.mIsTransformationDirty = true;
    
        }*/
    public reset() {
        mat3.identity(this.mTransformation);
    }
    public postTranslation(deltaX, deltaY) {
        mat3.translate(this.mTransformation, this.mTransformation, vec2.fromValues(deltaX, deltaY));
    }
    public postScale(scaleX, scaleY) {
        mat3.scale(this.mTransformation, this.mTransformation, vec2.fromValues(scaleX, scaleY));
    }
    public postUniformScale(scale) {
        this.postScale(scale, scale);
    }

    public setScale(scaleX, scaleY) {
        this.postScale(scaleX / this.ScaleX, scaleY / this.ScaleY);
    }
    public setTranslation(x, y) {
        this.postTranslation(-this.PositionX, -this.PositionY);
        this.postTranslation(x, y);

    }




}