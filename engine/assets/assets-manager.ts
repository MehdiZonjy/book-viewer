import {AssetEntry} from './asset-entry';
import {ILoader} from './interfaces';

/**
 * handles async loading and storage of assets.
 * assets can be loaded in two ways
 * 1:  individually; {loadAsset} and passing a callback 
 * 2:  grouped; {addAssetToGroup} which will be used to group assets together then {startGroupRequest(callback)} which will download every asset added to the group
 *      and only once the entire assets in the group have been downloaded the callback will be notified.
 *      it's ideal for cases where you need a group of assets to be loaded before you procced, such as level textures and sounds.
 * @export
 * @class AssetsManager
 */
export class AssetsManager {
    /**
     * holds a reference to all loaded assets 
     * 
     * @private
     * @type {Map<string, AssetEntry>} key: asset name 
     */
    private mAssetsStorage: Map<string, AssetEntry>;

    /**
     * registered loaders  
     * 
     * @private
     * @type {Map<Symbol, ILoader>} key: unique idientifer used to identify the loader
     */
    private mRegisteredLoaders: Map<Symbol, ILoader>;

    /**
     * pending group requests 
     * 
     * @private
     * @type {Map<string, AssetsGroup>} key: group name
     */
    private mPendingGroupsRequests: Map<string, AssetsGroup>;

    /**
     * active load asset requests, once an asset been loaded it will be removed from here and added to {mAssetStorage} 
     * 
     * @private
     * @type {Map<string, AssetEntry>}
     */
    private mActiveRequests: Map<string, AssetEntry>;

    /**
     * active load asset groups requests, once a group been loaded it will be removed from here  and its assets will be added to {mAssetsStorage}  
     * 
     * @private
     * @type {Map<string, AssetsGroup>}
     */
    private mGroupsActiveRequests: Map<string, AssetsGroup>

    /**
     * Creates an instance of AssetsManager.
     * 
     */
    constructor() {
        this.mAssetsStorage = new Map<string, AssetEntry>();
        this.mRegisteredLoaders = new Map<Symbol, ILoader>();
        this.mActiveRequests = new Map<string, AssetEntry>();
        this.mGroupsActiveRequests = new Map<string, AssetsGroup>();
        this.mPendingGroupsRequests = new Map<string, AssetsGroup>();
    }

    /**
     * current number of active requests in the background 
     * note: grouped requests will not be counted
     * @returns {number}
     */
    public activeRequestsCount(): number {
        return this.mActiveRequests.size;
    }
    /**
     *  retrieve an already laoded asset
     * 
     * @template T
     * @param {string} name
     * @returns {T} asset or null if asset wasn't found
     */
    public getAsset<T>(name: string) {
        if (this.mAssetsStorage.has(name))
            return <T>this.mAssetsStorage.get(name).Asset;
        return null;
    }
    /**
     * check wheather an asset has been loaded
     * 
     * @param {string} name
     * @returns {boolean}
     */
    public assetExists(name: string): boolean {
        return this.mAssetsStorage.has(name);
    }


    /**
     * checks if there is a request to load an asset both individually or part of a group
     * 
     * @param {string} name
     * @returns {boolean} returns true if there is an asset load request in {mActiveRequest} or {mPendingGroupsRequests} or {mGroupActiveRequets}
     */
    public assetRequestExsits(name: string): boolean {
        //search currently active requests
        if (this.mActiveRequests.has(name))
            return true;
        //seach pending group load requests
        for (let group of this.mPendingGroupsRequests.values()) {
            if (group.ActiveRequests.has(name))
                return true;
        }
        //search active group requests
        for (let group of this.mGroupsActiveRequests.values()) {
            if (group.ActiveRequests.has(name))
                return true;
        }
        return false;
    }
    /**
     * remove a loaded asset from memory 
     * 
     * @param {string} name
     */
    public removeAsset(name: string) {

        if (this.mAssetsStorage.has(name)) {
            let assetEntry = this.mAssetsStorage.get(name);
            //from some types of assets such as image, just deleting the HTMLImageAsset instance will not clear the memeory
            //so the loader has to handle such complicated cases
            this.mRegisteredLoaders.get(assetEntry.Loader).unload(assetEntry.Asset);
            this.mAssetsStorage.delete(name);
        }
    }
    /**
     * register a loader 
     * 
     * @param {ILoader} loader
     * @param {Symbol} loaderSymbol. will be used later to retrieve the loader
     */
    public registerLoader(loader: ILoader, loaderSymbol: Symbol) {
        this.mRegisteredLoaders.set(loaderSymbol, loader);
    }
    /**
     * removes loader from assets manager 
     * 
     * @param {Symbol} loaderSymbol
     */
    public unregisterLoader(loaderSymbol: Symbol) {
        this.mRegisteredLoaders.delete(loaderSymbol);
    }
    /**
     * count of loaded assets
     * 
     * @returns {number}
     */
    public assetsCount(): number {
        return this.mAssetsStorage.size;
    }
    /**
     * cancel an active request and abort download if possible
     * 
     * @param {string} assetName
     */
    public cancelAssetLoadRequest(assetName: string) {
        if (this.mActiveRequests.has(assetName)) {
            let assetEntry = this.mActiveRequests.get(assetName);

            assetEntry.IsCanceled = true
            //abort request if it's active
            this.mRegisteredLoaders.get(assetEntry.Loader).unload(assetEntry);
            this.mActiveRequests.delete(assetName);

        }
    }

    /**
     * loads individual asset
     * 
     * @param {string} assetName
     * @param {symbol} loaderType
     * @param {any[]} loaderArgs. additinal params to pass to {loader.load}. can be null
     * @param {(asset) => void} [onAssetLoaded]
     * @returns
     */
    public loadAsset(assetName: string, loaderType: symbol, loaderArgs: any, onAssetLoaded?: (asset) => void) {
        //check if asset is already loaded
        if (this.mAssetsStorage.has(assetName)) {
            onAssetLoaded && onAssetLoaded(this.mAssetsStorage.get(assetName));
            return;
        }
        //check if asset is being loaded or is in pending queue
        if (this.assetRequestExsits(assetName))
            return;

        //create and load asset
        let asset = new AssetEntry(assetName, onAssetLoaded, loaderType, loaderArgs, null);
        this.mActiveRequests.set(assetName, asset);
        this.processLoadAssetRequest(asset);
    }

    /**
     * adds AssetRequest to group (don't load the asset immedieatly). 
     * once all asset requests been added, you should call {startGroupRequest}
     * @param {string} groupName
     * @param {string} assetName
     * @param {symbol} loaderType
     * @param {any[]} loaderArgs . additional args to pass to {loader.load}
     * @returns
     */
    public addAssetToGroup(groupName: string, assetName: string, loaderType: symbol, loaderArgs: any) {
        //make sure the asset hasn't been loaded and there aren't any requests to load it
        if (this.mAssetsStorage.has(assetName) || this.assetRequestExsits(assetName))
            return;

        //create entry for the group if it doesn't exist
        if (!this.mPendingGroupsRequests.has(groupName)) {
            let group = new AssetsGroup(groupName);
            this.mPendingGroupsRequests.set(groupName, group);
        }

        let group = this.mPendingGroupsRequests.get(groupName);
        group.ActiveRequests.set(assetName, new AssetEntry(assetName, null, loaderType, loaderArgs, groupName));
    }
    /**
     * starts downloading all assets added to this group. 
     * once you grouped all your asset requests, you should call this method to start downloading them.
     * @param {string} groupName
     * @param {() => void} onGroupLoaded
     * @returns
     */
    public startGroupRequest(groupName: string, onGroupLoaded: () => void) {
        if (!this.mPendingGroupsRequests.has(groupName)) {
            console.log(`group ${groupName} not found`);
            return;
        }
        //retrieve group from pending map and remove it.
        let group = this.mPendingGroupsRequests.get(groupName);
        this.mPendingGroupsRequests.delete(groupName);


        group.onGroupLoaded = onGroupLoaded;
        this.mGroupsActiveRequests.set(groupName, group);
        for (let asset of group.ActiveRequests.values()) {
            this.processLoadAssetRequest(asset);
        }

    }

    /**
     * starts downloading an asset via its proper loader 
     * 
     * @private
     * @param {AssetEntry} assetEntry
     * @returns
     */
    private processLoadAssetRequest(assetEntry: AssetEntry) {

        if (!this.mRegisteredLoaders.has(assetEntry.Loader)) {
            console.log(`No Loader found for type ${assetEntry.Loader}`);
            return;
        }
        let loader = this.mRegisteredLoaders.get(assetEntry.Loader);
       // if (!assetEntry.LoaderArgs)
       //     assetEntry.LoaderArgs = [];
        loader.load(assetEntry, assetEntry.LoaderArg).then(this.onAssetLoaded, this.onLoadAssetFaild);
        assetEntry.LoaderArg = null;

    }
    /**
     * called once a loader finishes downloading an asset. 
     * @private
     */
    private onAssetLoaded = (assetEntry: AssetEntry) => {

        //if the load asset request has been canceld, then discard it 
        if (assetEntry.IsCanceled) {
            console.log(`asset ${assetEntry.Name}  completed but has been canceled`);
            this.mRegisteredLoaders.get(assetEntry.Loader).unload(assetEntry);
            return;

        }
        // remove from active requests map and add entry to assetsStorage
        this.mActiveRequests.delete(assetEntry.Name);

        this.mAssetsStorage.set(assetEntry.Name, assetEntry);
        assetEntry.OnAssetLoadedCallback && assetEntry.OnAssetLoadedCallback(assetEntry.Asset);

        //keeps the memory leaks away
        assetEntry.OnAssetLoadedCallback = null;

        //if a request has a group name then check if all group requests have finished
        if (assetEntry.Group) {
            this.mGroupsActiveRequests.get(assetEntry.Group).ActiveRequests.delete(assetEntry.Name);
            this.checkGroupCompleted(assetEntry.Group);
        }

    }
    /**
     * called if loader faild to download asset
     * 
     * @private
     */
    private onLoadAssetFaild = (assetEntry: AssetEntry) => {

        //remove request
        this.mActiveRequests.delete(assetEntry.Name);
        //if request been canceld then discard it (maybe it's not neccessery in this case since the loader couldn't load the asset)
        if (assetEntry.IsCanceled) {
            console.log(`asset ${assetEntry.Name}  error loading but has been canceled`);
            this.mRegisteredLoaders.get(assetEntry.Loader).unload(assetEntry);
            return;

        }

        assetEntry.OnAssetLoadedCallback = null;
        if (assetEntry.Group) {
            this.mGroupsActiveRequests.get(assetEntry.Group).ActiveRequests.delete(assetEntry.Name);
            this.checkGroupCompleted(assetEntry.Group);
        }
    }
    /**
     * checks if there are no more running load requests in group  
     * 
     * @private
     * @param {any} groupName
     */
    private checkGroupCompleted(groupName) {
        let group = this.mGroupsActiveRequests.get(groupName);
        //if there are no more active requests in this group then execute groupLoadedCallback and remove the group
        if (group.ActiveRequests.size == 0) {
            this.mGroupsActiveRequests.delete(groupName);
            group.onGroupLoaded();
            group.onGroupLoaded = null;
        }
    }

}

/**
 * defines a group of requests  
 * 
 * @class AssetsGroup
 */
class AssetsGroup {
    /**
     * group asset requests 
     * 
     * @type {Map<string, AssetEntry>}. key: asset name
     */
    public ActiveRequests: Map<string, AssetEntry>;
    /**
     * called once all assets in group have been loaded
     */
    onGroupLoaded: () => void;
    constructor(public Group: string, assets: Map<string, AssetEntry> = null) {
        this.ActiveRequests = new Map(assets);
    }

}