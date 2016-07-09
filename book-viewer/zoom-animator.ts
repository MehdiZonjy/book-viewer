import {CubicEasing} from '../engine/math';
/**
 * Animates zoom effect by using a cubic easing
 * 
 * @export
 * @class ZoomAnimator
 */
export class ZoomAnimator {
    /**
     * time the animation started
     * 
     * @type {number}
     */
    private mStartTime: number;
    /**
     * indicates if the animation is still runnig 
     * 
     * @private
     * @type {boolean}
     */
    private mIsActive: boolean;
    /**
     * scale from  
     * 
     * @private
     * @type {number}
     */
    private mScaleFrom: number;
    /**
     * scale to
     *  
     * @private
     * @type {number}
     */
    private mScaleTo: number;
    /**
     * difference between mScaleTo and mScaleFrom
     * 
     * @private
     * @type {number}
     */
    private mDeltaScale: number;
    /**
     * animates the scale value
     * 
     * @private
     * @type {CubicEasing}
     */
    private mEasing: CubicEasing;
    /**
     * Point to scale at on X
     * 
     * @private
     * @type {number}
     */
    private mCenterX: number;
    /**
     * Point to scale at on Y
     * 
     * @private
     * @type {number}
     */
    private mCenterY: number;
    /**
     * animation duration
     * 
     * @private
     * @type {number}
     */
    private mDuration: number;

    
    constructor(private onZoomCallback:(scale:number,centerX:number,centerY:number)=>void) {
        this.mIsActive = false;
        this.mEasing = new CubicEasing();
    }

    /**
     * 
     * 
     * @returns
     */
    update() {
        if (!this.mIsActive)
            return;
        let now = Date.now();
        //delta time is the  time duration the animation started and now
        let deltaTime = Math.min(this.mDuration, now - this.mStartTime);
        let newScale = this.mEasing.easeOut(deltaTime, 0, this.mDeltaScale, this.mDuration);
        this.onZoomCallback(this.mScaleFrom + newScale, this.mCenterX, this.mCenterY);
        if (deltaTime >= this.mDuration) {
            this.mIsActive = false;
        }
    }
    /**
     * initiate a new scale animation 
     * 
     * @param {number} currentScale
     * @param {number} targetScale
     * @param {number} centerX
     * @param {number} centerY
     * @param {number} duration
     */
    setup(currentScale: number, targetScale: number, centerX: number, centerY: number, duration: number) {
        this.mDeltaScale = targetScale - currentScale;
        this.mScaleFrom = currentScale;
        this.mStartTime = Date.now();
        this.mCenterX = centerX;
        this.mCenterY = centerY;
        this.mDuration = duration;
        this.mIsActive = true;
    }


}