import {ColoredSprite, TexturedSprite} from '../engine/sprites/';
import { FileType, IMAGE_LOADER_TYPE, TEXT_LOADER_TYPE} from '../engine/assets';
import {Camera, Texture} from '../engine/core';
import {AssetsManager} from '../engine/assets';
import formatString = require('string-format');
import padLeft = require('pad-left');
import {Page} from './page';
import {SimpleTextureShader} from '../engine/shaders';

export class PagesManager {
    private static get BITMAP_WIDTH() {
        return 1200;
    }
    private static get BITMAP_HEIGHT() {
        return 1650;
    }

    private mLastMaxPageY;

    // private mIsReady: boolean;
    private mPageWidth: number;
    private mPageHeight: number;
    private mPagesCount;
    private mPages: Page[];
    private mLoadingPageTexture;
    private mIsReady: boolean;
    private mTopVisisblePageId;
    private mBottomVisisblePageId;

    public get LastPageMaxY() {
        return this.mLastMaxPageY;
    }

    constructor(private mGl: WebGLRenderingContext, private mCamera: Camera, private mAssetsManager: AssetsManager, private mViewWidth: number, private mViewHeight,
        private mFirstPageId: number, private mLastPageId: number, private mPagesBaseUrl: string) {
        this.mIsReady = false;


        //load first image so we can calculate bounds of pages
        // this.mAssetsManager.loadAsset(formatString(this.mPagesBaseUrl, padLeft(this.mFirstPageId+'', 3, '0')), IMAGE_LOADER_TYPE, [], (image: HTMLImageElement) => {
        // let bitmapWidth = image.naturalWidth;
        //  let bitmapHeight = image.naturalHeight;
        let bitmapAR = PagesManager.BITMAP_WIDTH / PagesManager.BITMAP_HEIGHT;


        this.mPageWidth = this.mViewWidth;
        this.mPageHeight = this.mPageWidth / bitmapAR;

        this.mPagesCount = this.mLastPageId - this.mFirstPageId;
        this.mLastMaxPageY = (this.mPagesCount+1 ) * this.mPageHeight;
        this.mPages = [];
        // this.mIsReady=true;
        // });
        this.mAssetsManager.loadAsset('media/doge.jpeg', IMAGE_LOADER_TYPE, [], (image) => {
            this.mLoadingPageTexture = new Texture(this.mGl, image);
            this.mIsReady = true;
        });
    }




    update() {
        if (!this.mIsReady)
            return;

        //calculate first and last visisble pages
        let visisbleViewBounds = this.mCamera.getVisisbleViewBounds();
        let topVisisblePageIndex =Math.floor( visisbleViewBounds[0][1] / this.mPageHeight);
        let bottomVisisblePageIndex =Math.floor( visisbleViewBounds[1][1] / this.mPageHeight);

        //convert from 0 based index to PageId
        let topVisisblePageId = topVisisblePageIndex + this.mFirstPageId;
        let bottomVisisblePageId = bottomVisisblePageIndex + this.mFirstPageId;

        
        if(topVisisblePageId==this.mTopVisisblePageId && this.mBottomVisisblePageId == bottomVisisblePageId)
            return;
        
        this.mTopVisisblePageId=topVisisblePageId;
        this.mBottomVisisblePageId=bottomVisisblePageId;
        
        //to improve the user experience we will load one more page to top and one extra page from bottom
        let minPageId = Math.max(topVisisblePageId - 1, this.mFirstPageId);
        let maxPageId = Math.min(bottomVisisblePageId + 1, this.mLastPageId);



//console.log(`minPageId ${minPageId}`);
//console.log(`maxPageId ${maxPageId}`);
        //TODO if no changes happend in minPageId and maxPageId then don't go any further

        let oldVisisblePages: any = {};
        //of the loaded pages find which ones outside {minPageId},{maxPageId} range and dispose  them 
        for (let i = 0; i < this.mPages.length; i++) {
            let page = this.mPages[i];
            if (page.PageId < minPageId || page.PageId > maxPageId) {
                page.dispose();
            }
            else
                oldVisisblePages[page.PageId] = page;
        }


        this.mPages = []
        for (let pageId = minPageId; pageId <= maxPageId; pageId++) {

            //if this page aleady loaded then just use the old instance
            if (oldVisisblePages[pageId]) {
                this.mPages.push(oldVisisblePages[pageId]);
                continue;
            }
            //create new Page instance and load the image asset
            let page = new Page(pageId, this.mAssetsManager, formatString(this.mPagesBaseUrl, padLeft(pageId + '', 3, '0')), this.mGl, this.mLoadingPageTexture);
            let pageIndex = pageId-this.mFirstPageId;
          //  console.log(`creating page ${pageId}`);
          //  console.log(`pageIndex ${pageIndex}`);
          //  console.log(`pagePosition ${this.mPageHeight*pageIndex}`);
            page.postTranslation(0,this.mPageHeight*pageIndex);
            page.postScale(this.mPageWidth,this.mPageHeight);
            this.mPages.push(page);
        }
      //  console.log(`loaded pages count ${this.mPages.length}`);


    }

    draw(shader: SimpleTextureShader,projectionView, cameraView) {
        if (!this.mIsReady)
            return;
        shader.beginDraw(projectionView);
        for (let i = 0, l = this.mPages.length; i < l; i++) {
            this.mPages[i].draw(shader, cameraView);
        }
        shader.endDraw();
    }

}