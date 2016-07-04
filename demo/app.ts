import {BaseGame,Texture}from '../engine/core/';
import {ColoredSprite,TexturedSprite} from '../engine/sprites/';
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
    public update(deltaTime) {

        /* let world = mat3.create();
         mat3.translate(world, world, vec2.fromValues(0, 0));
         mat3.scale(world, world, vec2.fromValues(30, 30));
         mat3.multiply(world,this.mCamera.View, world);
         //console.log(`viewWorld ${world}`);
         let final  = mat3.multiply(world,this.mCamera.Projection,world);*/
        //  console.log(`final ${final}`)

        this.fpsCounter.update(deltaTime);
        this.clearColor(1, 0, 0);
        //this.mSimpleColorShader.use();
        //this.mSimpleColorShader.setProjection(this.mCamera.Projection);

        this.mSimpleColorShader.beginShader(this.mCamera.Projection);
        /*        this.quad.prepareShader(this.mSimpleShader, this.mCamera.View);
                this.quad.draw();
        */
        for (let i = 0, l = this.sprites.length; i < l; i++) {
            let sprite = this.sprites[i];
            sprite.prepareShader(this.mSimpleColorShader, this.mCamera.View);
            sprite.draw();
        }
        this.mSimpleColorShader.endShader();

        if (this.mTexturedSprite) {
            //this.mSimpleTextureShader.use();
            //this.mSimpleTextureShader.setProjection(this.mCamera.Projection);

            this.mSimpleTextureShader.beginShader(this.mCamera.Projection);

            this.mTexturedSprite.prepareShader(this.mSimpleTextureShader, this.mCamera.View);
            this.mTexturedSprite.draw();
            this.mSimpleTextureShader.endShader();

        }

        this.fpsCounter.draw();
        /*  public test(x,y,tx=0,ty=0,sx=1,sy=1){
                let world = mat3.create();
              mat3.translate(world, world, vec2.fromValues(tx, ty));
              mat3.scale(world, world, vec2.fromValues(sx, sy));
              mat3.multiply(world,this.mCamera.View, world);
              let clippingMatrix  = mat3.multiply(world,this.mCamera.Projection,world);
              console.log(`finalMatrix ${clippingMatrix}`);
              let o = vec3.create();
              vec2.transformMat3(o,vec2.fromValues(x,y),clippingMatrix);
              console.log(`clip ${o}`);
          }
      */
    }
}



window['DemoGame'] = DemoGame;