import {BaseGame, Texture}from '../engine/core/';
import {ColoredSprite, TexturedSprite} from '../engine/sprites/';
import {FPSCounter} from '../engine/misc/';
import {DecayAnimator} from './decay-animator';
import {CameraViewAnimator} from './camera-view-animator';

import { FileType, IMAGE_LOADER_TYPE, TEXT_LOADER_TYPE} from '../engine/assets';
import {CameraViewLimiter} from './camera-view-limiter';
import {PagesManager} from './pages-manager';
//var glmatrix = require('gl-matrix');
//import {vec3} from 'glmatrix';
export class DemoGame extends BaseGame {
    //private quad: ColoredSprite;
    //  private mColorSprites: ColoredSprite[];
    private fpsCounter: FPSCounter;
    // private mTexture: Texture;
    private mTexturedSprites: TexturedSprite[];
    private mCameraViewAnimator: CameraViewAnimator;
    private mCameraViewLimiter: CameraViewLimiter;
    private mPagesManager: PagesManager;
    //  private mTextureShader: SimpleTextureShader;

    private mHammer;

    constructor() {
        super({});
        this.mPagesManager = new PagesManager(this.mGl, this.mCamera, this.mAssetsManager, this.mCanvas.width, this.mCanvas.height,
            20, 30, './media/{0}.jpg');
        this.mCameraViewAnimator = new CameraViewAnimator(this.mCanvas, this.mCamera);
        this.mCameraViewLimiter = new CameraViewLimiter(this.mCamera, 0, this.mCanvas.width, 0, this.mPagesManager.LastPageMaxY );
        this.fpsCounter = new FPSCounter();
    }


    protected update(deltaTime) {
        this.mCameraViewAnimator.update(deltaTime);

        this.fpsCounter.update(deltaTime);
        this.mCameraViewLimiter.update();
        this.mPagesManager.update();

    }

    protected draw(deltaTime) {
        this.clearColor(1, 0, 0);
        //this.mSimpleColorShader.use();
        //this.mSimpleColorShader.setProjection(this.mCamera.Projection);

        /*   this.mSimpleColorShader.beginDraw(this.mCamera.Projection);
        
           for (let i = 0, l = this.mColorSprites.length; i < l; i++) {
               let sprite = this.mColorSprites[i];
               //sprite.prepareShader();
               sprite.draw(this.mSimpleColorShader, this.mCamera.View);
           }
           this.mSimpleColorShader.endDraw();
   
           if (this.mTexturedSprites) {
               //this.mSimpleTextureShader.use();
               //this.mSimpleTextureShader.setProjection(this.mCamera.Projection);
   
               this.mSimpleTextureShader.beginDraw(this.mCamera.Projection);
   
               //this.mTexturedSprite.prepareShader();
               for (let i = 0; i < this.mTexturedSprites.length; i++)
                   this.mTexturedSprites[i].draw(this.mSimpleTextureShader, this.mCamera.View);
               this.mSimpleTextureShader.endDraw();
   
           }
   */
        this.mPagesManager.draw(this.mSimpleTextureShader ,this.mCamera.Projection, this.mCamera.View);
        this.fpsCounter.draw();

    }


}



window['DemoGame'] = DemoGame;