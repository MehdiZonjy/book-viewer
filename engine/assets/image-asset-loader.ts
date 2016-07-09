import {AssetEntry} from './asset-entry';
//import {ILoader} from './interfaces';
import {XMLHttpRequestLoader} from './xml-http-request-loader';



export const IMAGE_LOADER_TYPE = Symbol('image-asset-loader');

/**
 * loads images as HTMLImageElement asset
 * since we can't abort an image request made by setting image.src = assetEntry.name 
 * we will first load the image file via XMLHttpRequest, and once it's been loaded and added to browser cache
 * we will use load the image using Image class and force the browser to use the cached version 
 * @export
 * @class ImageAssetLoader
 * @implements {ILoader}
 */
export class ImageAssetLoader extends XMLHttpRequestLoader {

    protected onRequestLoaded(assetEntry, arg, req: XMLHttpRequest, resolve, reject) {
        //once image has been loaded via XMLHttpRequest and cahced by browser, let's reload it again using Image 
        //and the browser will use the cached version it  previously created
        let image = new Image();
        image.onload = () => {
            //remove any memeory leaks
            assetEntry.LoaderExtra = null;
            assetEntry.Asset = image;
            resolve(assetEntry);
        };
        image.onerror = () => {
            assetEntry.LoaderExtra = null;
            reject(assetEntry);
        }
        image.src = assetEntry.Name;
    }



    unload(assetEntry: AssetEntry) {
        super.unload(assetEntry);

        if (assetEntry.Asset)
            assetEntry.Asset.src = '';
    }
}