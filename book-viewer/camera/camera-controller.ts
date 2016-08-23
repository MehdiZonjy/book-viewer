import {GestureDetector, IGestureCallback, CameraBounds} from './misc';
import {Camera, IBounds, IDisposable} from '../../engine/core';
import {range} from '../../engine/math';
import {ScrollAnimator, ScaleAnimator, ScrollAnimationTrigger} from './animators';
import {PagesManager} from '../pages-manager';
import {ISubscription} from 'rxjs/Subscription';


const MIN_SCALE = 0.5;
const MAX_SCALE = 1.75;

export class CameraController implements IGestureCallback, IDisposable {
    private mGestureDetector: GestureDetector;
    private mFlingAnimator: ScrollAnimator;
    private mScaleAnimator: ScaleAnimator;
    private mCameraBounds: CameraBounds;

    private mOnSizeChangedSubscription: ISubscription;

    constructor(private mCanvas: HTMLCanvasElement, private mCamera: Camera, private pagesManager: PagesManager) {
        this.mGestureDetector = new GestureDetector(this.mCanvas, this);
        this.mCameraBounds = new CameraBounds(this.mCamera, pagesManager);
        this.mScaleAnimator = new ScaleAnimator(this.mAnimateScaleCallback);
        this.mFlingAnimator = new ScrollAnimator(this.mCameraBounds, this.mCamera);


        this.mOnSizeChangedSubscription = this.mCamera.OnSizeChanged.subscribe((bounds) => {
            setTimeout(() => {
                this.mFlingAnimator.finish();

                this.mFlingAnimator.pullBack();

            }, 0);

        });
    }
    private mAnimateScaleCallback = (targetScale: number, centerX: number, centerY: number, hasFinished: boolean) => {

        this.applyScale(targetScale, centerX, centerY);
        console.log('update scale callback');
        if (hasFinished) {
            console.log('scale animation finished');
            this.mCameraBounds.update();
            this.mFlingAnimator.pullBack();
        }





    }
    private applyScale(targetScale: number, centerX, centerY) {
        targetScale = range(targetScale, MIN_SCALE, MAX_SCALE);

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

    public onScale(scale: number, centerX: number, centerY, shouldAnimate: boolean) {
        console.log('onScale');
        if (!this.mFlingAnimator.isFinished())
            this.mFlingAnimator.finish();


        let targetScale = this.mCamera.ScaleX * scale;
        if (shouldAnimate) {
            this.mScaleAnimator.init(this.mCamera.ScaleX, targetScale, centerX, centerY);
            return;
        }
        this.applyScale(targetScale, centerX, centerY);
    }
    public onScaleFinished() {
        this.mCameraBounds.update();
        this.mFlingAnimator.pullBack();
        console.log('onscale finished');

    }
    public onPan(dx: number, dy: number) {

        if (!this.mFlingAnimator.isFinished()) {

            if (this.mFlingAnimator.getAnimationTriggerSource() == ScrollAnimationTrigger.Pullback)
                return;

            console.log('cancel active fling');
            this.mFlingAnimator.finish();
        }
        const currentScale = this.mCamera.ScaleX;
        this.mCamera.postTranslation(dx / currentScale, dy / currentScale);

        this.restrictCameraToBounds();
    }
    private restrictCameraToBounds() {

        //if camera outside of boudns , then pull it back
        this.mCameraBounds.update();
        let deltaX = 0;
        let deltaY = 0;
        //calculate deltaX shift
        if (this.mCameraBounds.CurrentX < this.mCameraBounds.MinX)
            deltaX = this.mCameraBounds.CurrentX - this.mCameraBounds.MinX;
        else if (this.mCameraBounds.CurrentX > this.mCameraBounds.MaxX)
            deltaX = this.mCameraBounds.CurrentX - this.mCameraBounds.MaxX;

        //calculate deltaY shift
        if (this.mCameraBounds.CurrentY < this.mCameraBounds.MinY)
            deltaY = this.mCameraBounds.CurrentY - this.mCameraBounds.MinY;
        else if (this.mCameraBounds.CurrentY > this.mCameraBounds.MaxY)
            deltaY = this.mCameraBounds.CurrentY - this.mCameraBounds.MaxY;

        //apply any neccessery shift to restrict camera bounds
        if (deltaX != 0 || deltaY != 0) {
            this.mCamera.postTranslation(deltaX, deltaY);
            console.log(`deltaX ${deltaX} deltaY ${deltaY}`);

        }
    }

    public onPanFinished(flingTriggered) {
        console.log('onPanFinished');
        console.log(`flingAnimator.IsFinshed ${this.mFlingAnimator.isFinished()}`);
        console.log(`flingTriggered ${flingTriggered}`);
        if (this.mFlingAnimator.isFinished() && !flingTriggered) {
            this.mCameraBounds.update();
            this.mFlingAnimator.pullBack();
        }
    }
    public onFling(velocityX: number, velocityY: number) {
        console.log(`onfling ${velocityX} ${velocityY}`);
        this.mCameraBounds.update();
        this.mFlingAnimator.fling(velocityX, velocityY);
    }

    public update(deltaTime: number) {
        this.mFlingAnimator.update();
        this.mScaleAnimator.update();
    }

    dispose() {
        this.mOnSizeChangedSubscription.unsubscribe();
    }

}