import {AssetEntry} from './asset-entry';

/**
 * handles the async load of assets 
 * 
 * @export
 * @interface ILoader
 */
export interface ILoader{
    /**
     * loads an asset asynchronously 
     * 
     * @param {any} assetEntry
     * @param {any} args
     * @returns {Promise<AssetEntry>}
     */
    load(assetEntry,extra:any):Promise<AssetEntry>;
    /**
     * abort an asset load request if it's still running or deletes the asset if it's ralready loaded 
     * 
     * @param {EntryAsset} asset
     */
    unload(asset:AssetEntry);

}