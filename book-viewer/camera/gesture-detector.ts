import * as Hammer from 'hammerjs';
import {VelocityTracker} from './velocity/velocity-tracker';
//pinch  stop add a cool down before you start recieving pan
//import {IGestureCallback} from './gesture-detect';


const MINIMUM_VELOCITY = 25;

export class GestureDetector {
    private mHammer: HammerManager;
    private mIsDragging: boolean;
    private mIsScaling: boolean;
    private mVelocityTracker: VelocityTracker;
    private mLastPositionX: number;
    private mLastPositionY: number;
    private mLastScaleSpan: number;

    constructor(private mCanvas: HTMLCanvasElement, private mGesturesCallback: IGestureCallback) {
        this.initEvents();
        this.mVelocityTracker = new VelocityTracker();
    }

    public get isDragging(): boolean {
        return this.mIsDragging;
    }
    public get isScaling(): boolean {
        return this.mIsScaling;
    }

    public setGesturesCallback(callback: IGestureCallback) {
        if (callback == null) {
            console.error("gesture callback can't be null ");
            return;
        }
        this.mGesturesCallback = callback;
    }

    private initEvents() {
        this.mHammer = new Hammer(this.mCanvas);
        this.mHammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        this.mHammer.get('pinch').set({ enable: true });
        this.mHammer.on('panstart panmove panend pancancel', this.onPan);
        this.mHammer.on('pinchmove pinchstart pinchend pinchcancel', this.onPinch);
        this.mCanvas.addEventListener('wheel', this.onMouseWheel, false);


    }


    /**
    * handles pan movement 
    * 
    * @private
    */
    private onPan = (e: HammerInput) => {
        console.log(e.type);
        switch (e.type) {
            case 'panstart':
                this.mIsDragging = false;
                this.mVelocityTracker.clearMovements();
                this.mLastPositionX = e.pointers[0].clientX;
                this.mLastPositionY = e.pointers[0].clientY;
                //      console.clear();
                break;

            case 'panmove': {
                if (this.mIsScaling)
                    return;


                this.mIsDragging = true;


                const currentPositionX = e.pointers[0].clientX;
                const currentPositionY = e.pointers[0].clientY;

                this.mVelocityTracker.addMovement(Date.now(), currentPositionX, currentPositionY);

                this.mGesturesCallback.onPan(currentPositionX - this.mLastPositionX, currentPositionY - this.mLastPositionY);
                this.mLastPositionX = currentPositionX;
                this.mLastPositionY = currentPositionY;

                //this.mGesturesCallback.onPan(e.velocityX*10,e.velocityY*10);

                break;
            }
            case 'pancancel':
            case 'panend':
                if (this.mIsScaling)
                    false;
                if (this.mIsDragging) {
                    let velocity = [0, 0];
                    const currentPositionX = e.pointers[0].clientX;
                    const currentPositionY = e.pointers[0].clientY;
                    this.mVelocityTracker.addMovement(Date.now(), currentPositionX, currentPositionY);

                    this.mVelocityTracker.getVelocity(velocity, 1250);
                    //this.mPanAnimator.setVelocity(velocity[0] * 1000, velocity[1] * 1000);
                    let triggerFling =Math.max(Math.abs(velocity[0]), Math.abs(velocity[1])) > MINIMUM_VELOCITY 
                    if (triggerFling)
                        this.mGesturesCallback.onFling(velocity[0], velocity[1]);

                    console.log(`hammerX ${e.velocityX}  hammerY ${e.velocityY}`);
                    console.log(`velocityX ${velocity[0]} velocityY ${velocity[1]}`);
                    this.mGesturesCallback.onPanFinished(triggerFling);
                }
                this.mIsDragging = false;
                break;
        }
    }



    /**
     * handles pinch(zoom) event on mobile
     */
    onPinch = (ev) => {
        switch (ev.type) {
            case 'pinchmove':
                {
                    //first touch pointer
                    const p1 = { x: ev.pointers[0].clientX, y: ev.pointers[0].clientY };

                    //second touch pointer
                    const p2 = { x: ev.pointers[1].clientX, y: ev.pointers[1].clientY };

                    //scale span is the distance between the two touch pointers
                    const scaleSpan = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

                    //span is the difference between the current scaleSpan the the scaleSpan from previous frame
                    const span = (scaleSpan - this.mLastScaleSpan).toFixed(3);
                    //if true then the user has either moved his fingers closer or further from each other, and we need to zoom in or out
                    if (span != '0') {
                        const scale = Math.abs(scaleSpan / this.mLastScaleSpan);
                        this.mGesturesCallback.onScale(scale, ev.center.x, ev.center.y,false);
                        //since we are using a uniform scale just reading the scaleX is enough 
                        //  let currentScale = this.mCamera.ScaleX;

                        // let targetScale = currentScale * scale;
                        // let deltaScale = Math.abs(targetScale - currentScale);

                        //console.log(`delta scale ${deltaScale}`);
                        //  if (deltaScale > 0.1 || this.mZoomAnimator.isActive)
                        //      this.mZoomAnimator.setup(currentScale, targetScale, ev.center.x, ev.center.y, 50);
                        // else

                        //apply scale 
                        //this.zoom(targetScale, ev.center.x, ev.center.y);

                    }
                    this.mLastScaleSpan = scaleSpan;
                    //  console.log(ev);
                    //  console.log(ev.scale);
                    break;
                }
            case 'pinchstart':
                {
                    this.mIsDragging = true;
                    const p1 = { x: ev.pointers[0].clientX, y: ev.pointers[0].clientY };
                    const p2 = { x: ev.pointers[1].clientX, y: ev.pointers[1].clientY };
                    this.mLastScaleSpan = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
                    break;
                }
            case 'pinchend':
            case 'pinchcancel': {
                this.mGesturesCallback.onScaleFinished();
                this.mIsDragging = false;

            }
        }
    }


    /**
     * handles zoom on desktop via mousewheel 
     */
    onMouseWheel = (evt) => {
        var delta = evt.deltaY < 0 ? 1.25 : 0.75;// ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
        // this.zoom(delta, evt.offsetX, evt.offsetY);
        this.mGesturesCallback.onScale(delta, evt.offsetX, evt.offsetY,true);

        //mouse wheel zoom is applied via an animator to provide a smooth zoom effect
        //this.mZoomAnimator.setup(this.mCamera.ScaleX, this.mCamera.ScaleX * delta, evt.offsetX, evt.offsetY, 200);
        //this.mGesturesCallback.onScaleFinished();

        return evt.preventDefault() && false;

    }

}



export interface IGestureCallback{
    onPan:(dx:number,dy:number)=>void;
    onPanFinished:(flingTriggerd:boolean)=>void;
    onScale:(scale:number,centerX:number,centerY:number,animated:boolean)=>void;
    onScaleFinished:()=>void;
    onFling:(velocityX:number,velocityY:number)=>void;
}