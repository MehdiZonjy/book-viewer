import {GestureDetector, IGestureCallback} from './gesture-detector';
import {Camera} from '../../engine/core';
import {range} from '../../engine/math';
import {FlingAnimator,ScaleAnimator} from './animators';
export class CameraController implements IGestureCallback {
    private mGestureDetector: GestureDetector;
    private mFlingAnimator: FlingAnimator;
    private mScaleAnimator: ScaleAnimator;
    constructor(private mCanvas: HTMLCanvasElement, private mCamera: Camera, private mMaxY) {
        this.mGestureDetector = new GestureDetector(this.mCanvas, this);
        this.mFlingAnimator = new FlingAnimator(this.mCamera);
        this.mScaleAnimator = new ScaleAnimator(this.mAnimateScaleCallback);
    }
    private mAnimateScaleCallback = (targetScale: number, centerX: number, centerY: number, hasFinished: boolean) => {
        //to scale at a point:
        // calculate the point transformation relative to viewPort
        let p1 = this.mCamera.transformPointInverse(centerX, centerY);// this.transformation.applyToInversePointPoint(centerX, centerY);
        // translate to point
        this.mCamera.postTranslation(p1[0], p1[1]);
        //apply scale
        this.mCamera.setScale(targetScale, targetScale);

        // translate back to where we were
        this.mCamera.postTranslation(-p1[0], -p1[1]);
        console.log('update scale callback');
        if (hasFinished) {
            console.log('scale animation finished');
            this.mFlingAnimator.pullBack(this.mCanvas.width, this.mMaxY);
        }


    }

    public onScale(scale: number, centerX: number, centerY, shouldAnimate: boolean) {
        console.log('onScale');
        if (!this.mFlingAnimator.isFinished())
            this.mFlingAnimator.finish();


        let targetScale = this.mCamera.ScaleX * scale;
        targetScale = range(targetScale, 0.5, 1.75);
        /* if (targetScale < 1) {
             centerX = this.mCanvas.width / 2;
             centerY = this.mCanvas.height / 2;
         }*/

        if (shouldAnimate) {
            this.mScaleAnimator.init(this.mCamera.ScaleX, targetScale, centerX, centerY);
            return;
        }


        //to scale at a point:
        // calculate the point transformation relative to viewPort
        let p1 = this.mCamera.transformPointInverse(centerX, centerY);// this.transformation.applyToInversePointPoint(centerX, centerY);
        // translate to point
        this.mCamera.postTranslation(p1[0], p1[1]);
        //apply scale
        this.mCamera.setScale(targetScale, targetScale);

        // translate back to where we were
        this.mCamera.postTranslation(-p1[0], -p1[1]);



    }
    public onScaleFinished() {
        this.mFlingAnimator.pullBack(this.mCanvas.width, this.mMaxY);
        console.log('onscale finished');

    }
    public onPan(dx: number, dy: number) {
        if (!this.mFlingAnimator.isFinished()) {
            console.log('cancel active fling');
            this.mFlingAnimator.finish();
        }
        const currentScale = this.mCamera.ScaleX;
        this.mCamera.postTranslation( dx/currentScale, dy/currentScale);
    }

    public onPanFinished(flingTriggered) {
        console.log('onPanFinished');
        console.log(`flingAnimator.IsFinshed ${this.mFlingAnimator.isFinished()}`);
        console.log(`flingTriggered ${flingTriggered}`);        
        if (this.mFlingAnimator.isFinished() && !flingTriggered) {
            this.mFlingAnimator.pullBack(this.mCanvas.width, this.mMaxY);
        }
    }
    public onFling(velocityX: number, velocityY: number) {
        console.log(`onfling ${velocityX} ${velocityY}`);
        this.mFlingAnimator.fling(this.mCanvas.width, this.mMaxY, velocityX, velocityY);


    }

    public update(deltaTime: number) {
        this.mFlingAnimator.update();
        this.mScaleAnimator.update();
    }

}