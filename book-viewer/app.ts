import {BaseGame}from '../engine/core/';
import {FPSCounter} from '../engine/misc/';
import {PagesManager} from './pages-manager';
import {CameraController} from './camera';
import {Page} from './page';

import formatString = require('string-format');
import padLeft = require('pad-left');


const PAGE_BITMAP_WIDTH = 1200;
const PAGE_BITMAP_HEIGHT = 1650;


/**
 * Book Viewer Application main class
 * 
 * @export
 * @class DemoGame
 * @extends {BaseGame}
 */
export class BookViewerApp extends BaseGame {
    /**
     * 
     * 
     * @private
     * @type {FPSCounter}
     */
    private fpsCounter: FPSCounter;

    /**
     * handles rendering ,loading,unloading and updating pages 
     * 
     * @private
     * @type {PagesManager}
     */
    private mPagesManager: PagesManager;


    /**
     * controls camera movement gestures
     * 
     * @private
     * @type {CameraController}
     */
    private mCameraController: CameraController;

    constructor(parentElementId: string) {
        super({}, parentElementId);

        const pages: Page[] = [];
        const pageImageBaseUrl = './media/{0}.jpg'
        for (let i = 20; i <= 30; i++) {
            pages.push({ imagePath: formatString(pageImageBaseUrl, padLeft(i + '', 3, '0')), id: i });
        }



        

        this.mPagesManager = new PagesManager(this.mGl, this.mCamera, this.mAssetsManager,
            pages,PAGE_BITMAP_WIDTH,PAGE_BITMAP_HEIGHT);
        this.mCameraController = new CameraController(this.mCanvas, this.mCamera, this.mPagesManager);
        this.fpsCounter = new FPSCounter(parentElementId);

    }


    protected update(deltaTime) {
        this.fpsCounter.update(deltaTime);
        this.mCameraController.update(deltaTime);
        this.mPagesManager.update(deltaTime);

    }

    protected draw(deltaTime) {
        this.clearColor(0, 0, 0);
        this.mPagesManager.draw(this.mSimpleTextureShader, this.mCamera.Projection, this.mCamera.View);
        this.fpsCounter.draw();
    }
}


if (window)
    window['BookViewer'] = BookViewerApp;