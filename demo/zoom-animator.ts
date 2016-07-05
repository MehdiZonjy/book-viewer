import {CubicEasing} from './cubic-easing';
export class ZoomAnimator {

    startTime: number;
    isActive: boolean;
    scaleFrom: number;
    scaleTo: number;
    deltaScale: number;
    easing: CubicEasing;
    centerX: number;
    centerY: number;
    duration:number;

    constructor(private onZoomCallback) {
        this.isActive = false;
        this.easing = new CubicEasing();
    }

    update() {
        if (!this.isActive)
            return;
        let now = Date.now();
        let deltaTime = Math.min(this.duration, now - this.startTime);
        let newScale = this.easing.easeOut(deltaTime, 0, this.deltaScale, this.duration);
        this.onZoomCallback(this.scaleFrom + newScale, this.centerX, this.centerY);
        //                zoomTo(oldScale + newScale, destX, destY);

        if (deltaTime >= this.duration) {
            this.isActive = false;
        }
    }

    setup(currentScale, targetScale, centerX, centerY,duration) {
        this.deltaScale = targetScale - currentScale;
        this.scaleFrom = currentScale;
        this.startTime = Date.now();
        this.centerX = centerX;
        this.centerY = centerY;
        this.duration=duration;
        this.isActive = true;
    }


}