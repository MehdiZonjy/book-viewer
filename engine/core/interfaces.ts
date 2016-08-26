export interface IDisposable{
    dispose();
}


export interface IBounds{
    width:number,height:number;
}


export interface IGameOptions{
    containerId:string,
    showLog:boolean
}