import {SimpleColorShader} from '../shaders/simple-color-shader';
import {Camera} from './camera';
export abstract class BaseGame {
    protected mGl: WebGLRenderingContext;
    protected mCanvas: HTMLCanvasElement;
    protected mSimpleShader:SimpleColorShader;
    protected mCamera:Camera;
    private mLastFrameUpdate;
    constructor(options) {
        this.mCanvas = createCanvas();
        this.mGl = createWebGLContext(this.mCanvas);
        this.mSimpleShader = new SimpleColorShader(this.mGl);
        this.mCamera=new Camera(this.mCanvas);
        requestAnimationFrame(this.mainLoop);
    }


    private mainLoop = (now) => {
        requestAnimationFrame(this.mainLoop);
        if (!this.mLastFrameUpdate) {
            this.mLastFrameUpdate = now;
            return;
        }

        let deltaTime = now - this.mLastFrameUpdate;
        this.mLastFrameUpdate = now;

        this.mGl.viewport(0,0,this.mCanvas.width,this.mCanvas.height);
        this.update(deltaTime);


    }

    protected clearColor(r, g, b, a=1) {
        this.mGl.clearColor(r, g, b, a);
        this.mGl.clear(this.mGl.COLOR_BUFFER_BIT);
    }

    abstract update(deltaTime);

}

function createCanvas() {
    let body = document.getElementsByTagName('body')[0];
    let canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    body.appendChild(canvas);
    return canvas;
}


function createWebGLContext(canvas) {
    let gl = canvas.getContext('experimental-webgl');
    if (gl == null) {
        //TODO add log
        alert("'You don't have WebGL support");
    }
    return gl
}