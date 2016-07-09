import {AssetEntry} from './asset-entry';
import {XMLHttpRequestLoader} from './xml-http-request-loader';

/**
 * Should be used to register the loader in AssetsManager and reference it loader 
 */
export const TEXT_LOADER_TYPE = Symbol('textAssetLoader');


export enum FileType {
    text, json, xml
}

/**
 * Loads text file assets and parses the file to {FileType} 
 * 
 * @export
 * @class TextAssetLoader
 * @implements {ILoader}
 */
export class TextAssetLoader extends XMLHttpRequestLoader {


    protected onRequestLoaded(assetEntry, fileType: FileType, req: XMLHttpRequest, resolve, reject) {
        let fileContent = null;
        //once file is loaded, convert it to proper format
        switch (fileType) {
            case FileType.json:
                fileContent = JSON.parse(req.responseText);
                break;
            case FileType.text:
                fileContent = req.responseText;
                break;
            case FileType.xml:
                var parser = new DOMParser();
                fileContent = parser.parseFromString(req.responseText, "text/xml");
                break;
        }
        assetEntry.Asset = fileContent;
        resolve(assetEntry);
    }


}