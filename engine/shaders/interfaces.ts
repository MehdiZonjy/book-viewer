import {GLM} from 'gl-matrix';
export interface IShader{
    ViewWorldLocation;
    ProjectionLocation;

    setProjection(projection:GLM.IArray|Float32Array);
    setViewWorld(viewWorld:GLM.IArray|Float32Array);
    beginDraw(projection:GLM.IArray|Float32Array);
    endDraw();


}

export interface PositionShader extends IShader{
     PositionLocation:number;
}
export interface PositionColorShader extends PositionShader{
    ColorLocation:number;
    setColor(r,g,b,a);
    getColor();
}
export interface PositionTexcoordShader extends PositionShader{
    TexcoordLocation:number;
    setTexture(texture);
}