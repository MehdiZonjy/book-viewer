import {SimpleColorShader, SimpleTextureShader} from '../shaders';
import {Camera} from './';
import {AssetsManager, TextAssetLoader,ImageAssetLoader,IMAGE_LOADER_TYPE,TEXT_LOADER_TYPE} from '../assets';
/// <reference path="../gl-matrix.d.ts" />

/**
 * Base game object, inherite from this class to create your own game/app
 * 
 * @export
 * @abstract
 * @class BaseGame
 */
export abstract class BaseGame {
    /**
     * WebGL reference 
     * 
     * @protected
     * @type {WebGLRenderingContext}
     */
    protected mGl: WebGLRenderingContext;
    /**
     * Canvas 
     * 
     * @protected
     * @type {HTMLCanvasElement}
     */
    protected mCanvas: HTMLCanvasElement;
    /**
     * a shader used for drawing solid colored sprites 
     * 
     * @protected
     * @type {SimpleColorShader}
     */
    protected mSimpleColorShader: SimpleColorShader;
    /**
     * a simple shader for drawing textured sprites
     * 
     * @protected
     * @type {SimpleTextureShader}
     */
    protected mSimpleTextureShader: SimpleTextureShader;
    /**
     * camera (holds projection and view matrices) 
     * 
     * @protected
     * @type {Camera}
     */
    protected mCamera: Camera;
    /**
     * handles async loads and in memory storage of assets 
     * 
     * @protected
     * @type {AssetsManager}
     */
    protected mAssetsManager: AssetsManager;

    /**
     * time since the last update to MainLoop 
     * 
     * @private
     */
    private mLastFrameUpdate;
    constructor(options) {
        //init
        this.mCanvas = createCanvas();
        this.mGl = createWebGLContext(this.mCanvas);
        this.mSimpleColorShader = new SimpleColorShader(this.mGl);
        this.mSimpleTextureShader = new SimpleTextureShader(this.mGl);
        this.mCamera = new Camera(this.mCanvas);
        this.mAssetsManager = new AssetsManager();
        this.mAssetsManager.registerLoader(new TextAssetLoader(), TEXT_LOADER_TYPE);
        this.mAssetsManager.registerLoader(new ImageAssetLoader(),IMAGE_LOADER_TYPE);
        //start main application loop
        requestAnimationFrame(this.mainLoop);
    }

    /**
     * Main Application Loop  
     * 
     * @private
     */
    private mainLoop = (now:number) => {
        //request another frame update to keep the MainLoop running
        requestAnimationFrame(this.mainLoop);

        //calculate DeltaTime  (elapsed time between frames)        
        if (!this.mLastFrameUpdate) {
            this.mLastFrameUpdate = now;
            return;
        }

        let deltaTime = now - this.mLastFrameUpdate;
        this.mLastFrameUpdate = now;

        //set drawing area to entire canvas
        this.mGl.viewport(0, 0, this.mCanvas.width, this.mCanvas.height);

        //TODO add frame skipping and split update into onUpdate and onDraw
        /*(while deltaTime > 1000/60)
            update
            deltaTime -=1000/60

        */
        this.update(deltaTime);
        this.draw(deltaTime);

    }

    /**
     * clears the viewPort with color 
     * @protected
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {number} [a=1]
     */
    protected clearColor(r:number, g:number, b:number, a = 1) {
        this.mGl.clearColor(r, g, b, a);
        this.mGl.clear(this.mGl.COLOR_BUFFER_BIT);
    }

    /**
     * update app physics and non draw functionality 
     * 
     * @protected
     * @abstract
     * @param {number} deltaTime
     */
    protected abstract update(deltaTime:number);
    /**
     * draw scene 
     * 
     * @protected
     * @abstract
     * @param {number} deltaTime
     */
    protected abstract draw(deltaTime:number);

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