import {OverScroller} from '../over-scroll';
import {Camera} from '../../../engine/core';
export class FlingAnimator {
    private mScroller: OverScroller;
    private mCurrentX: number;
    private mCurrentY: number;

    public constructor(private mCamera: Camera) {
        this.mScroller = new OverScroller();
    }

    public cancelFling() {
        this.mScroller.forceFinished(true);
    }

    public fling(viewWidth: number, viewHeight: number, velocityX: number,
        velocityY: number) {
        console.log('flink');
        const visibleArea = this.mCamera.getVisisbleViewBounds();
        const visibleAreaWidth = Math.abs(visibleArea[0][0] - visibleArea[1][0]);
        const visibleAreaHeight = Math.abs(visibleArea[0][1] - visibleArea[1][1]);
        const startX = Math.round(visibleArea[0][0]);
        //  final int startX = Math.round(-rect.left);
        //   final int minX, maxX, minY, maxY;
        let minX = 0, maxX = 0, minY = 0, maxY = 0;
        if (viewWidth > visibleAreaWidth) {
            minX = 0;
            maxX = Math.round(viewWidth - visibleAreaWidth);
        } else if (viewWidth < visibleAreaWidth) {
            //zoomed out
            //  const  pageTopLeft=  this.mCamera.transformPoint(0,0);
            //  const  pageBottomRight = this.mCamera.transformPoint(viewWidth,viewHeight);
            // const pageWidth = pageBottomRight[0]- pageTopLeft[0];
            const totalMargin = visibleAreaWidth - viewWidth
            minX = -totalMargin / 2;// this.mCamera.transformPointInverse(-totalMargin / 2, 0)[0];
            maxX = minX; //= this.mCamera.transformPointInverse(viewWidth+totalMargin/2,0)[0];
            velocityX = 0;
            //  maxX =0;// viewWidth;
        }

        const startY = Math.round(visibleArea[0][1]);
        if (viewHeight > visibleAreaHeight) {
            minY = 0;
            maxY = Math.round(viewHeight - visibleAreaHeight);
        } else {
            minY = maxY = startY;
        }

        this.mCurrentX = startX;
        this.mCurrentY = startY;
        console.log(`currentX ${this.mCurrentX}`);
        console.log(`currentY ${this.mCurrentY}`);


        // If we actually can move, fling the scroller
        if (startX != maxX || startY != maxY) {
            this.mScroller.fling(startX, startY, -velocityX, -velocityY, minX,
                maxX, minY, maxY, viewWidth / 3, viewWidth / 3);
        }
    }
    public pullBack(viewWidth: number, viewHeight: number) {
        console.log('pullback');
        const visibleArea = this.mCamera.getVisisbleViewBounds();
        const visibleAreaWidth = Math.abs(visibleArea[0][0] - visibleArea[1][0]);
        const visibleAreaHeight = Math.abs(visibleArea[0][1] - visibleArea[1][1]);
        const startX = Math.round(visibleArea[0][0]);
        //  final int startX = Math.round(-rect.left);
        //   final int minX, maxX, minY, maxY;
        let minX = 0, maxX = 0, minY = 0, maxY = 0;
        if (viewWidth > visibleAreaWidth) {
            minX = 0;
            maxX = Math.round(viewWidth - visibleAreaWidth);
        } else if (viewWidth < visibleAreaWidth) {
            //zoomed out
            //  const  pageTopLeft=  this.mCamera.transformPoint(0,0);
            //  const  pageBottomRight = this.mCamera.transformPoint(viewWidth,viewHeight);
            // const pageWidth = pageBottomRight[0]- pageTopLeft[0];
            const totalMargin = visibleAreaWidth - viewWidth
            minX = -totalMargin / 2;// this.mCamera.transformPointInverse(-totalMargin / 2, 0)[0];
            maxX = minX; //= this.mCamera.transformPointInverse(viewWidth+totalMargin/2,0)[0];
            //  velocityX=0;
            //  maxX =0;// viewWidth;
        }

        const startY = Math.round(visibleArea[0][1]);
        if (viewHeight > visibleAreaHeight) {
            minY = 0;
            maxY = Math.round(viewHeight - visibleAreaHeight);
        } else {
            minY = maxY = startY;
        }

        this.mCurrentX = startX;
        this.mCurrentY = startY;

        console.log(`currentX ${this.mCurrentX}`);
        console.log(`currentY ${this.mCurrentY}`);

        console.log(`minX ${minX}`);
        console.log(`maxX ${maxX}`);

        console.log(`minY ${minY}`);
        console.log(`maxY ${maxY}`);


        // If we actually can move, fling the scroller
        // if (startX != maxX || startY != maxY) {
        let bbb = this.mScroller.springBack(startX, startY, minX,
            maxX, minY, maxY);

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
            window['bp']++;
            console.log('update fling animator');
            const newX =this.mScroller.isXFinished()?0: this.mScroller.getCurrX();
            const newY =this.mScroller.isYFinished()?0: this.mScroller.getCurrY();
            let deltaX, deltaY;
            if (isNaN(newX)|| newX==0) {
                deltaX = 0;
            }
            else {
                deltaX = this.mCurrentX - newX;

            }
            if (isNaN(newY)|| newY==0) {
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