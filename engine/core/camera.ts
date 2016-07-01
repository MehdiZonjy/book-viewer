import {TRANSLATION_X,TRANSLATION_Y,SCALE_X,SCALE_Y}  from '../math/matrix-helper';
import {MovableObject} from './movable-object';

//TODO handle canvas size change event
export class Camera extends MovableObject{
    private mProjection: GLM.IArray;
   // private mView: GLM.IArray;
    constructor(canvas: HTMLCanvasElement) {
        super();
        this.createProjection(canvas.width, canvas.height);
      //  this.mView = mat3.create();
    }
    /*public reset() {
        mat3.identity(this.mView);
    }*/
  /*  public translate(delta) {
        mat3.translate(this.mView, this.mView, delta);
    }
    public setTranslate(position) {
        this.mView[TRANSLATION_X] = position[0];
        this.mView[TRANSLATION_Y] = position[1];
    }
    public getTranslation() {
        return [this.mView[TRANSLATION_X], this.mView[TRANSLATION_Y]];
    }
    public scale(deltaScale) {
        mat3.scale(this.mView, this.mView, deltaScale);
    }

    public getScale() {
        return [this.mView[SCALE_X], this.mView[SCALE_Y]];
    }*/
    public get View() {
        return this.Transformations;// mat3.clone(this.mView);
    }
    public get Projection() {
        return mat3.clone(this.mProjection);
    }



    private createProjection(width, height) {
        this.mProjection = mat3.create();
        this.mProjection[0] = 2 / width;
        this.mProjection[4] = -2 / height;
        this.mProjection[6] = -1;
        this.mProjection[7] = 1;
        /*
    2 / width, 0, 0,
    0, -2 / height, 0,
    -1, 1, 1
        */
    }


}