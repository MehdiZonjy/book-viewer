import {ColoredSprite, TexturedSprite, AnimatedSprite} from '../engine/sprites/';
import { FileType, IMAGE_LOADER_TYPE, TEXT_LOADER_TYPE} from '../engine/assets';
import {Camera, Texture, IBounds} from '../engine/core';
import {AssetsManager} from '../engine/assets';
import formatString = require('string-format');
import padLeft = require('pad-left');
import {Page} from './page';
import {SimpleTextureShader} from '../engine/shaders';
import {Atlas, AtlasTextureEntry} from '../engine/atlas';

/**
 * Manages book pages, and efficiently updating which page should be loaded/unloaded
 * 
 * @export
 * @class PagesManager
 */
export class PagesManager {

    private static get BITMAP_WIDTH() {
        return 1200;
    }
    private static get BITMAP_HEIGHT() {
        return 1650;
    }
    /**
     * the bottom value of the last page in the book 
     * 
     * @private
     * @type {number}
     */
    private mLastMaxPageY: number;

    /**
     * 
     * 
     * @private
     * @type {number}
     */
    private mPageWidth: number;

    /**
     * 
     * 
     * @private
     * @type {number}
     */
    private mPageHeight: number;

    /**
     * 
     * 
     * @private
     * @type {number}
     */
    private mPagesCount: number;
    /**
     * 
     * visisble book pages 
     * @private
     * @type {Page[]}
     */
    private mPages: Page[];
    /**
     * used to display a place holder until the book page is loaded
     * 
     * @private
     */
    private mLoadingPageSprite: AnimatedSprite;
    /**
     * true if PagesManager is fully loaded and ready to update and draw 
     * 
     * @private
     * @type {boolean}
     */
    private mIsReady: boolean;
    /**
     * 
     * the id of the top most visisble page of the book 
     * @private
     */
    private mTopVisisblePageId;
    /**
     * 
     * the id of the bottom most visisble page of the book
     * @private
     */
    private mBottomVisisblePageId;


    private mViewWidth: number;
    private mViewHeight: number;
    /**
     * the bottom value of the last page in the book 
     * 
     * @readonly
     */
    public get LastPageMaxY() {
        return this.mLastMaxPageY;
    }

    /**
     * Creates an instance of PagesManager.
     * 
     * @param {WebGLRenderingContext} mGl
     * @param {Camera} mCamera
     * @param {AssetsManager} mAssetsManager
     * @param {number} mViewWidth. usually canvas width
     * @param {number} mViewHeight. usually canvas height
     * @param {number} mFirstPageId. id of first page in the book
     * @param {number} mLastPageId. id of the last page in the book
     * @param {string} mPagesBaseUrl. url of the location from which to load the pages in the following formula such as './media/{0}.jpg'
     */
    constructor(private mGl: WebGLRenderingContext, private mCamera: Camera, private mAssetsManager: AssetsManager,
        private mFirstPageId: number, private mLastPageId: number, private mPagesBaseUrl: string
    ) {
        this.mIsReady = false;


        //load first image so we can calculate bounds of pages
        // this.mAssetsManager.loadAsset(formatString(this.mPagesBaseUrl, padLeft(this.mFirstPageId+'', 3, '0')), IMAGE_LOADER_TYPE, [], (image: HTMLImageElement) => {
        // let bitmapWidth = image.naturalWidth;
        //  let bitmapHeight = image.naturalHeight;


        this.mPages = [];
        this.mCamera.OnSizeChanged.subscribe(this.onCameraSizeChanged);
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
            this.mIsReady = true;
        });
        /* this.mAssetsManager.loadAsset('media/doge.jpeg', IMAGE_LOADER_TYPE, null, (image) => {
             this.mLoadingPageTexture = new Texture(this.mGl, image);
             this.mIsReady = true;
         });*/
    }
    onCameraSizeChanged = (bounds: IBounds) => {
        this.mViewWidth = bounds.width;
        this.mViewHeight = bounds.height;

        const bitmapAR = PagesManager.BITMAP_WIDTH / PagesManager.BITMAP_HEIGHT;

        this.mPageWidth = this.mViewWidth;
        this.mPageHeight = this.mPageWidth / bitmapAR;

        this.mPagesCount = this.mLastPageId - this.mFirstPageId;
        this.mLastMaxPageY = (this.mPagesCount + 1) * this.mPageHeight;


        for (let i = 0, l = this.mPages.length; i < l; i++) {
            this.mPages[i].dispose();
            /*
            const page = this.mPages[i];
            page.setWidth(this.mPageWidth);
            page.setHeight(this.mPageHeight);*/
        }
        this.mPages = [];
        this.mTopVisisblePageId = -1;
        this.mBottomVisisblePageId = -1;

        if (this.mIsReady)
            this.updateVisisblePages();

    }



    /**
     * update which pages are now visisble and remove pages which are no lnoger visisble 
     * 
     * @returns
     */
    update(deltaTime: number) {
        if (!this.mIsReady)
            return;

        this.mLoadingPageSprite.update(deltaTime);
        this.updateVisisblePages();

    }

    private updateVisisblePages() {

        //calculate first and last visisble pages
        let visisbleViewBounds = this.mCamera.getVisisbleViewBounds();
        let topVisisblePageIndex = Math.floor(visisbleViewBounds[0][1] / this.mPageHeight);
        let bottomVisisblePageIndex = Math.floor(visisbleViewBounds[1][1] / this.mPageHeight);

        //convert from 0 based index to PageId
        let topVisisblePageId = topVisisblePageIndex + this.mFirstPageId;
        let bottomVisisblePageId = bottomVisisblePageIndex + this.mFirstPageId;


        //if there are no changes to visisble pages then there is no need to update anything
        if (topVisisblePageId == this.mTopVisisblePageId && this.mBottomVisisblePageId == bottomVisisblePageId)
            return;



        this.mTopVisisblePageId = topVisisblePageId;
        this.mBottomVisisblePageId = bottomVisisblePageId;

        //to improve the user experience we will load one more page to top and one extra page from bottom
        let minPageId = Math.max(topVisisblePageId - 1, this.mFirstPageId);
        let maxPageId = Math.min(bottomVisisblePageId + 1, this.mLastPageId);



        let oldVisisblePages: any = {};
        //of the loaded pages find which ones outside {minPageId},{maxPageId} range and dispose  them 
        //and keep a reference to the visisble ones in {oldVisisblePages}
        for (let i = 0; i < this.mPages.length; i++) {
            let page = this.mPages[i];
            if (page.PageId < minPageId || page.PageId > maxPageId) {
                page.dispose();
            }
            else
                oldVisisblePages[page.PageId] = page;
        }


        //add new pages
        this.mPages = []
        for (let pageId = minPageId; pageId <= maxPageId; pageId++) {

            //if this page aleady loaded then just use the old instance
            if (oldVisisblePages[pageId]) {
                this.mPages.push(oldVisisblePages[pageId]);
                continue;
            }
            //create new Page instance and load the image asset
            let page = new Page(pageId, this.mAssetsManager, formatString(this.mPagesBaseUrl, padLeft(pageId + '', 3, '0')), this.mGl, this.mLoadingPageSprite);
            let pageIndex = pageId - this.mFirstPageId;
            page.postTranslation(0, this.mPageHeight * pageIndex);
            page.postScale(this.mPageWidth, this.mPageHeight);
            this.mPages.push(page);
        }


    }

    /**
     * 
     * draw visisble pages 
     * @param {SimpleTextureShader} shader
     * @param {Float32Array} projectionView
     * @param {Float32Array} cameraView
     * @returns
     */
    draw(shader: SimpleTextureShader, projectionView: Float32Array, cameraView: Float32Array) {
        if (!this.mIsReady)
            return;
        shader.beginDraw(projectionView);
        //           console.log(cameraView);
        for (let i = 0, l = this.mPages.length; i < l; i++) {
            this.mPages[i].draw(shader, cameraView);
        }
        shader.endDraw();
    }

}