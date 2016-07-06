export  class DecayAnimator {
    //used to bring the animation to a halt
    static get THRESHOLD() {
        return 5;
    }
    //used to decrease velocity over time
    static get DECAY_FACTOR() {
        return 0.85;
    }
    

    private velocityX;
    private velocityY;
    private isActive;
    //pass a callback which will be notified of changes in dX and dY
    constructor(private onUpdateCallback) {
        this.velocityX = 0;
        this.velocityY = 0;
        this.onUpdateCallback = onUpdateCallback;
        this.isActive = false;
    }
    update(deltaTime) {
        if (!this.isActive)
            return;
        //convert deltatime from milliseconds to a decimal second ;
        deltaTime = deltaTime / 1000;
   //     console.log(`time ${deltaTime}`);
        //calculate change in velocity
        let dx = this.velocityX * deltaTime;
        let dy = this.velocityY * deltaTime;

        //decay velocity
        this.velocityX *= DecayAnimator.DECAY_FACTOR;
        this.velocityY *= DecayAnimator.DECAY_FACTOR;

        //if velocity is small then stop the animation
        let velocityLength = Math.sqrt(this.velocityX*this.velocityX + this.velocityY*this.velocityY);
        if (velocityLength <= DecayAnimator.THRESHOLD) {
            this.isActive = false;
            return;
        }
      //  console.log(`dx ${dx} dy ${dy}`);

        this.onUpdateCallback(dx, dy);
    }
    setVelocity(vx, vy) {
        this.velocityX = vx;
        this.velocityY = vy;
        this.isActive = true;
    }




}