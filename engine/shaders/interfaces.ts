export interface IShader{
    ViewWorldLocation;
    ProjectionLocation;

    setProjection(projection);
    setViewWorld(viewWorld);
    beginShader(projection);
    endShader();


}

export interface PositionShader extends IShader{
     PositionLocation:number;
}
export interface PositionColorShader extends PositionShader{
    //ColorLocation:number;
    setColor(r,g,b,a);
    getColor();
}
export interface PositionTexcoordShader extends PositionShader{
    TexcoordLocation:number;
    setTexture(texture);
}