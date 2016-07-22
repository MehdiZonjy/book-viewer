const DEFAULT_ZOOM_DURATION = 200;
export class ScaleAnimator {

    private mFocalX: number;
    private mFocalY: number;
    private mStartTime: number;
    private mZoomStart: number;
    private mZoomEnd: number;
    private mCallback: any;
    private mIsFinished:boolean;

    public constructor(callback:(targetScale: number, centerX: number, centerY: number, hasFinished:boolean)=>void) {
        this.mCallback=callback;
        this.mIsFinished = true;
    }

    public init(currentZoom: number, targetZoom: number,
        focalX: number, focalY: number) {
        this.mFocalX = focalX;
        this.mFocalY = focalY;
        this.mStartTime = Date.now();//System.currentTimeMillis();
        this.mZoomStart = currentZoom;
        this.mZoomEnd = targetZoom;
        this.mIsFinished = false;
    }
    public isFinished():boolean{
        return this.mIsFinished;
    }

    public update() {

        if (this.mIsFinished)
            return;

        const t = this.interpolate();
        this.mIsFinished= t >= 1;

        let targetScale = this.mZoomStart + t * (this.mZoomEnd - this.mZoomStart);
        //  const deltaScale = scale / getScale();

        this.mCallback(targetScale, this.mFocalX, this.mFocalY,this.mIsFinished);
    }

    private interpolate(): number {
        let t = 1 * (Date.now() - this.mStartTime) / DEFAULT_ZOOM_DURATION;
        t = Math.min(1, t);
        t = (Math.cos((t + 1) * Math.PI) / 2.0) + 0.5; //mInterpolator.getInterpolation(t);
        return t;
    }

}/*

export interface ScaleAnimatorCallback {
    onAnimateScaleUpdate(targetScale: number, centerX: number, centerY: number, hasFinished:boolean)
}*/