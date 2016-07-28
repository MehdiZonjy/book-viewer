import {MatrixHelper}  from '../math';
import {MovableObject} from './movable-object';
import {mat3, GLM} from 'gl-matrix';

//TODO handle canvas size change event

/**
 * A Orthographic Camera which encapsulates a Projection matrix and View matrix. 
 * @export
 * @class Camera
 * @extends {MovableObject}
 */
export class Camera extends MovableObject {
    
    /**
     * used to check if {mCachedViewBounds} should be recalculated 
     * 
     * @private
     * @type {number}
     */
    private mViewBoundsVersion: number;
    /**
     * to optimize performance we keep a cached version of viewbounds
     * 
     * @private
     * @type {GLM.IArray[]}
     */
    private mCachedViewBounds: GLM.IArray[];

    /**
     * Projection Matrix 
     * 
     * @private
     * @type {GLM.IArray}
     */
    private mProjection: GLM.IArray;

    /**
     * Creates an instance of Camera.
     * 
     * @param {HTMLCanvasElement} mCanvas
     */
    constructor(private mCanvas: HTMLCanvasElement) {
        super();
        this.createProjection(mCanvas.width, mCanvas.height);
    }
    /**
     * 
     * the transformation matrix inherited from {MovableObject} is the view Matrix
     * should not be modifyied directly
     * @readonly
     * @type {GLM.IArray}
     */
    public get View(): GLM.IArray {
        return this.Transformations;// mat3.clone(this.mView);
    }
    /**
     * Projection Matrix 
     * 
     * @readonly
     * @type {GLM.IArray}
     */
    public get Projection(): GLM.IArray {
        return mat3.clone(this.mProjection);
    }

    /**
     * Returns the TopLeft and BottomRight corners of the visisble area Rectangle 
     * TopLeft = (0,0) * InverseTransformationMatrix
     * BottomRight = (canvas.width, canvas.height) * InverseTransformationMatrix
     * @returns {GLM.IArray[]} first Element is a vector of TopLeft corner, second Element is a vector of BottomRight corner
     */
    public getVisisbleViewBounds(): GLM.IArray[] {
        //TODO add some kind of cache for viewBounds
        if (this.mViewBoundsVersion !== this.Version) {
            this.mCachedViewBounds = [this.transformPointInverse(0, 0), this.transformPointInverse(this.mCanvas.width, this.mCanvas.height)];
            this.mViewBoundsVersion = this.Version;
        }
        return this.mCachedViewBounds;
    }

    /**
     * checks if a point is inside ViewBounds
     * 
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    public isPointVisble(x: number, y: number): boolean {
        let viewBounds = this.getVisisbleViewBounds();
        return x >= viewBounds[0][0] && x <= viewBounds[1][0] && y >= viewBounds[0][1] && y <= viewBounds[1][1];


    }


    /**
     * Creates Orthographic projection matrix 
     * 
     * @private
     * @param {number} width
     * @param {number} height
     */
    private createProjection(width: number, height: number) {
        this.mProjection = mat3.create();
        this.mProjection[0] = 2 / width;
        this.mProjection[4] = -2 / height;
        this.mProjection[6] = -1;
        this.mProjection[7] = 1;
        /*
            2 / width, 0, 0,
            0, -2 / height, 0,
            -1, 1, 1
        */
    }


}