import {AssetEntry} from './asset-entry';
import {ILoader} from './interfaces';




export const IMAGE_LOADER_TYPE = Symbol('image-asset-loader');

export class ImageAssetLoader implements ILoader {
    load(assetEntry: AssetEntry) {

        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.open('GET', assetEntry.Name, true);
            //   req.setRequestHeader('Content-Type', 'image/jpeg');
            //TODO possible optimization(reuse the same function for all calls)
            req.onload =  ()=> {
                let iasd=req.response;
                let image = new Image();
                //TODO possible optimization(reuse the same function for all calls)
                image.onload = () => {
                    assetEntry.LoaderExtra = null;
                    assetEntry.Asset = image;
                    resolve(assetEntry);
                };
                image.onerror = () => {
                    assetEntry.LoaderExtra = null;
                    reject(assetEntry);
                }
                image.src = assetEntry.Name;
            };
          //  req.onabort=()=>reject(assetEntry);
            req.onerror=()=>reject(assetEntry);
            assetEntry.LoaderExtra=req;
            req.onabort=()=>console.log('aborted');
            req.send();





        });
    }

    unload(assetEntry: AssetEntry) {
        if (assetEntry.Asset)
            assetEntry.Asset.src = '';
        if (assetEntry.LoaderExtra)
            assetEntry.LoaderExtra.abort();

        return true;
    }
}