import {GLM} from 'gl-matrix';
/**
 * a base shader interface provides commun interface for managing shader  
 * @export
 * @interface IShader
 */
export interface IShader{
    ViewWorldLocation;
    ProjectionLocation;

    setProjection(projection:GLM.IArray|Float32Array);
    setViewWorld(viewWorld:GLM.IArray|Float32Array);
    beginDraw(projection:GLM.IArray|Float32Array);
    endDraw();


}

/**
 * 
 * a shader that provides an interface to manipulte Position attribute 
 * @export
 * @interface PositionShader
 * @extends {IShader}
 */
export interface PositionShader extends IShader{
     PositionLocation:number;
}
/**
 * a shader that provides an interface to manipulate a uniform vertex color 
 * @export
 * @interface PositionColorShader
 * @extends {PositionShader}
 */
export interface PositionColorShader extends PositionShader{
    ColorLocation:number;
    setColor(r,g,b,a);
    getColor();
}
/**
 * a shader that provides an interface to maniuplate TextureCoord attribute 
 * @export
 * @interface PositionTexcoordShader
 * @extends {PositionShader}
 */
export interface PositionTexcoordShader extends PositionShader{
    TexcoordLocation:number;
    setTexture(texture);
}