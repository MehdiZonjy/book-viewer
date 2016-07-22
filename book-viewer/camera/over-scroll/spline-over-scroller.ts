import {signum} from '../../../engine/math';
const DECELERATION_RATE = (Math.log(0.78) / Math.log(0.9));
const INFLEXION = 0.35; // Tension lines cross at (INFLEXION, 1)
const START_TENSION = 0.5;
const END_TENSION = 1.0;
const P1 = START_TENSION * INFLEXION;
const P2 = 1.0 - END_TENSION * (1.0 - INFLEXION);

const NB_SAMPLES = 100;
const SPLINE_POSITION = new Array(NB_SAMPLES + 1).fill(0);
const SPLINE_TIME = new Array(NB_SAMPLES + 1).fill(0);

export const SPLINE = 0;
export const CUBIC = 1;
export const BALLISTIC = 2;

// Constant gravity value, used in the deceleration phase.
const GRAVITY = 2000.0;
const SCROLL_FRICTION = 0.015

const GRAVITY_EARTH = 9.80665;



let x_min = 0.0;
let y_min = 0.0;
for (let i = 0; i < NB_SAMPLES; i++) {
    const alpha = i / NB_SAMPLES;

    let x_max = 1.0;
    let x, tx, coef;
    while (true) {
        x = x_min + (x_max - x_min) / 2.0;
        coef = 3.0 * x * (1.0 - x);
        tx = coef * ((1.0 - x) * P1 + x * P2) + x * x * x;
        if (Math.abs(tx - alpha) < 1E-5) break;
        if (tx > alpha) x_max = x;
        else x_min = x;
    }
    SPLINE_POSITION[i] = coef * ((1.0 - x) * START_TENSION + x) + x * x * x;

    let y_max = 1.0;
    let y, dy;
    while (true) {
        y = y_min + (y_max - y_min) / 2.0;
        coef = 3.0 * y * (1.0 - y);
        dy = coef * ((1.0 - y) * START_TENSION + y) + y * y * y;
        if (Math.abs(dy - alpha) < 1E-5) break;
        if (dy > alpha) y_max = y;
        else y_min = y;
    }
    SPLINE_TIME[i] = coef * ((1.0 - y) * P1 + y * P2) + y * y * y;
}
SPLINE_POSITION[NB_SAMPLES] = SPLINE_TIME[NB_SAMPLES] = 1.0;




/*
 * Get a signed deceleration that will reduce the velocity.
 */
function getDeceleration(velocity: number): number {
    return velocity > 0 ? -GRAVITY : GRAVITY;
}

export class SplineOverScroller {
    // Initial position
    public mStart: number;

    // Current position
    public mCurrentPosition: number;

    // Final position
    public mFinal: number;

    // Initial velocity
    private mVelocity: number;

    // Current velocity
    public mCurrVelocity: number;

    // Constant current deceleration
    private mDeceleration: number;

    // Animation starting time, in system milliseconds
    public mStartTime: number;

    // Animation duration, in milliseconds
    public mDuration: number;

    // Duration to complete spline component of animation
    private mSplineDuration: number;

    // Distance to travel along spline animation
    private mSplineDistance: number;

    // Whether the animation is currently in progress
    public mFinished: boolean;

    // The allowed overshot distance before boundary is reached.
    private mOver: number;

    // Fling friction
    private mFlingFriction: number = SCROLL_FRICTION;

    // Current state of the animation.
    public mState: number = SPLINE;


    // A context-specific coefficient adjusted to physical values.
    private mPhysicalCoeff: number;


    setFriction(friction: number) {
        this.mFlingFriction = friction;
    }

    constructor() {
        this.mFinished = true;
        const ppi = window.devicePixelRatio * 160.0;
        this.mPhysicalCoeff = GRAVITY_EARTH // g (m/s^2)
            * 39.37 // inch/meter
            * ppi
            * 0.84; // look and feel tuning
    }

    updateScroll(q: number) {
        this.mCurrentPosition = this.mStart + Math.round(q * (this.mFinal - this.mStart));
    }


    /*
     * Modifies mDuration to the duration it takes to get from start to newFinal using the
     * spline interpolation. The previous duration was needed to get to oldFinal.
     */
    private adjustDuration(start: number, oldFinal: number, newFinal: number) {
        const oldDistance = oldFinal - start;
        const newDistance = newFinal - start;
        const x = Math.abs(newDistance / oldDistance);
        const index = parseInt((NB_SAMPLES * x).toFixed(0));
        if (index < NB_SAMPLES) {
            const x_inf = index / NB_SAMPLES;
            const x_sup = (index + 1) / NB_SAMPLES;
            const t_inf = SPLINE_TIME[index];
            const t_sup = SPLINE_TIME[index + 1];
            const timeCoef = t_inf + (x - x_inf) / (x_sup - x_inf) * (t_sup - t_inf);
            this.mDuration *= timeCoef;
        }
    }

    startScroll(start: number, distance: number, duration: number) {
        this.mFinished = false;

        this.mStart = start;
        this.mFinal = start + distance;

        this.mStartTime = Date.now();// AnimationUtils.currentAnimationTimeMillis();
        this.mDuration = duration;

        // Unused
        this.mDeceleration = 0.0;
        this.mVelocity = 0;
    }

    finish() {
        this.mCurrentPosition = this.mFinal;
        // Not reset since WebView relies on this value for fast fling.
        // TODO: restore when WebView uses the fast fling implemented in this class.
        // mCurrVelocity = 0.0f;
        this.mFinished = true;
    }

    setFinalPosition(position: number) {
        this.mFinal = position;
        this.mFinished = false;
    }

    extendDuration(extend: number) {
        const time = Date.now();// AnimationUtils.currentAnimationTimeMillis();
        const elapsedTime = time - this.mStartTime;// parseInt(().toFixed(0));
        this.mDuration = elapsedTime + extend;
        this.mFinished = false;
    }

    springback(start: number, min: number, max: number): boolean {
        this.mFinished = true;

        this.mStart = this.mFinal = start;
        this.mVelocity = 0;

        this.mStartTime = Date.now();// AnimationUtils.currentAnimationTimeMillis();
        this.mDuration = 0;

        if (start < min) {
            this.startSpringback(start, min, 0);
        } else if (start > max) {
            this.startSpringback(start, max, 0);
        }

        return !this.mFinished;
    }

    private startSpringback(start: number, end: number, velocity: number) {
        // mStartTime has been set
        this.mFinished = false;
        this.mState = CUBIC;
        this.mStart = start;
        this.mFinal = end;
        const delta = start - end;
        this.mDeceleration = getDeceleration(delta);
        // TODO take velocity into account
        this.mVelocity = -delta; // only sign is used
        this.mOver = Math.abs(delta);
        this.mDuration = parseInt((1000.0 * Math.sqrt(-2.0 * delta / this.mDeceleration)).toFixed(0));
    }

    fling(start: number, velocity: number, min: number, max: number, over: number) {
        this.mOver = over;
        this.mFinished = false;
        this.mCurrVelocity = this.mVelocity = velocity;
        this.mDuration = this.mSplineDuration = 0;
        this.mStartTime = Date.now();// AnimationUtils.currentAnimationTimeMillis();
        this.mCurrentPosition = this.mStart = start;

        if (start > max || start < min) {
            this.startAfterEdge(start, min, max, velocity);
            return;
        }

        this.mState = SPLINE;
        let totalDistance = 0.0;

        if (velocity != 0) {
            this.mDuration = this.mSplineDuration = this.getSplineFlingDuration(velocity);
            totalDistance = this.getSplineFlingDistance(velocity);
        }

        this.mSplineDistance = parseInt((totalDistance * signum(velocity)).toFixed(0));
        this.mFinal = start + this.mSplineDistance;

        // Clamp to a valid final position
        if (this.mFinal < min) {
            this.adjustDuration(this.mStart, this.mFinal, min);
            this.mFinal = min;
        }

        if (this.mFinal > max) {
            this.adjustDuration(this.mStart, this.mFinal, max);
            this.mFinal = max;
        }
    }

    private getSplineDeceleration(velocity: number): number {
        return Math.log(INFLEXION * Math.abs(velocity) / (this.mFlingFriction * this.mPhysicalCoeff));
    }

    private getSplineFlingDistance(velocity: number): number {
        const l = this.getSplineDeceleration(velocity);
        const decelMinusOne = DECELERATION_RATE - 1.0;
        return this.mFlingFriction * this.mPhysicalCoeff * Math.exp(DECELERATION_RATE / decelMinusOne * l);
    }

    /* Returns the duration, expressed in milliseconds */
    private getSplineFlingDuration(velocity: number): number {
        const l = this.getSplineDeceleration(velocity);
        const decelMinusOne = DECELERATION_RATE - 1.0;
        return parseInt((1000.0 * Math.exp(l / decelMinusOne)).toFixed(0));
    }

    private fitOnBounceCurve(start: number, end: number, velocity: number) {
        // Simulate a bounce that started from edge
        const durationToApex = - velocity / this.mDeceleration;
        const distanceToApex = velocity * velocity / 2.0 / Math.abs(this.mDeceleration);
        const distanceToEdge = Math.abs(end - start);
        const totalDuration = Math.sqrt(
            2.0 * (distanceToApex + distanceToEdge) / Math.abs(this.mDeceleration));
        this.mStartTime -= parseInt((1000.0 * (totalDuration - durationToApex)).toFixed(0));
        this.mStart = end;
        this.mVelocity = parseInt((- this.mDeceleration * totalDuration).toFixed(0));
    }

    private startBounceAfterEdge(start: number, end: number, velocity: number) {
        this.mDeceleration = getDeceleration(velocity == 0 ? start - end : velocity);
        this.fitOnBounceCurve(start, end, velocity);
        this.onEdgeReached();
    }

    private startAfterEdge(start: number, min: number, max: number, velocity: number) {
        if (start > min && start < max) {
            console.error("OverScroller", "startAfterEdge called from a valid position");
            this.mFinished = true;
            return;
        }
        const positive = start > max;
        const edge = positive ? max : min;
        const overDistance = start - edge;
        let keepIncreasing = overDistance * velocity >= 0;
        if (keepIncreasing) {
            // Will result in a bounce or a to_boundary depending on velocity.
            this.startBounceAfterEdge(start, edge, velocity);
        } else {
            const totalDistance = this.getSplineFlingDistance(velocity);
            if (totalDistance > Math.abs(overDistance)) {
                this.fling(start, velocity, positive ? min : start, positive ? start : max, this.mOver);
            } else {
                this.startSpringback(start, edge, velocity);
            }
        }
    }

    notifyEdgeReached(start: number, end: number, over: number) {
        // mState is used to detect successive notifications 
        if (this.mState == SPLINE) {
            this.mOver = over;
            this.mStartTime = Date.now();// AnimationUtils.currentAnimationTimeMillis();
            // We were in fling/scroll mode before: current velocity is such that distance to
            // edge is increasing. This ensures that startAfterEdge will not start a new fling.
            this.startAfterEdge(start, end, end, parseInt(this.mCurrVelocity.toFixed(0)));
        }
    }

    private onEdgeReached() {
        // mStart, mVelocity and mStartTime were adjusted to their values when edge was reached.
        let distance = this.mVelocity * this.mVelocity / (2.0 * Math.abs(this.mDeceleration));
        const sign = signum(this.mVelocity);

        if (distance > this.mOver) {
            // Default deceleration is not sufficient to slow us down before boundary
            this.mDeceleration = - sign * this.mVelocity * this.mVelocity / (2.0 * this.mOver);
            distance = this.mOver;
        }

        this.mOver = parseInt(distance.toFixed(0));
        this.mState = BALLISTIC;
        this.mFinal = this.mStart + parseInt((this.mVelocity > 0 ? distance : -distance).toFixed(0));
        this.mDuration = - parseInt((1000.0 * this.mVelocity / this.mDeceleration).toFixed(0));
    }

    continueWhenFinished() {
        switch (this.mState) {
            case SPLINE:
                // Duration from start to null velocity
                if (this.mDuration < this.mSplineDuration) {
                    // If the animation was clamped, we reached the edge
                    this.mStart = this.mFinal;
                    // TODO Better compute speed when edge was reached
                    this.mVelocity = parseInt(this.mCurrVelocity.toFixed(0));
                    this.mDeceleration = getDeceleration(this.mVelocity);
                    this.mStartTime += this.mDuration;
                    this.onEdgeReached();
                } else {
                    // Normal stop, no need to continue
                    return false;
                }
                break;
            case BALLISTIC:
                this.mStartTime += this.mDuration;
                this.startSpringback(this.mFinal, this.mStart, 0);
                break;
            case CUBIC:
                return false;
        }

        this.update();
        return true;
    }

    /*
     * Update the current position and velocity for current time. Returns
     * true if update has been done and false if animation duration has been
     * reached.
     */
    update(): boolean {
        const time = Date.now();// AnimationUtils.currentAnimationTimeMillis();
        const currentTime = time - this.mStartTime;

        if (currentTime == 0) {
            // Skip work but report that we're still going if we have a nonzero duration.
            return this.mDuration > 0;
        }
        if (currentTime > this.mDuration) {
            return false;
        }

        let distance = 0.0;
        switch (this.mState) {
            case SPLINE: {
                let t = currentTime / this.mSplineDuration;
                let index = parseInt((NB_SAMPLES * t).toFixed(0));
                let distanceCoef = 1.0;
                let velocityCoef = 0.0;
                if (index < NB_SAMPLES) {
                    const t_inf = index / NB_SAMPLES;
                    const t_sup = (index + 1) / NB_SAMPLES;
                    const d_inf = SPLINE_POSITION[index];
                    const d_sup = SPLINE_POSITION[index + 1];
                    velocityCoef = (d_sup - d_inf) / (t_sup - t_inf);
                    distanceCoef = d_inf + (t - t_inf) * velocityCoef;
                }

                distance = distanceCoef * this.mSplineDistance;
                this.mCurrVelocity = velocityCoef * this.mSplineDistance / this.mSplineDuration * 1000.0;
                break;
            }

            case BALLISTIC: {
                const t = currentTime / 1000.0;
                this.mCurrVelocity = this.mVelocity + this.mDeceleration * t;
                distance = this.mVelocity * t + this.mDeceleration * t * t / 2.0;
                break;
            }

            case CUBIC: {
                const t = (currentTime) / this.mDuration;
                const t2 = t * t;
                const sign = signum(this.mVelocity);
                distance = sign * this.mOver * (3.0 * t2 - 2.0 * t * t2);
                this.mCurrVelocity = sign * this.mOver * 6.0 * (- t + t2);
                break;
            }
        }

        this.mCurrentPosition = this.mStart + parseInt(Math.round(distance).toFixed(0));
        return true;
    }
}