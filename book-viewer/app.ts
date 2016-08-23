import {BaseGame, Texture}from '../engine/core/';
import {FPSCounter} from '../engine/misc/';
import {PagesManager} from './pages-manager';
import {CameraController} from './camera';
import {Atlas, AtlasTextureEntry} from '../engine/atlas';

import {Page} from './page';
import { FileType, IMAGE_LOADER_TYPE, TEXT_LOADER_TYPE} from '../engine/assets';


import formatString = require('string-format');
import padLeft = require('pad-left');
import { AnimatedSprite} from '../engine/sprites/';


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
    private mLoadingPageSprite: AnimatedSprite;
    constructor(parentElementId: string) {
        super({}, parentElementId);

        this.loadResources();
        this.fpsCounter = new FPSCounter(parentElementId);

    }
    /**
     * loads the LoadingPage animated sprite and initilizes PagesManager and Camera 
     * 
     * @private
     */
    private loadResources() {
        //load place holder image 
        this.mAssetsManager.addAssetToGroup('loading', './media/loading/loading.json', TEXT_LOADER_TYPE, FileType.json);
        this.mAssetsManager.addAssetToGroup('loading', './media/loading/loading.png', IMAGE_LOADER_TYPE, null);
        this.mAssetsManager.startGroupRequest('loading', () => {
            const atlasData: any = this.mAssetsManager.getAsset('./media/loading/loading.json');
            const atlasImage = this.mAssetsManager.getAsset<HTMLImageElement>('./media/loading/loading.png');
            const atlasTexture = new Texture(this.mGl, atlasImage);
            const atlasEntries: AtlasTextureEntry[] = atlasData.TextureAtlas.SubTexture;
            const spriteWidth = atlasEntries[0]._width;
            const spriteHeight = atlasEntries[0]._height;
            const atlas = new Atlas(atlasTexture, atlasEntries);

            this.mLoadingPageSprite = new AnimatedSprite(this.mGl, 20, atlas);
            this.mLoadingPageSprite.postTranslation(0, 0);
            this.mLoadingPageSprite.setWidth(spriteWidth);
            this.mLoadingPageSprite.setHeight(spriteHeight);


            const pages: Page[] = [];
            const pageImageBaseUrl = './media/{0}.jpg'
            for (let i = 20; i <= 30; i++) {
                pages.push({ imagePath: formatString(pageImageBaseUrl, padLeft(i + '', 3, '0')), id: i });
            }

            this.mPagesManager = new PagesManager(this.mGl, this.mCamera, this.mAssetsManager,
                pages, PAGE_BITMAP_WIDTH, PAGE_BITMAP_HEIGHT, this.mLoadingPageSprite);
            this.mCameraController = new CameraController(this.mCanvas, this.mCamera, this.mPagesManager);

        });
    }


    protected update(deltaTime) {


        this.mLoadingPageSprite && this.mLoadingPageSprite.update(deltaTime);

        this.fpsCounter.update(deltaTime);
        this.mCameraController && this.mCameraController.update(deltaTime);
        this.mPagesManager && this.mPagesManager.update(deltaTime);

    }

    protected draw(deltaTime) {
        this.clearColor(0, 0, 0);
        this.mPagesManager && this.mPagesManager.draw(this.mSimpleTextureShader, this.mCamera.Projection, this.mCamera.View);
        this.fpsCounter.draw();
    }

    dispose() {
        this.mPagesManager.dispose();
        this.mLoadingPageSprite.dispose();
        this.mPagesManager = null;
        this.mLoadingPageSprite = null;
        this.fpsCounter.dispose(); 
        super.dispose();
    }
}