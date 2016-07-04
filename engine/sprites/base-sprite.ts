import {MovableObject} from  '../core/';
export class BaseSprite extends MovableObject {

    public setWidth(width){
        this.setScale(width,this.ScaleY);
    }
    public setHeight(height){
        this.setScale(this.ScaleX,height);
    } 
}