import {IDisposable} from './';
/**
 * Encapsulates a WebGTexture
 * @export
 * @class Texture
 * @implements {IDisposable}
 */
export class Texture implements IDisposable {
  /**
   * 
   * WebGL Texture Idenfitier 
   * @private
   * @type {WebGLTexture}
   */
  private mTextureHandler: WebGLTexture;
  /**
   * Texture Width 
   * 
   * @private
   * @type {number}
   */
  private mWidth: number;
  /**
   * Texture Height
   * 
   * @private
   * @type {number}
   */
  private mHeight: number;
  private mName: string;
  /**
   * indicates wheather Dispose has been called   
   * 
   * @private
   * @type {boolean}
   */
  private mDisposed: boolean;

  /**
   * Creates an instance of Texture.
   * 
   * @param {WebGLRenderingContext} mGl
   * @param {HTMLImageElement} mImage
   */
  constructor(private mGl: WebGLRenderingContext, private mImage: HTMLImageElement) {
    this.mWidth = this.mImage.naturalWidth;
    this.mHeight = this.mImage.naturalHeight;
    this.mName = mImage.src;
    this.mDisposed = false;
    this.initTexture();
  }

  /**
   * creates a WebGLTexture and loads Image data into it 
   * 
   * @private
   */
  private initTexture() {
    this.mTextureHandler = this.mGl.createTexture();
    this.mGl.bindTexture(this.mGl.TEXTURE_2D, this.mTextureHandler);
    this.mGl.texImage2D(this.mGl.TEXTURE_2D, 0, this.mGl.RGBA, this.mGl.RGBA, this.mGl.UNSIGNED_BYTE, this.mImage);
  }

  /**
   * Loads the texture into the currently active shader 
   */
  public loadToShader() {
    this.mGl.bindTexture(this.mGl.TEXTURE_2D, this.mTextureHandler);

    // Set the parameters so we can render any size image.
    this.mGl.texParameteri(this.mGl.TEXTURE_2D, this.mGl.TEXTURE_WRAP_S, this.mGl.CLAMP_TO_EDGE);
    this.mGl.texParameteri(this.mGl.TEXTURE_2D, this.mGl.TEXTURE_WRAP_T, this.mGl.CLAMP_TO_EDGE);
    this.mGl.texParameteri(this.mGl.TEXTURE_2D, this.mGl.TEXTURE_MIN_FILTER, this.mGl.NEAREST);
    this.mGl.texParameteri(this.mGl.TEXTURE_2D, this.mGl.TEXTURE_MAG_FILTER, this.mGl.NEAREST);

  }


  /**
   * returns WebGL texture identifier 
   * 
   * @readonly
   */
  public get getTextureHandler() {
    return this.mTextureHandler;
  }
  /**
   * Image Name  
   * 
   * @readonly
   */
  public get ImageName() {
    return this.mName;
  }

  /**
   * Texture Width 
   * 
   * @readonly
   */
  public get Width() {
    return this.mWidth;
  }

  /**
   * Texture Height 
   * 
   * @readonly
   */
  public get Height() {
    return this.mHeight;
  }

  /**
   * Dispose WebGLTexture and release memory  
   */
  public dispose() {
    this.mDisposed = true;
    this.mGl.bindTexture(this.mGl.TEXTURE_2D, null);
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