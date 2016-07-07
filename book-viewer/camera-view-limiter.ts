import {Camera} from '../engine/core';
export class CameraViewLimiter {
    private mMinX: number;
    private mMaxX: number;
    private mMinY: number;
    private mMaxY: number;
    private mCamera: Camera;
    constructor(private camera: Camera, private minX: number, maxX: number, minY: number, maxY: number) {
        this.mMinX = minX;
        this.mMaxX = maxX;

        this.mMinY = minY;
        this.mMaxY = maxY;

        this.mCamera = camera;
    }


    update() {
        let viewBounds = this.mCamera.getVisisbleViewBounds();
        let shiftX = 0, shiftY = 0;
        if (viewBounds[0][0] < this.mMinX) 
            shiftX = viewBounds[0][0] - this.mMinX;
        else if(viewBounds[1][0]> this.mMaxX)
            shiftX = viewBounds[1][0] - this.mMaxX;

        if(viewBounds[0][1]<this.mMinY)
            shiftY = viewBounds[0][1] - this.mMinY;
        else if ( viewBounds[1][1] > this.mMaxY)
            shiftY = viewBounds[1][1] - this.mMaxY;


        if(shiftX!=0 || shiftY!=0)
            this.mCamera.postTranslation(shiftX,shiftY);

        
        //TODO display somekind of effect on the bounds as an indicator that player has reached the edge ( possibly some flashy fading color)
    }

}