/**
 * slowly decays a value over time and reports changes  to a callback
 * it uses a supplied velocity to calculate speed and then speed is reported to callback
 * Speed = Velocity * DeltaTime
 * @export
 * @class DecayAnimator
 */
export  class DecayAnimator {
    /**
     * used to halt animation once speed<=THRESHOLD
     * 
     * @readonly
     * @static
     */
    static get THRESHOLD() {
        return 5;
    }
    /**
     * the value by which to decrease velocity over time
     * 
     * @readonly
     * @static
     */
    static get DECAY_FACTOR() {
        return 0.90;
    }
    
    private mVelocityX:number;
    private mVelocityY:number;

    /**
     * indicates if the animation is still active
     * 
     * @private
     */
    private mIsActive:boolean;
    //pass a callback which will be notified of changes in dX and dY
    constructor(private onUpdateCallback) {
        this.mVelocityX = 0;
        this.mVelocityY = 0;
        this.onUpdateCallback = onUpdateCallback;
        this.mIsActive = false;
    }
    /**
     * update velocity and report current speed
     * 
     * @param {number} deltaTime
     * @returns
     */
    update(deltaTime:number) {
        if (!this.mIsActive)
            return;

        //convert deltatime from milliseconds to a decimal second ;
        deltaTime = deltaTime / 1000;

        //calculate speed
        let dx = this.mVelocityX * deltaTime;
        let dy = this.mVelocityY * deltaTime;

        //decay velocity
        this.mVelocityX *= DecayAnimator.DECAY_FACTOR;
        this.mVelocityY *= DecayAnimator.DECAY_FACTOR;

        //if velocity is small then stop the animation
        let velocityLength = Math.sqrt(this.mVelocityX*this.mVelocityX + this.mVelocityY*this.mVelocityY);
        if (velocityLength <= DecayAnimator.THRESHOLD) {
            this.mIsActive = false;
            return;
        }
        this.onUpdateCallback(dx, dy);
    }
    /**
     * sets velocity and reactive animation
     * 
     * @param {number} velocityX
     * @param {number} velocityY
     */
    setVelocity(velocityX:number, velocityY:number) {
        this.mVelocityX = velocityX;
        this.mVelocityY = velocityY;
        this.mIsActive = true;
    }




}