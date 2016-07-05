import {BaseGame, Texture}from '../engine/core/';
import {ColoredSprite, TexturedSprite} from '../engine/sprites/';
import {FPSCounter} from '../engine/misc/';
import {DecayAnimator} from './decay-animator';
import {CameraViewAnimator} from './camera-view-animator';
//var glmatrix = require('gl-matrix');
//import {vec3} from 'glmatrix';
export class DemoGame extends BaseGame {
    //private quad: ColoredSprite;
    private mColorSprites: ColoredSprite[];
    private fpsCounter: FPSCounter;
    private mTexture: Texture;
    private mTexturedSprites: TexturedSprite[];
    private mCameraViewAnimator: CameraViewAnimator;
    //  private mTextureShader: SimpleTextureShader;

    private mHammer;

    constructor() {

        super({});
        this.mColorSprites = [];

        //  this.mTextureShader = new SimpleTextureShader(this.mGl);

        let img = new Image();
        img.onload = () => {
            this.mTexture = new Texture(this.mGl, img);
            let textureAR = this.mTexture.Width / this.mTexture.Height;
            let pageWidth = this.mCanvas.width;
            let pageHeight = pageWidth / textureAR;
            this.mTexturedSprites=[];
            for (let i = 0; i < 20; i++) {
                let sprite = new TexturedSprite(this.mGl, this.mTexture);
                sprite.postTranslation(0, i* pageHeight);
                sprite.setHeight(pageHeight);
                sprite.setWidth(pageWidth);
                this.mTexturedSprites.push(sprite);
            }
        };
        img.src = 'media/doge.jpeg';



        for (let i = 0; i < 20; i++) {
            let sprite = new ColoredSprite(this.mGl);
            //TODO transformation order translate->rotate->scale (  i need to isolate the order of operations by maybe hiding them inside the MovableObject class)
            sprite.postTranslation(Math.random() * this.mCanvas.width, Math.random() * this.mCanvas.height);
            sprite.setHeight(Math.random() * 30 + 30);
            sprite.setWidth(Math.random() * 30 + 30);
            sprite.setColor(Math.random(), Math.random(), Math.random(), 1);
            this.mColorSprites.push(sprite);
        }
        this.mCameraViewAnimator = new CameraViewAnimator(this.mCanvas, this.mCamera);
        this.fpsCounter = new FPSCounter();
    }


    protected update(deltaTime) {
        this.mCameraViewAnimator.update(deltaTime);

        this.fpsCounter.update(deltaTime);

    }

    protected draw(deltaTime) {
        this.clearColor(1, 0, 0);
        //this.mSimpleColorShader.use();
        //this.mSimpleColorShader.setProjection(this.mCamera.Projection);

        this.mSimpleColorShader.beginDraw(this.mCamera.Projection);
        /*        this.quad.prepareShader(this.mSimpleShader, this.mCamera.View);
                this.quad.draw();
        */
        for (let i = 0, l = this.mColorSprites.length; i < l; i++) {
            let sprite = this.mColorSprites[i];
            //sprite.prepareShader();
            sprite.draw(this.mSimpleColorShader, this.mCamera.View);
        }
        this.mSimpleColorShader.endDraw();

        if (this.mTexturedSprites) {
            //this.mSimpleTextureShader.use();
            //this.mSimpleTextureShader.setProjection(this.mCamera.Projection);

            this.mSimpleTextureShader.beginDraw(this.mCamera.Projection);

            //this.mTexturedSprite.prepareShader();
            for (let i = 0; i < this.mTexturedSprites.length; i++)
                this.mTexturedSprites[i].draw(this.mSimpleTextureShader, this.mCamera.View);
            this.mSimpleTextureShader.endDraw();

        }

        this.fpsCounter.draw();

    }


}



window['DemoGame'] = DemoGame;