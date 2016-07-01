import {BaseGame}from '../engine/core/base-game';
import {ColoredSprite} from '../engine/sprites/colored-sprite';
//var glmatrix = require('gl-matrix');
//import {vec3} from 'glmatrix';
export class DemoGame extends BaseGame {
    //private quad: ColoredSprite;
    private sprites: ColoredSprite[];

    constructor() {
        super({});
        this.sprites = [];
        for (let i = 0; i < 500; i++) {
            let sprite = new ColoredSprite(this.mGl);
            sprite.postTranslation(Math.random()*this.mCanvas.width,Math.random()*this.mCanvas.height);
            sprite.setHeight(Math.random() * 30 + 1);
            sprite.setWidth(Math.random() * 30 + 1);
            sprite.setColor(Math.random(), Math.random(), Math.random(), 1);
            this.sprites.push(sprite);
        }
    }
    public update(deltaTime) {

        /* let world = mat3.create();
         mat3.translate(world, world, vec2.fromValues(0, 0));
         mat3.scale(world, world, vec2.fromValues(30, 30));
         mat3.multiply(world,this.mCamera.View, world);
         //console.log(`viewWorld ${world}`);
         let final  = mat3.multiply(world,this.mCamera.Projection,world);*/
        //  console.log(`final ${final}`)


        this.clearColor(1, 0, 0);
        this.mSimpleShader.use();
        this.mSimpleShader.setProjection(this.mCamera.Projection);
        /*        this.quad.prepareShader(this.mSimpleShader, this.mCamera.View);
                this.quad.draw();
        */
        for (let i = 0, l = this.sprites.length; i < l; i++) {
            let sprite = this.sprites[i];
            sprite.prepareShader(this.mSimpleShader, this.mCamera.View);
            sprite.draw();
        }
    }
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



window['DemoGame'] = DemoGame;