import {Camera}from '../engine/core';
import * as Hammer from 'hammerjs';
import {DecayAnimator} from './decay-animator';
import {ZoomAnimator} from './zoom-animator';
import {range} from '../engine/math';
/**
 * handles camera pan and pinch(zoom) movement 
 * 
 * @export
 * @class CameraViewAnimator
 */
export class CameraViewAnimator {
    /**
     * HammerJS instance  
     * 
     * @private
     */
    private mHammer: HammerManager;
    /**
     * used to slowly animate Pan movement
     * 
     * @private
     * @type {DecayAnimator}
     */
    private mPanAnimator: DecayAnimator;
    /**
     * animates pinch movment on desktop( mouse wheel)
     * 
     * @private
     * @type {ZoomAnimator}
     */
    private mZoomAnimator: ZoomAnimator;

    /**
     * previous distance between the two pinch fingers
     * used to calculate the Zoom factor
     * @private
     */
    private mLastScaleSpan;

    static get MAX_ZOOM() {
        return 8;
    }
    static get MIN_ZOOM() {
        return 1;
    }
    /**
     * Creates an instance of CameraViewAnimator.
     * 
     * @param {HTMLCanvasElement} mCanvas
     * @param {Camera} mCamera
     */
    constructor(private mCanvas: HTMLCanvasElement, private mCamera: Camera) {
        this.initEvents();
        this.mPanAnimator = new DecayAnimator(this.onUpdateCameraPan);
        this.mZoomAnimator = new ZoomAnimator(this.zoom);

    }
    /**
     * hooks DOM events
     * 
     * @private
     */
    private initEvents() {
        this.mHammer = new Hammer(this.mCanvas);
        this.mHammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        this.mHammer.get('pinch').set({ enable: true });
        this.mHammer.on('pan', this.onPan);
        this.mHammer.on('pinchmove pinchstart', this.onPinch);
        this.mCanvas.addEventListener('mousewheel', this.onMouseWheel, false);


    }
    /**
     * update animations
     * 
     * @param {number} deltaTime
     */
    public update(deltaTime: number) {
        this.mPanAnimator.update(deltaTime);
        this.mZoomAnimator.update();

    }
    /**
     * handles pan movement 
     * 
     * @private
     */
    private onPan = (e: HammerInput) => {
        switch (e.type) {
            case 'pan':
            case 'panmove':
            case 'panstart':
                this.mPanAnimator.setVelocity(e.velocityX * 750, e.velocityY * 750);
                break;
        }
    }

    /**
     * updates camera translation using values reported by {DecayAnimator}
     * 
     * @private
     */
    private onUpdateCameraPan = (dx, dy) => {
        this.mCamera.postTranslation(dx, dy);
    }

    /**
     * handles pinch(zoom) event on mobile
     */
    onPinch = (ev) => {
        switch (ev.type) {
            case 'pinchmove':
                {
                    //first touch pointer
                    let p1 = { x: ev.pointers[0].clientX, y: ev.pointers[0].clientY };

                    //second touch pointer
                    let p2 = { x: ev.pointers[1].clientX, y: ev.pointers[1].clientY };

                    //scale span is the distance between the two touch pointers
                    let scaleSpan = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

                    //span is the difference between the current scaleSpan the the scaleSpan from previous frame
                    let span = (scaleSpan - this.mLastScaleSpan).toFixed(3);
                    //if true then the user has either moved his fingers closer or further from each other, and we need to zoom in or out
                    if (span != '0') {
                        let scale = Math.abs(scaleSpan / this.mLastScaleSpan);

                        //since we are using a uniform scale just reading the scaleX is enough 
                        let currentScale = this.mCamera.ScaleX;

                        let targetScale = currentScale * scale;
                        let deltaScale = Math.abs(targetScale - currentScale);

                        //console.log(`delta scale ${deltaScale}`);
                        //  if (deltaScale > 0.1 || this.mZoomAnimator.isActive)
                        //      this.mZoomAnimator.setup(currentScale, targetScale, ev.center.x, ev.center.y, 50);
                        // else


                        //apply scale 
                        this.zoom(targetScale, ev.center.x, ev.center.y);

                    }
                    this.mLastScaleSpan = scaleSpan;
                    //  console.log(ev);
                    //  console.log(ev.scale);
                    break;
                }
            case 'pinchstart':
                {
                    let p1 = { x: ev.pointers[0].clientX, y: ev.pointers[0].clientY };
                    let p2 = { x: ev.pointers[1].clientX, y: ev.pointers[1].clientY };
                    this.mLastScaleSpan = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
                    break;
                }
        }
    }
    /**
     * handles zoom on desktop via mousewheel 
     */
    onMouseWheel = (evt) => {
        var delta = evt.wheelDelta > 0 ? 1.5 : 0.5;// ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
        // this.zoom(delta, evt.offsetX, evt.offsetY);
        
        //mouse wheel zoom is applied via an animator to provide a smooth zoom effect
        this.mZoomAnimator.setup(this.mCamera.ScaleX, this.mCamera.ScaleX * delta, evt.offsetX, evt.offsetY, 200);
        
        return evt.preventDefault() && false;

    }


   /**
    * apply scale at point  (centerX , centerY)
    */
    zoom = (targetScale, centerX, centerY) => {
        targetScale = range(targetScale, CameraViewAnimator.MIN_ZOOM, CameraViewAnimator.MAX_ZOOM);

        //to scale at a point:
        // calculate the point transformation relative to viewPort
        let p1 = this.mCamera.transformPointInverse(centerX, centerY);// this.transformation.applyToInversePointPoint(centerX, centerY);
        // translate to point
        this.mCamera.postTranslation(p1[0], p1[1]);
        //apply scale
        this.mCamera.setScale(targetScale,targetScale);

        // translate back to where we were
        this.mCamera.postTranslation(-p1[0], -p1[1]);
    }



}