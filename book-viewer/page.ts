import {TexturedSprite} from '../engine/sprites';
import {Texture} from '../engine/core';
import {AssetsManager, IMAGE_LOADER_TYPE} from '../engine/assets';
export class Page extends TexturedSprite {
    private mPageImageLoaded: boolean;
    public get PageId() {
        return this.mPageId;
    }
    constructor(private mPageId: number, private mAssetsManager: AssetsManager, private mPageImageUrl, gl: WebGLRenderingContext, mLoadingPageTexture: Texture) {
        super(gl, mLoadingPageTexture)
        this.mPageImageLoaded = false;
        this.mAssetsManager.loadAsset(this.mPageImageUrl, IMAGE_LOADER_TYPE, [], (image: HTMLImageElement) => {
            if (this.mDisposed) {
                //just to be safe remove image asset
                //this.mAssetsManager.cancelAssetLoadRequest(this.mPageImageUrl)
                
                this.mAssetsManager.removeAsset(this.mPageImageUrl);
                return;
            }
            let pageTexture = new Texture(gl, image);
            this.mPageImageLoaded = true;
            this.mTexture = pageTexture;
        });
    }

    dispose() {
        console.log(`dispose page ${this.mPageId}`);
        //if the page hasn't been loaded yet, then we don't want to dispose the LoadingPageTexture
        //and cancel the pending loadPageRequest
        if (!this.mPageImageLoaded) {
            console.log('page has not loaded, cancel request');
            this.mTexture = null;
            this.mAssetsManager.cancelAssetLoadRequest(this.mPageImageUrl)
        }

        super.dispose();

        if (this.mPageImageLoaded) {
            //remove image from assetManager
            this.mAssetsManager.removeAsset(this.mPageImageUrl);
        }
    }

}