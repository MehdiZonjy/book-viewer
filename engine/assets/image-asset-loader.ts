import {AssetEntry} from './asset-entry';
import {ILoader} from './interfaces';




export const IMAGE_LOADER_TYPE = Symbol('image-asset-loader');

export class ImageAssetLoader implements ILoader {
    load(asset: AssetEntry) {
        return new Promise((resolve, reject) => {
            let image = new Image();
                    //TODO possible optimization(reuse the same function for all calls)

            image.onload = () => {
                asset.Asset = image;
                resolve(asset);
            };
            image.onerror = () => {
                reject();
            }
            image.src = asset.Name;
        });
    }


}