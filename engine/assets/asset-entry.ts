export class AssetEntry{
    public Asset:any;
    public IsCanceled:boolean;
    public LoaderExtra:any;
    constructor(public Name: string, public OnAssetLoadedCallback: (asset: AssetEntry) => void, public Loader: Symbol,public LoaderArgs:any[],public Group:string) {
    }

    public get IsLoaded(){
        return this.Asset!=null;
    }

    

    /*  public get Name() {
          return this.mName;
      }
  
      public get Asset():T {
          return this.mAsset;
      }
      public set Asset(value:T) {
          this.mAsset = value;
      }
      public get OnAssetLoadedCallback() {
          return this.mOnAssetLoadedCallback;
      }
      public set onAssetLoadedCallback(value) {
          this.mOnAssetLoadedCallback = value;
      }*/




}