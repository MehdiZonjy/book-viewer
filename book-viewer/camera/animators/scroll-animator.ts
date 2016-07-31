import {OverScroller} from '../over-scroll';
import {Camera} from '../../../engine/core';
import {CameraBounds} from '../misc';

export enum ScrollAnimationTrigger {
    Fling, Pullback, None
}
export class ScrollAnimator {
    private mScroller: OverScroller;
    private mCurrentX: number;
    private mCurrentY: number;
    private mShouldAnimateX;
    private mShouldAnimateY;
    private mScrollAnimationTrigger: ScrollAnimationTrigger;

    public constructor(private mCameraBounds: CameraBounds, private mCamera: Camera) {
        this.mScroller = new OverScroller();
        this.mScrollAnimationTrigger = ScrollAnimationTrigger.None;
    }

    public cancelScroll() {
        this.mScroller.forceFinished(true);
    }

    public fling(velocityX: number, velocityY: number) {

        this.mCameraBounds.update();


        this.mCurrentX = this.mCameraBounds.CurrentX;// startX;
        this.mCurrentY = this.mCameraBounds.CurrentY;//startY;
        console.log(`currentX ${this.mCurrentX}`);
        console.log(`currentY ${this.mCurrentY}`);


        this.mScroller.fling(this.mCurrentX, this.mCurrentY, -velocityX, -velocityY, this.mCameraBounds.MinX,
            this.mCameraBounds.MaxX, this.mCameraBounds.MinY, this.mCameraBounds.MaxY, 0, 0);
        this.mShouldAnimateX = true;
        this.mShouldAnimateY = true;
        this.mScrollAnimationTrigger = ScrollAnimationTrigger.Fling;
    }
    public pullBack() {
        this.mCameraBounds.update();
        this.mCurrentX = this.mCameraBounds.CurrentX;// startX;
        this.mCurrentY = this.mCameraBounds.CurrentY;//startY;

        this.mShouldAnimateX = this.mCurrentX < this.mCameraBounds.MinX || this.mCurrentX > this.mCameraBounds.MaxX
        this.mShouldAnimateY = this.mCurrentY < this.mCameraBounds.MinY || this.mCurrentY > this.mCameraBounds.MaxY;
        if (this.mShouldAnimateX || this.mShouldAnimateY) {
            this.mScroller.springBack(this.mCurrentX, this.mCurrentY, this.mCameraBounds.MinX,
                this.mCameraBounds.MaxX, this.mCameraBounds.MinY, this.mCameraBounds.MaxY);
            this.mScrollAnimationTrigger = ScrollAnimationTrigger.Pullback;

        }
    }
    public getAnimationTriggerSource(): ScrollAnimationTrigger {
        return this.mScrollAnimationTrigger;
    }
    public isFinished() {
        return this.mScroller.isFinished();
    }
    public finish() {
        this.mScroller.forceFinished(true)
        this.mShouldAnimateX=false;
        this.mShouldAnimateY=false;
        this.mScrollAnimationTrigger=ScrollAnimationTrigger.None;
    }
    public abort() {
        this.mScroller.abortAnimation();
    }
    public isActive(): boolean {
        return this.mShouldAnimateX || this.mShouldAnimateY;
    }

    public update() {
        //    if (this.mScroller.isFinished()) {
        ////        return; // remaining post that should not be handled
        //    }

        //ImageView imageView = getImageView();
        const isScrollerActive = this.mScroller.computeScrollOffset()
        if (this.mShouldAnimateX || this.mShouldAnimateY) {
            console.log('update fling animator');
            const newX =  /*this.mScroller.isXFinished() ? 0 :*/ this.mScroller.getCurrX();
            const newY =/* this.mScroller.isYFinished() ? 0 : */this.mScroller.getCurrY();
            let deltaX, deltaY;
            if (isNaN(newX) || !this.mShouldAnimateX) {
                deltaX = 0;
            }
            else {
                deltaX = this.mCurrentX - newX;

            }
            if (isNaN(newY) || !this.mShouldAnimateY) {
                deltaY = 0;
            }
            else
                deltaY = this.mCurrentY - newY;

            console.log(`newX ${newX}`);
            console.log(`newY ${newY}`);


            console.log(`deltaX ${deltaX}`);
            console.log(`deltaY ${deltaY}`);

            this.mCamera.postTranslation(deltaX, deltaY);
            this.mCurrentX = newX;
            this.mCurrentY = newY;
            if (!isScrollerActive) {
                this.mShouldAnimateX = false;// isScrollerActive;
                this.mShouldAnimateY = false;
                this.mScrollAnimationTrigger = ScrollAnimationTrigger.None;

            }
        }
    }


}