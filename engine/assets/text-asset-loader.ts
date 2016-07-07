import {ILoader} from './interfaces';
import {AssetEntry} from './asset-entry';


export const TEXT_LOADER_TYPE = Symbol('textAssetLoader');
export enum FileType {
    text, json, xml
}
export class TextAssetLoader implements ILoader {
    load(assetEntry: AssetEntry, fileType: FileType) {
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.onreadystatechange = () => {
                if ((req.readyState === 4) && (req.status !== 200)) {
                    alert(assetEntry.Name + ": loading failed! [Hint: you cannot double click index.html to run this project. " +
                        "The index.html file must be loaded by a web-server.]");
                }
            };
            req.open('GET', assetEntry.Name, true);
            req.setRequestHeader('Content-Type', 'text/xml');
            //TODO possible optimization(reuse the same function for all calls)
            req.onload = function () {
                let fileContent = null;

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
            };
            req.send();
        });
    }
    unload(asset){
        return true;
    }
}



/*
function onRequestStateChanged() {
    var req: XMLHttpRequest = <any>this;
    if ((req.readyState === 4) && (req.status !== 200)) {
        alert(fileName + ": loading failed! [Hint: you cannot double click index.html to run this project. " +
            "The index.html file must be loaded by a web-server.]");
    }

}
*/