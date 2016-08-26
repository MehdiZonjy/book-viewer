import {BaseGame, Texture, IGameOptions}from '../engine/core/';
import {FPSCounter} from '../engine/misc/';
import {PagesManager} from './pages-manager';
import {CameraController} from './camera';
import {Atlas, AtlasTextureEntry} from '../engine/atlas';

import {Page} from './page';
import { FileType, IMAGE_LOADER_TYPE, TEXT_LOADER_TYPE} from '../engine/assets';
import { AnimatedSprite} from '../engine/sprites/';


export interface IBookViewerOptions extends IGameOptions {
    showFPS?: boolean,
    pageBitmapWidth: number,
    pageBitmapHeight: number,
    loadingSpriteAtlasData: string,
    loadingSpriteImage: string,
    pages: Page[],
}


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
    constructor(options: IBookViewerOptions) {
        super(options);
        this.validateOptions(options);
        this.loadResources(options.pageBitmapWidth, options.pageBitmapHeight, options.loadingSpriteAtlasData, options.loadingSpriteImage, options.pages);
        if (options.showFPS)
            this.fpsCounter = new FPSCounter(options.containerId);

    }
    /**
     * validates options 
     * 
     * @private
     * @param {IBookViewerOptions} options
     */
    private validateOptions(options: IBookViewerOptions) {
        options.loadingSpriteAtlasData || console.error("Missing loadingSpriteAtlasData parameter");
        options.loadingSpriteImage || console.error("Missing loadingSpriteImage parameter");
        options.pageBitmapHeight || console.error("Missing pageBitmapHeight parameter");
        options.pageBitmapWidth || console.error("Missing pageBitmapWidth parameter");
        options.pages || console.error("Missing pages parameter");
    }
    /**
     * loads the LoadingPage animated sprite and initilizes PagesManager and Camera 
     * 
     * @private
     */
    private loadResources(pageBitmapWidth: number, pageBitmapHeight: number,
        loadingSpriteAtlasData: string, loadingSpriteImage: string, pages: Page[]) {
        //load place holder image 
        this.mAssetsManager.addAssetToGroup('loadingSprite', loadingSpriteAtlasData, TEXT_LOADER_TYPE, FileType.json);
        this.mAssetsManager.addAssetToGroup('loadingSprite', loadingSpriteImage, IMAGE_LOADER_TYPE, null);
        this.mAssetsManager.startGroupRequest('loadingSprite', () => {
            const atlasData: any = this.mAssetsManager.getAsset(loadingSpriteAtlasData);
            const atlasImage = this.mAssetsManager.getAsset<HTMLImageElement>(loadingSpriteImage);
            const atlasTexture = new Texture(this.mGl, atlasImage);
            const atlasEntries: AtlasTextureEntry[] = atlasData.TextureAtlas.SubTexture;
            const spriteWidth = atlasEntries[0]._width;
            const spriteHeight = atlasEntries[0]._height;
            const atlas = new Atlas(atlasTexture, atlasEntries);

            this.mLoadingPageSprite = new AnimatedSprite(this.mGl, 20, atlas);
            this.mLoadingPageSprite.postTranslation(0, 0);
            this.mLoadingPageSprite.setWidth(spriteWidth);
            this.mLoadingPageSprite.setHeight(spriteHeight);



            this.mPagesManager = new PagesManager(this.mGl, this.mCamera, this.mAssetsManager,
                pages, pageBitmapWidth, pageBitmapHeight, this.mLoadingPageSprite);
            this.mCameraController = new CameraController(this.mCanvas, this.mCamera, this.mPagesManager);

        });
    }


    protected update(deltaTime) {


        this.mLoadingPageSprite && this.mLoadingPageSprite.update(deltaTime);

        this.fpsCounter && this.fpsCounter.update(deltaTime);
        this.mCameraController && this.mCameraController.update(deltaTime);
        this.mPagesManager && this.mPagesManager.update(deltaTime);

    }

    protected draw(deltaTime) {
        this.clearColor(0, 0, 0);
        this.mPagesManager && this.mPagesManager.draw(this.mSimpleTextureShader, this.mCamera.Projection, this.mCamera.View);
        this.fpsCounter && this.fpsCounter.draw();
    }

    dispose() {
        this.mPagesManager.dispose();
        this.mLoadingPageSprite.dispose();
        this.mPagesManager = null;
        this.mLoadingPageSprite = null;
        this.fpsCounter && this.fpsCounter.dispose();
        super.dispose();
    }
}