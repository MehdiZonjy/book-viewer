/**
 * 
 * Calculates the FPS of the game and displays it using an absolute DIV
 * @export
 * @class FPSCounter
 */
export class FPSCounter{
    private mFPS:number;
    /**
     * frames counted in this second 
     * 
     * @private
     */
    private mFrameCount;
    /**
     *  Displays FPS counter
     * 
     * @private
     * @type {HTMLDivElement}
     */
    private mFPSContainer:HTMLDivElement;
    /**
     * time passed since last second 
     * 
     * @private
     */
    private mElapsedTime;
    constructor(){
        this.mElapsedTime=0;
        this.mFPS=0;
        this.mFrameCount=0;
        this.mFPSContainer = document.createElement('div');
        this.mFPSContainer.style.position='absolute';
        this.mFPSContainer.style.fontSize='32px';
        this.mFPSContainer.style.width="200px";
        this.mFPSContainer.style.height="50px";
        this.mFPSContainer.style.top="0px";
        this.mFPSContainer.style.left="0px";
        document.getElementsByTagName('body')[0].appendChild(this.mFPSContainer);
    }
    /**
     * Update FPS counter 
     * 
     * @param {number} deltaTime
     */
    update(deltaTime:number){
        this.mElapsedTime+=deltaTime;
        this.mFrameCount++;
        if(this.mElapsedTime>1000){
            this.mFPS=this.mFrameCount;
            this.mFrameCount=0;
            this.mElapsedTime-=1000;
        }
       // deltaTime/=1000;
     //   this.mFPS=1/deltaTime;
    }
    draw(){
        this.mFPSContainer.innerHTML = 'FPS: '+this.mFPS.toFixed(2);
    }
    
}