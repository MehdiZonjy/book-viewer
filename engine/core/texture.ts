import {IDisposable} from './';
export class Texture implements IDisposable {
  private mTextureHandler: WebGLTexture;
  private mWidth: number;
  private mHeight: number;
  private mName:string;
  private mDisposed:boolean;
  constructor(private mGl: WebGLRenderingContext, private mImage: HTMLImageElement) {
    this.mWidth = this.mImage.naturalWidth;
    this.mHeight = this.mImage.naturalHeight;
    this.mName = mImage.src;
    this.mDisposed=false;
    this.initTexture();
  }

  private initTexture() {
    this.mTextureHandler = this.mGl.createTexture();
    this.mGl.bindTexture(this.mGl.TEXTURE_2D, this.mTextureHandler);
    this.mGl.texImage2D(this.mGl.TEXTURE_2D, 0, this.mGl.RGBA, this.mGl.RGBA, this.mGl.UNSIGNED_BYTE, this.mImage);
  }

  public loadToShader() {
    this.mGl.bindTexture(this.mGl.TEXTURE_2D, this.mTextureHandler);

    // Set the parameters so we can render any size image.
    this.mGl.texParameteri(this.mGl.TEXTURE_2D, this.mGl.TEXTURE_WRAP_S, this.mGl.CLAMP_TO_EDGE);
    this.mGl.texParameteri(this.mGl.TEXTURE_2D, this.mGl.TEXTURE_WRAP_T, this.mGl.CLAMP_TO_EDGE);
    this.mGl.texParameteri(this.mGl.TEXTURE_2D, this.mGl.TEXTURE_MIN_FILTER, this.mGl.NEAREST);
    this.mGl.texParameteri(this.mGl.TEXTURE_2D, this.mGl.TEXTURE_MAG_FILTER, this.mGl.NEAREST);

  }


  public get getTextureHandler() {
    return this.mTextureHandler;
  }
  public get ImageName(){
    return this.mName;
  }

  public get Width() {
    return this.mWidth;
  }
  public get Height() {
    return this.mHeight;
  }

  public dispose() {
    this.mDisposed=true;
    this.mGl.bindTexture(this.mGl.TEXTURE_2D,null);
    this.mGl.deleteTexture(this.mTextureHandler);
  }

}



/*

  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
 
  // Set the parameters so we can render any size image.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
 
  // Upload the image into the texture.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

*/