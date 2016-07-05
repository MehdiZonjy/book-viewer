import {Camera}from '../engine/core';
import * as Hammer from 'hammerjs';
import {DecayAnimator} from './decay-animator';
import {ZoomAnimator} from './zoom-animator';
import {range} from '../engine/math';
export class CameraViewAnimator {
    private mHammer;
    private mPanAnimator: DecayAnimator;
    private mZoomAnimator: ZoomAnimator;
    private mLastScaleSpan;

    static get MAX_ZOOM() {
        return 8;
    }
    static get MIN_ZOOM() {
        return 1;
    }

    constructor(private mCanvas: HTMLCanvasElement, private mCamera: Camera) {
        this.initEvents();
        this.mPanAnimator = new DecayAnimator(this.onUpdateCameraPan);
        this.mZoomAnimator = new ZoomAnimator(this.zoom);

    }

    private initEvents() {
        this.mHammer = new Hammer(this.mCanvas);
        this.mHammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        this.mHammer.get('pinch').set({ enable: true });
        this.mHammer.on('pan', this.onPan);
        this.mHammer.on('pinchmove pinchstart', this.onPinch);
        this.mCanvas.addEventListener('mousewheel', this.onMouseWheel, false);


    }
    public update(deltaTime) {
        this.mPanAnimator.update(deltaTime);
        this.mZoomAnimator.update(deltaTime);

    }

    private onPan = (e: HammerInput) => {
        switch (e.type) {
            case 'pan':
            case 'panmove':
            case 'panstart':
                this.mPanAnimator.setVelocity(e.velocityX * 750, e.velocityY * 750);
                break;
        }
    }


    private onUpdateCameraPan = (dx, dy) => {
        this.mCamera.postTranslation(dx, dy);
    }


    onPinch = (ev) => {
        switch (ev.type) {
            case 'pinchmove':
                {
                    let p1 = { x: ev.pointers[0].clientX, y: ev.pointers[0].clientY };
                    let p2 = { x: ev.pointers[1].clientX, y: ev.pointers[1].clientY };

                    let scaleSpan = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
                    let span = (scaleSpan - this.mLastScaleSpan).toFixed(3);
                    if (span != '0') {
                        let scale = Math.abs(scaleSpan / this.mLastScaleSpan);
                        let currentScale = this.mCamera.ScaleX;
                        let targetScale = currentScale * scale;
                        let deltaScale = Math.abs(targetScale - currentScale);
                        console.log(`delta scale ${deltaScale}`);
                      //  if (deltaScale > 0.1 || this.mZoomAnimator.isActive)
                      //      this.mZoomAnimator.setup(currentScale, targetScale, ev.center.x, ev.center.y, 50);
                       // else
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
                    // console.log(ev.center);
                    break;
                }
        }
    }

    onMouseWheel = (evt) => {
        var delta = evt.wheelDelta > 0 ? 1.5 : 0.5;// ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
        // this.zoom(delta, evt.offsetX, evt.offsetY);
        this.mZoomAnimator.setup(this.mCamera.ScaleX, this.mCamera.ScaleX * delta, evt.offsetX, evt.offsetY, 200);

        return evt.preventDefault() && false;

    }


    /**
    * 
    * use the following formula 
    * targetScale = Range ( scale,minScale,maxScale)
    * deltaScale  =   targetScale/currentScale 
    * transformation.scale(deltaScale)
    * 
    */
    zoom = (targetScale, centerX, centerY) => {
        targetScale = range(targetScale, CameraViewAnimator.MIN_ZOOM, CameraViewAnimator.MAX_ZOOM);
        let oldScale = this.mCamera.ScaleX
        let deltaScale = targetScale / oldScale;

        let p1 = this.mCamera.transformPointInverse(centerX, centerY);// this.transformation.applyToInversePointPoint(centerX, centerY);
        this.mCamera.postTranslation(p1[0], p1[1]);
        this.mCamera.postUniformScale(deltaScale);
        ///   let values = this.transformation.toArray();
        //   if (values[0] < BookViewer.MIN_ZOOM)
        //      this.transformation.setTransform(BookViewer.MIN_ZOOM, values[1], values[2], BookViewer.MIN_ZOOM, values[4], values[5])
        //   else if (values[0] > BookViewer.MAX_ZOOM)
        //      this.transformation.setTransform(BookViewer.MAX_ZOOM, values[1], values[2], BookViewer.MAX_ZOOM, values[4], values[5])
        //
        this.mCamera.postTranslation(-p1[0], -p1[1]);
    }



}