export class AssetEntry{
    /**
     * holds actual asset data (image,text,audio....) 
     * 
     * @type {*}
     */
    public Asset:any;
    /**
     * if set to true, once the asset been loaded, it will be discarded and ignored 
     * 
     * @type {boolean}
     */
    public IsCanceled:boolean;
    /**
     * used by asset Loader to store additional info 
     * such as HTMLImageElement or XMLHttpRequest 
     * @type {*}
     */
    public LoaderExtra:any;
    /**
     * Creates an instance of AssetEntry.
     * 
     * @param {string} Name. asset name such as its URL
     * @param {(asset: AssetEntry) => void} OnAssetLoadedCallback 
     * @param {Symbol} Loader. loader Symbol which will be used to lookup the loader
     * @param {any} LoaderArg. additional parameter to pass to loader.load()
     * @param {string} Group. request group name 
     */
    constructor(public Name: string, public OnAssetLoadedCallback: (asset: AssetEntry) => void, public Loader: Symbol,public LoaderArg:any,public Group:string) {
    }

    public get IsLoaded(){
        return this.Asset!=null;
    }



}