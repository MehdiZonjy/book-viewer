import {ILoader} from './interfaces';
import {AssetEntry} from './asset-entry';
export abstract class XMLHttpRequestLoader implements ILoader {

    constructor(protected mRequestHeader: string) {

    }

    load(assetEntry: AssetEntry, arg) :Promise<AssetEntry>{
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            //TODO possible optimization(reuse the same function event handler for all load calls )

            req.onreadystatechange = () => {
                if ((req.readyState === 4) && (req.status !== 200)) {
                    assetEntry.LoaderExtra = null;
                    reject(assetEntry);

                }
            };

            req.open('GET', assetEntry.Name, true);
            if (this.mRequestHeader)
                req.setRequestHeader('Content-Type', this.mRequestHeader);
            req.onload = () => {
                //to avoid memory leaks remove refrence to the request from LoaderExtra
                assetEntry.LoaderExtra = null;
                this.onRequestLoaded(assetEntry, arg,req, resolve, reject);
            };
            req.onerror = () => {
                assetEntry.LoaderExtra = null;
                reject(assetEntry);

            }
            //store a reference to the request, so in case the user choses to cancel it, we can later use the req instance to abort the request
            assetEntry.LoaderExtra = req;
            req.onabort = () => console.log('aborted');
            req.send();


        });
    }
   
    /**
     * process the content loaded by XMLHttpRequest
     * 
     * @protected
     * @abstract
     * @param {any} assetEntry
     * @param {any} arg
     * @param {any} resolve
     * @param {any} reject
     */
    protected abstract onRequestLoaded(assetEntry, arg,req:XMLHttpRequest, resolve, reject);

    unload(assetEntry: AssetEntry) {
        if (assetEntry.LoaderExtra)
            assetEntry.LoaderExtra.abort();
        assetEntry.LoaderExtra = null;
    }


} 