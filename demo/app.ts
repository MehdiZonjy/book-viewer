import {BaseGame, Texture}from '../engine/core/';
import {ColoredSprite, TexturedSprite} from '../engine/sprites/';
import {FPSCounter} from '../engine/misc/';
//var glmatrix = require('gl-matrix');
//import {vec3} from 'glmatrix';
export class DemoGame extends BaseGame {
    //private quad: ColoredSprite;
    private sprites: ColoredSprite[];
    private fpsCounter: FPSCounter;

    private mTexture: Texture;
    private mTexturedSprite: TexturedSprite;
    //  private mTextureShader: SimpleTextureShader;

    constructor() {
        super({});
        this.sprites = [];

        //  this.mTextureShader = new SimpleTextureShader(this.mGl);

        let img = new Image();
        img.onload = () => {
            this.mTexture = new Texture(this.mGl, img);
            this.mTexturedSprite = new TexturedSprite(this.mGl, this.mTexture);
            this.mTexturedSprite.postTranslation(10, 10);
            this.mTexturedSprite.setHeight(300 + 1);
            this.mTexturedSprite.setWidth(300 + 1);
        };
        img.src = 'media/doge.jpeg';



        for (let i = 0; i < 20; i++) {
            let sprite = new ColoredSprite(this.mGl);
            //TODO transformation order translate->rotate->scale (  i need to isolate the order of operations by maybe hiding them inside the MovableObject class)
            sprite.postTranslation(Math.random() * this.mCanvas.width, Math.random() * this.mCanvas.height);
            sprite.setHeight(Math.random() * 30 + 30);
            sprite.setWidth(Math.random() * 30 + 30);
            sprite.setColor(Math.random(), Math.random(), Math.random(), 1);
            this.sprites.push(sprite);
        }
        this.fpsCounter = new FPSCounter();
    }
    protected update(deltaTime) {

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
        for (let i = 0, l = this.sprites.length; i < l; i++) {
            let sprite = this.sprites[i];
            sprite.prepareShader(this.mSimpleColorShader, this.mCamera.View);
            sprite.draw();
        }
        this.mSimpleColorShader.endDraw();

        if (this.mTexturedSprite) {
            //this.mSimpleTextureShader.use();
            //this.mSimpleTextureShader.setProjection(this.mCamera.Projection);

            this.mSimpleTextureShader.beginDraw(this.mCamera.Projection);

            this.mTexturedSprite.prepareShader(this.mSimpleTextureShader, this.mCamera.View);
            this.mTexturedSprite.draw();
            this.mSimpleTextureShader.endDraw();

        }

        this.fpsCounter.draw();

    }

}



window['DemoGame'] = DemoGame;