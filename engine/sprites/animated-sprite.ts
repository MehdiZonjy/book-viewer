import {Atlas, AtlasEntry} from '../atlas';
import {BaseSprite} from './base-sprite';
import {PositionTexcoordVBO} from '../vertex-buffers';
import {PositionTexcoordShader} from '../shaders';
import {GLM} from 'gl-matrix';
export class AnimatedSprite extends BaseSprite {
    private mVBOs: PositionTexcoordVBO[];
    private mCurrentFrame;
    private mTimePerFrame;
    private mFrameElapsedTime;

    constructor(protected mGl: WebGLRenderingContext, mFPS: number, private mSpriteAtlas: Atlas) {
        super();
        this.createVBOs();
        this.mCurrentFrame = 0;
        this.mTimePerFrame = 1000 / mFPS;
        this.mFrameElapsedTime = 0;
    }
    private createVBOs() {
        this.mVBOs = [];
        for (let i = 0, l = this.mSpriteAtlas.EntriesCount; i < l; i++) {
            const frameEntry = this.mSpriteAtlas.getEntry(i);
            let vertices = [
                //x1,y1
                1, 0,
                //texCoordX1,texCoordY1  
                frameEntry._x+ frameEntry._width, frameEntry._y,
                //x2,y2
                0, 0,
                //texCoordX2,texCoordY2
                frameEntry._x, frameEntry._y,
                //x3,y3
                1, 1,
                //texCoordX3,texCoordY3
                frameEntry._x + frameEntry._width, frameEntry._y + frameEntry._height,
                //x1,y1
                0, 1,
                //texCoordX4,texCoordY4
                frameEntry._x, frameEntry._y + frameEntry._height
            ]
            this.mVBOs.push(new PositionTexcoordVBO(this.mGl, vertices));
        }
    }


    /**
   * load sprite data into shader
   * 
   * @private
   * @param {PositionTexcoordShader} shader
   * @param {GLM.IArray} view
   */
    private prepareShader(shader: PositionTexcoordShader, view: GLM.IArray) {
        this.loadViewWorldToShader(shader, view);
        this.mVBOs[this.mCurrentFrame].loadToShader(shader);// vbo.loadToShader(shader);
        this.mSpriteAtlas.getTexture().loadToShader();
    }

    /**
    * draw Sprite, should be called inside {Shader.beginDraw}  and {Shader.endDraw} calls
    * 
    * @param {PositionColorShader} shader
    * @param {GLM.IArray} view
    */
    draw(shader: PositionTexcoordShader, view: GLM.IArray) {
        this.prepareShader(shader, view);
        this.mGl.drawArrays(this.mGl.TRIANGLE_STRIP, 0, 4);
    }
    update(deltaTime: number) {
        this.mFrameElapsedTime += deltaTime;
        if (this.mFrameElapsedTime > this.mTimePerFrame) {
            this.mFrameElapsedTime = this.mFrameElapsedTime - this.mTimePerFrame;
            this.mCurrentFrame++;
            this.mCurrentFrame%=this.mSpriteAtlas.EntriesCount;

        }
    }

    private dispose() {

    }

}