import {OverScroller} from '../over-scroll';
import {Camera} from '../../../engine/core';
import {CameraBounds} from '../misc';
export class ScrollAnimator {
    private mScroller: OverScroller;
    private mCurrentX: number;
    private mCurrentY: number;

    public constructor(private mCameraBounds: CameraBounds, private mCamera: Camera) {
        this.mScroller = new OverScroller();
    }

    public cancelScroll() {
        this.mScroller.forceFinished(true);
    }

    public fling(velocityX: number, velocityY: number) {



        this.mCurrentX = this.mCameraBounds.CurrentX;// startX;
        this.mCurrentY = this.mCameraBounds.CurrentY;//startY;
        console.log(`currentX ${this.mCurrentX}`);
        console.log(`currentY ${this.mCurrentY}`);


        // If we actually can move, fling the scroller
        if (this.mCameraBounds.CurrentX != this.mCameraBounds.MaxX || this.mCameraBounds.CurrentY != this.mCameraBounds.MaxY) {
            this.mScroller.fling(this.mCurrentX, this.mCurrentY, -velocityX, -velocityY, this.mCameraBounds.MinX,
                this.mCameraBounds.MaxX, this.mCameraBounds.MinY, this.mCameraBounds.MaxY, 0, 0);
        }
    }
    public pullBack() {

        this.mCurrentX = this.mCameraBounds.CurrentX;// startX;
        this.mCurrentY = this.mCameraBounds.CurrentY;//startY;

        this.mScroller.springBack(this.mCurrentX, this.mCurrentY, this.mCameraBounds.MinX,
            this.mCameraBounds.MaxX, this.mCameraBounds.MinY, this.mCameraBounds.MaxY);

    }
    public isFinished() {
        return this.mScroller.isFinished();
    }
    public finish() {
        this.mScroller.forceFinished(true)
    }
    public abort() {
        this.mScroller.abortAnimation();
    }

    public update() {
        if (this.mScroller.isFinished()) {
            return; // remaining post that should not be handled
        }

        //ImageView imageView = getImageView();
        if (this.mScroller.computeScrollOffset()) {
            console.log('update fling animator');
            const newX = this.mScroller.isXFinished() ? 0 : this.mScroller.getCurrX();
            const newY = this.mScroller.isYFinished() ? 0 : this.mScroller.getCurrY();
            let deltaX, deltaY;
            if (isNaN(newX) || newX == 0) {
                deltaX = 0;
            }
            else {
                deltaX = this.mCurrentX - newX;

            }
            if (isNaN(newY) || newY == 0) {
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

        }
    }


}