import {BaseGame, Texture}from '../engine/core/';
import {ColoredSprite, TexturedSprite} from '../engine/sprites/';
import {FPSCounter} from '../engine/misc/';
import {DecayAnimator} from './decay-animator';
import { FileType, IMAGE_LOADER_TYPE, TEXT_LOADER_TYPE} from '../engine/assets';
import {PagesManager} from './pages-manager';

import {CameraController} from './camera/camera-controller';
/**
 * Book Viewer Application main class
 * 
 * @export
 * @class DemoGame
 * @extends {BaseGame}
 */
export class DemoGame extends BaseGame {
    /**
     * 
     * 
     * @private
     * @type {FPSCounter}
     */
    private fpsCounter: FPSCounter;
    
    /**
     * 
     * 
     * @private
     * @type {CameraViewAnimator}
     */
//    private mCameraViewAnimator: CameraViewAnimator;
    /**
     * 
     * 
     * @private
     * @type {CameraViewLimiter}
     */
  //  private mCameraViewLimiter: CameraViewLimiter;
    /**
     * 
     * 
     * @private
     * @type {PagesManager}
     */
    private mPagesManager: PagesManager;

    private mCameraController:CameraController;


    constructor() {
        super({});
        this.mPagesManager = new PagesManager(this.mGl, this.mCamera, this.mAssetsManager, this.mCanvas.width, this.mCanvas.height,
            20, 30, './media/{0}.jpg');
     //   this.mCameraViewAnimator = new CameraViewAnimator(this.mCanvas, this.mCamera);
     //   this.mCameraViewLimiter = new CameraViewLimiter(this.mCamera, 0, this.mCanvas.width, 0, this.mPagesManager.LastPageMaxY );
    
        this.mCameraController=new CameraController(this.mCanvas,this.mCamera,this.mPagesManager.LastPageMaxY);
        this.fpsCounter = new FPSCounter();
    }


    protected update(deltaTime) {
        //this.mCameraViewAnimator.update(deltaTime);

        this.fpsCounter.update(deltaTime);
      //  this.mCameraViewLimiter.update();

        this.mCameraController.update(deltaTime);
        this.mPagesManager.update();

    }

    protected draw(deltaTime) {
        this.clearColor(0, 0,0);
        this.mPagesManager.draw(this.mSimpleTextureShader ,this.mCamera.Projection, this.mCamera.View);
        this.fpsCounter.draw();

    }


}


if(window)
window['BookViewer'] = DemoGame;