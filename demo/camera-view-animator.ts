import {Camera}from '../engine/core';
import * as Hammer from 'hammerjs';
import {DecayAnimator} from './decay-animator';
export class CameraViewAnimator {
    private mHammer;
    private mPanAnimator: DecayAnimator;
    constructor(private mCanvas: HTMLCanvasElement, private mCamera: Camera) {
        this.initEvents();
        this.mPanAnimator = new DecayAnimator(this.onUpdateCameraPan);

    }

    private initEvents() {
        this.mHammer = new Hammer(this.mCanvas);
        this.mHammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        this.mHammer.on('pan', this.onPanCamera);


    }
    public update(deltaTime) {
        this.mPanAnimator.update(deltaTime);

    }

    private onPanCamera = (e: HammerInput) => {
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


}