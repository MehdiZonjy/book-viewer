import {TexturedSprite} from '../engine/sprites';
import {Texture} from '../engine/core';
import {AssetsManager, IMAGE_LOADER_TYPE} from '../engine/assets';
/**
 * a Book page can async load Page Image while displaying a place holder image 
 * 
 * @export
 * @class Page
 * @extends {TexturedSprite}
 */
export class Page extends TexturedSprite {
    private mPageImageLoaded: boolean;
    /**
     * Page ID 
     * 
     * @readonly
     */
    public get PageId():number {
        return this.mPageId;
    }
    /**
     * Creates an instance of Page.
     * 
     * @param {number} mPageId
     * @param {AssetsManager} mAssetsManager
     * @param {any} mPageImageUrl
     * @param {WebGLRenderingContext} gl
     * @param {Texture} mLoadingPageTexture
     */
    constructor(private mPageId: number, private mAssetsManager: AssetsManager, private mPageImageUrl, gl: WebGLRenderingContext, mLoadingPageTexture: Texture) {
       //the place holder texture is shared between all pages
       // so we don't want to dispose it with the page
        super(gl, mLoadingPageTexture,true);

        this.mPageImageLoaded = false;
        
        //load page image
        this.mAssetsManager.loadAsset(this.mPageImageUrl, IMAGE_LOADER_TYPE, null, (image: HTMLImageElement) => {
            //in case the page is nolonger visisble and has been disposed
            //we should clear the Image from memeory as well and discard it
            if (this.mDisposed) {
                this.mAssetsManager.removeAsset(this.mPageImageUrl);
                return;
            }
            //replace the place holder image with proper Page Image
            let pageTexture = new Texture(gl, image);
            this.mPageImageLoaded = true;
            this.mSharedTexture=false;
            this.mTexture = pageTexture;
        });
    }

    /**
     *  dispose page and cancels the page image load request if it's still in progress
     */
    dispose() {
        super.dispose();
        console.log(`dispose page ${this.mPageId}`);

        //if page image hasn't been loaded yet, then cancel the load request
        if (!this.mPageImageLoaded) {
            this.mAssetsManager.cancelAssetLoadRequest(this.mPageImageUrl)
        }
        else
            this.mAssetsManager.removeAsset(this.mPageImageUrl);
    }

}