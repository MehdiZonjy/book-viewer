import {AssetEntry} from './asset-entry';
import {ILoader} from './interfaces';


export class AssetsManager {
    private mAssetsStorage: Map<string, AssetEntry>;
    private mRegisteredLoaders: Map<Symbol, ILoader>;
    private mPendingGroupsRequests: Map<string, AssetsGroup>;
    private mActiveRequests: Map<string, AssetEntry>;
    private mGroupsActiveRequests: Map<string, AssetsGroup>

    constructor() {
        this.mAssetsStorage = new Map<string, AssetEntry>();
        this.mRegisteredLoaders = new Map<Symbol, ILoader>();
        this.mActiveRequests = new Map<string, AssetEntry>();
        this.mGroupsActiveRequests = new Map<string, AssetsGroup>();
        this.mPendingGroupsRequests = new Map<string, AssetsGroup>();
    }


    public activeRequestsCount() {
        return this.mActiveRequests.size;
    }
    public getAsset<T>(name: string) {
        if (this.mAssetsStorage.has(name))
            return <T>this.mAssetsStorage.get(name).Asset;
        return null;
    }
    public assetExists(name: string) {
        return this.mAssetsStorage.has(name);
    }

    public loadAssetRequestExsits(name: string): boolean {
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

    public removeAsset(name: string) {

        if (this.mAssetsStorage.has(name)) {
            let assetEntry = this.mAssetsStorage.get(name);
            this.mRegisteredLoaders.get(assetEntry.Loader).unload(assetEntry.Asset);
            this.mAssetsStorage.delete(name);
        }
    }
    public registerLoader(loader: ILoader, loaderSymbol: Symbol) {
        this.mRegisteredLoaders.set(loaderSymbol, loader);
    }
    public unregisterLoader(loaderSymbol: Symbol) {
        this.mRegisteredLoaders.delete(loaderSymbol);
    }
    public assetsCount(): number {
        return this.mAssetsStorage.size;
    }
    public cancelAssetLoadRequest(assetName: string) {
        if (this.mActiveRequests.has(assetName)) {
            console.log(`cancel active request ${assetName}`);
            let assetEntry = this.mActiveRequests.get(assetName);
            assetEntry.IsCanceled = true
            this.mRegisteredLoaders.get(assetEntry.Loader).unload(assetEntry);
            this.mActiveRequests.delete(assetName);

        }

        //TODO add implementation
    }


    public loadAsset(assetName: string, loaderType: symbol, loaderArgs: any[], onAssetLoaded?: (asset) => void) {
        //check if asset is already loaded
        if (this.mAssetsStorage.has(assetName)) {
            onAssetLoaded && onAssetLoaded(this.mAssetsStorage.get(assetName));
            return;
        }
        //check if asset is being processed or is in pending queue
        //if (this.mActiveRequests.has(assetName) || this.mPendingGroupsRequests.has(assetName))
        //    return;
        if (this.loadAssetRequestExsits(assetName))
            return;

        let asset = new AssetEntry(assetName, onAssetLoaded, loaderType, loaderArgs, null);
        this.mActiveRequests.set(assetName, asset);
        this.processLoadAssetRequest(asset);
    }

    public addAssetToGroup(groupName: string, assetName: string, loaderType: symbol, loaderArgs: any[]) {
        if (this.mAssetsStorage.has(assetName) || this.loadAssetRequestExsits(assetName))
            return;

        //create entry for the group if it doesn't exist
        if (!this.mPendingGroupsRequests.has(groupName)) {
            let group = new AssetsGroup(groupName);
            this.mPendingGroupsRequests.set(groupName, group);
        }

        let group = this.mPendingGroupsRequests.get(groupName);
        group.ActiveRequests.set(assetName, new AssetEntry(assetName, null, loaderType, loaderArgs, groupName));
    }

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


    private processLoadAssetRequest(assetEntry: AssetEntry) {

        if (!this.mRegisteredLoaders.has(assetEntry.Loader)) {
            console.log(`No Loader found for type ${assetEntry.Loader}`);
            return;
        }
        let loader = this.mRegisteredLoaders.get(assetEntry.Loader);
        loader.load(assetEntry, ...assetEntry.LoaderArgs).then(this.onAssetLoaded, this.onLoadAssetFaild);

    }
    private onAssetLoaded = (assetEntry: AssetEntry) => {


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
    private onLoadAssetFaild = (assetEntry: AssetEntry) => {
        this.mActiveRequests.delete(assetEntry.Name);

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


class AssetsGroup {
    public ActiveRequests: Map<string, AssetEntry>;
    onGroupLoaded: () => void;
    constructor(public Group: string, assets: Map<string, AssetEntry> = null) {
        this.ActiveRequests = new Map(assets);
    }

}