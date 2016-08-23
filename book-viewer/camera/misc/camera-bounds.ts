import {Camera, IBounds,IDisposable} from '../../../engine/core';
import {PagesManager} from '../../pages-manager';
import {ISubscription} from 'rxjs/Subscription';
export class CameraBounds implements IDisposable {
    private mVersion: number;
    private mMinX;
    private mMaxX;
    private mMinY;
    private mMaxY;
    private mCurrentX;
    private mCurrentY;
    private mViewWidth;
    private mViewHeight;
    private mVisibleAreaWidth;
    private mVisibleAreaHeight;
    private mOnSizeChangedSubscription: ISubscription;

    constructor(private mCamera: Camera, private mPagesManager: PagesManager) {
        this.mOnSizeChangedSubscription = this.mCamera.OnSizeChanged.subscribe((bounds) => {
            this.mViewWidth = bounds.width;
            this.mViewHeight = bounds.height;
            this.mVersion++;
            this.update();
        });
    }

    public get MinX() {
        return this.mMinX;
    }
    public get MaxX() {
        return this.mMaxX;
    }
    public get MinY() {
        return this.mMinY;
    }
    public get MaxY() {
        return this.mMaxY;
    }

    public get CurrentX() {
        return this.mCurrentX;
    }
    public get CurrentY() {
        return this.mCurrentY;
    }

    update() {
        if (this.mCamera.Version === this.mVersion)
            return;

        const visibleArea = this.mCamera.getVisisbleViewBounds();
        this.mVisibleAreaWidth = Math.abs(visibleArea[0][0] - visibleArea[1][0]);
        this.mVisibleAreaHeight = Math.abs(visibleArea[0][1] - visibleArea[1][1]);
        this.mCurrentX = Math.round(visibleArea[0][0]);
        this.mCurrentY = Math.round(visibleArea[0][1]);



        this.mMinX = 0, this.mMaxX = 0, this.mMinY = 0, this.mMaxY = 0;

        //camera is zoomed in
        if (this.mViewWidth > this.mVisibleAreaWidth) {
            this.mMaxX = Math.round(this.mViewWidth - this.mVisibleAreaWidth);
        }
        //camera is zoomed out 
        else if (this.mViewWidth < this.mVisibleAreaWidth) {
            const totalMargin = this.mVisibleAreaWidth - this.mViewWidth
            this.mMaxX = this.mMinX = -totalMargin / 2;
        }

        this.mMaxY = Math.round(this.mPagesManager.LastPageMaxY - this.mVisibleAreaHeight);
        console.log(`minY ${this.mMinY} maxY ${this.mMaxY}`);
        console.log(`minX ${this.mMinX} maxX ${this.mMaxX}`);
        console.log(`currentX ${this.mCurrentX} currentY ${this.mCurrentY}`);

        this.mVersion = this.mCamera.Version;

    }


    dispose(){
        this.mOnSizeChangedSubscription.unsubscribe();
    }
}