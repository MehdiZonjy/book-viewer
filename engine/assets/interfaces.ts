import {AssetEntry} from './asset-entry';
export interface ILoader{
    load(assetEntry,...args):Promise<AssetEntry>;
    unload(asset):boolean;

}