
/*
 * Copyright (C) 2010 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * This class encapsulates scrolling with the ability to overshoot the bounds
 * of a scrolling operation. This class is a drop-in replacement for
 * {@link android.widget.Scroller} in most cases.
 */


import {ViscousFluidInterpolator}from './viscous-fluid-interpolator';
import {SplineOverScroller,SPLINE} from './spline-over-scroller';
import {signum} from '../../../engine/math';

const DEFAULT_DURATION = 250;
const SCROLL_MODE = 0;
const FLING_MODE = 1;

export class OverScroller {
    private mMode: number;

    private mScrollerX: SplineOverScroller;
    private mScrollerY: SplineOverScroller;

    private mInterpolator: ViscousFluidInterpolator;

    private mFlywheel: boolean;

    /**
     * Creates an OverScroller.
     * @param context The context of this application.
     * @param interpolator The scroll interpolator. If null, a default (viscous) interpolator will
     * be used.
     * @param flywheel If true, successive fling motions will keep on increasing scroll speed.
     * @hide
     */
    public constructor(interpolator: ViscousFluidInterpolator=null, flywheel: boolean=false) {
        if (interpolator == null) {
            this.mInterpolator = new ViscousFluidInterpolator();
        } else {
            this.mInterpolator = interpolator;
        }
        this.mFlywheel = flywheel;
        this.mScrollerX = new SplineOverScroller();
        this.mScrollerY = new SplineOverScroller();
    }



    setInterpolator(interpolator: ViscousFluidInterpolator) {
        if (interpolator == null) {
            this.mInterpolator = new ViscousFluidInterpolator();
        } else {
            this.mInterpolator = interpolator;
        }
    }

    /**
     * The amount of friction applied to flings. The default value
     * is {@link ViewConfiguration#getScrollFriction}.
     *
     * @param friction A scalar dimension-less value representing the coefficient of
     *         friction.
     */
    public setFriction(friction: number) {
        this.mScrollerX.setFriction(friction);
        this.mScrollerY.setFriction(friction);
    }

    /**
     *
     * Returns whether the scroller has finished scrolling.
     *
     * @return True if the scroller has finished scrolling, false otherwise.
     */
    public isFinished() {
        return this.mScrollerX.mFinished && this.mScrollerY.mFinished;
    }
    public isXFinished(){
        return this.mScrollerX.mFinished;
    }
    public isYFinished(){
        return this.mScrollerY.mFinished;
    }

    /**
     * Force the finished field to a particular value. Contrary to
     * {@link #abortAnimation()}, forcing the animation to finished
     * does NOT cause the scroller to move to the final x and y
     * position.
     *
     * @param finished The new finished value.
     */
    public forceFinished(finished: boolean) {
        this.mScrollerX.mFinished = this.mScrollerY.mFinished = finished;
    }

    /**
     * Returns the current X offset in the scroll.
     *
     * @return The new X offset as an absolute distance from the origin.
     */
    public getCurrX(): number {
        return this.mScrollerX.mCurrentPosition;
    }

    /**
     * Returns the current Y offset in the scroll.
     *
     * @return The new Y offset as an absolute distance from the origin.
     */
    public getCurrY(): number {
        return this.mScrollerY.mCurrentPosition;
    }

    /**
     * Returns the absolute value of the current velocity.
     *
     * @return The original velocity less the deceleration, norm of the X and Y velocity vector.
     */
    public getCurrVelocity(): number {
        let squaredNorm = this.mScrollerX.mCurrVelocity * this.mScrollerX.mCurrVelocity;
        squaredNorm += this.mScrollerY.mCurrVelocity * this.mScrollerY.mCurrVelocity;
        return Math.sqrt(squaredNorm);
    }

    /**
     * Returns the start X offset in the scroll.
     *
     * @return The start X offset as an absolute distance from the origin.
     */
    public getStartX(): number {
        return this.mScrollerX.mStart;
    }

    /**
     * Returns the start Y offset in the scroll.
     *
     * @return The start Y offset as an absolute distance from the origin.
     */
    public getStartY(): number {
        return this.mScrollerY.mStart;
    }

    /**
     * Returns where the scroll will end. Valid only for "fling" scrolls.
     *
     * @return The final X offset as an absolute distance from the origin.
     */
    public getFinalX(): number {
        return this.mScrollerX.mFinal;
    }

    /**
     * Returns where the scroll will end. Valid only for "fling" scrolls.
     *
     * @return The final Y offset as an absolute distance from the origin.
     */
    public getFinalY(): number {
        return this.mScrollerY.mFinal;
    }

    /**
     * Returns how long the scroll event will take, in milliseconds.
     *
     * @return The duration of the scroll in milliseconds.
     *
     * @hide Pending removal once nothing depends on it
     * @deprecated OverScrollers don't necessarily have a fixed duration.
     *             This function will lie to the best of its ability.
     */
    public getDuration(): number {
        return Math.max(this.mScrollerX.mDuration, this.mScrollerY.mDuration);
    }

    /**
     * Extend the scroll animation. This allows a running animation to scroll
     * further and longer, when used with {@link #setFinalX(int)} or {@link #setFinalY(int)}.
     *
     * @param extend Additional time to scroll in milliseconds.
     * @see #setFinalX(int)
     * @see #setFinalY(int)
     *
     * @hide Pending removal once nothing depends on it
     * @deprecated OverScrollers don't necessarily have a fixed duration.
     *             Instead of setting a new final position and extending
     *             the duration of an existing scroll, use startScroll
     *             to begin a new animation.
     */
    public extendDuration(extend: number) {
        this.mScrollerX.extendDuration(extend);
        this.mScrollerY.extendDuration(extend);
    }

    /**
     * Sets the final position (X) for this scroller.
     *
     * @param newX The new X offset as an absolute distance from the origin.
     * @see #extendDuration(int)
     * @see #setFinalY(int)
     *
     * @hide Pending removal once nothing depends on it
     * @deprecated OverScroller's final position may change during an animation.
     *             Instead of setting a new final position and extending
     *             the duration of an existing scroll, use startScroll
     *             to begin a new animation.
     */
    public setFinalX(newX: number) {
        this.mScrollerX.setFinalPosition(newX);
    }

    /**
     * Sets the final position (Y) for this scroller.
     *
     * @param newY The new Y offset as an absolute distance from the origin.
     * @see #extendDuration(int)
     * @see #setFinalX(int)
     *
     * @hide Pending removal once nothing depends on it
     * @deprecated OverScroller's final position may change during an animation.
     *             Instead of setting a new final position and extending
     *             the duration of an existing scroll, use startScroll
     *             to begin a new animation.
     */
    public setFinalY(newY: number) {
        this.mScrollerY.setFinalPosition(newY);
    }

    /**
     * Call this when you want to know the new location. If it returns true, the
     * animation is not yet finished.
     */
    public computeScrollOffset(): boolean {
        if (this.isFinished()) {
            return false;
        }

        switch (this.mMode) {
            case SCROLL_MODE:
                const time = Date.now();
                // Any scroller can be used for time, since they were started
                // together in scroll mode. We use X here.
                const elapsedTime = time - this.mScrollerX.mStartTime;

                const duration = this.mScrollerX.mDuration;
                if (elapsedTime < duration) {
                    const q = this.mInterpolator.getInterpolation(elapsedTime / duration);
                    this.mScrollerX.updateScroll(q);
                    this.mScrollerY.updateScroll(q);
                } else {
                    this.abortAnimation();
                }
                break;

            case FLING_MODE:
                if (!this.mScrollerX.mFinished) {
                    if (!this.mScrollerX.update()) {
                        if (!this.mScrollerX.continueWhenFinished()) {
                            this.mScrollerX.finish();
                        }
                    }
                }

                if (!this.mScrollerY.mFinished) {
                    if (!this.mScrollerY.update()) {
                        if (!this.mScrollerY.continueWhenFinished()) {
                            this.mScrollerY.finish();
                        }
                    }
                }

                break;
        }

        return true;
    }

    /**
     * Start scrolling by providing a starting point and the distance to travel.
     * The scroll will use the default value of 250 milliseconds for the
     * duration.
     *
     * @param startX Starting horizontal scroll offset in pixels. Positive
     *        numbers will scroll the content to the left.
     * @param startY Starting vertical scroll offset in pixels. Positive numbers
     *        will scroll the content up.
     * @param dx Horizontal distance to travel. Positive numbers will scroll the
     *        content to the left.
     * @param dy Vertical distance to travel. Positive numbers will scroll the
     *        content up.
     */
    //  public  startScroll(startX:number, startY:number, dx:number, dy:number) {
    //      startScroll(startX, startY, dx, dy, DEFAULT_DURATION);
    //  }

    /**
     * Start scrolling by providing a starting point and the distance to travel.
     *
     * @param startX Starting horizontal scroll offset in pixels. Positive
     *        numbers will scroll the content to the left.
     * @param startY Starting vertical scroll offset in pixels. Positive numbers
     *        will scroll the content up.
     * @param dx Horizontal distance to travel. Positive numbers will scroll the
     *        content to the left.
     * @param dy Vertical distance to travel. Positive numbers will scroll the
     *        content up.
     * @param duration Duration of the scroll in milliseconds.
     */
    public startScroll(startX: number, startY: number, dx: number, dy: number, duration: number = DEFAULT_DURATION) {
        this.mMode = SCROLL_MODE;
        this.mScrollerX.startScroll(startX, dx, duration);
        this.mScrollerY.startScroll(startY, dy, duration);
    }

    /**
     * Call this when you want to 'spring back' into a valid coordinate range.
     *
     * @param startX Starting X coordinate
     * @param startY Starting Y coordinate
     * @param minX Minimum valid X value
     * @param maxX Maximum valid X value
     * @param minY Minimum valid Y value
     * @param maxY Minimum valid Y value
     * @return true if a springback was initiated, false if startX and startY were
     *          already within the valid range.
     */
    public springBack(startX: number, startY: number, minX: number, maxX: number, minY: number, maxY: number): boolean {
        this.mMode = FLING_MODE;

        // Make sure both methods are called.
        const spingbackX = this.mScrollerX.springback(startX, minX, maxX);
        const spingbackY = this.mScrollerY.springback(startY, minY, maxY);
        return spingbackX || spingbackY;
    }

    /**
     * Start scrolling based on a fling gesture. The distance traveled will
     * depend on the initial velocity of the fling.
     *
     * @param startX Starting point of the scroll (X)
     * @param startY Starting point of the scroll (Y)
     * @param velocityX Initial velocity of the fling (X) measured in pixels per
     *            second.
     * @param velocityY Initial velocity of the fling (Y) measured in pixels per
     *            second
     * @param minX Minimum X value. The scroller will not scroll past this point
     *            unless overX > 0. If overfling is allowed, it will use minX as
     *            a springback boundary.
     * @param maxX Maximum X value. The scroller will not scroll past this point
     *            unless overX > 0. If overfling is allowed, it will use maxX as
     *            a springback boundary.
     * @param minY Minimum Y value. The scroller will not scroll past this point
     *            unless overY > 0. If overfling is allowed, it will use minY as
     *            a springback boundary.
     * @param maxY Maximum Y value. The scroller will not scroll past this point
     *            unless overY > 0. If overfling is allowed, it will use maxY as
     *            a springback boundary.
     * @param overX Overfling range. If > 0, horizontal overfling in either
     *            direction will be possible.
     * @param overY Overfling range. If > 0, vertical overfling in either
     *            direction will be possible.
     */
    public fling(startX: number, startY: number, velocityX: number, velocityY: number,
        minX: number, maxX: number, minY: number, maxY: number, overX: number = 0, overY: number = 0) {
        // Continue a scroll or fling in progress
        if (this.mFlywheel && !this.isFinished()) {
            const oldVelocityX = this.mScrollerX.mCurrVelocity;
            const oldVelocityY = this.mScrollerY.mCurrVelocity;
            if (signum(velocityX) == signum(oldVelocityX) &&
                signum(velocityY) == signum(oldVelocityY)) {
                velocityX += oldVelocityX;
                velocityY += oldVelocityY;
            }
        }

        this.mMode = FLING_MODE;
        this.mScrollerX.fling(startX, velocityX, minX, maxX, overX);
        this.mScrollerY.fling(startY, velocityY, minY, maxY, overY);
    }

    /**
     * Notify the scroller that we've reached a horizontal boundary.
     * Normally the information to handle this will already be known
     * when the animation is started, such as in a call to one of the
     * fling functions. However there are cases where this cannot be known
     * in advance. This function will transition the current motion and
     * animate from startX to finalX as appropriate.
     *
     * @param startX Starting/current X position
     * @param finalX Desired final X position
     * @param overX Magnitude of overscroll allowed. This should be the maximum
     *              desired distance from finalX. Absolute value - must be positive.
     */
    public notifyHorizontalEdgeReached(startX: number, finalX: number, overX: number) {
        this.mScrollerX.notifyEdgeReached(startX, finalX, overX);
    }

    /**
     * Notify the scroller that we've reached a vertical boundary.
     * Normally the information to handle this will already be known
     * when the animation is started, such as in a call to one of the
     * fling functions. However there are cases where this cannot be known
     * in advance. This function will animate a parabolic motion from
     * startY to finalY.
     *
     * @param startY Starting/current Y position
     * @param finalY Desired final Y position
     * @param overY Magnitude of overscroll allowed. This should be the maximum
     *              desired distance from finalY. Absolute value - must be positive.
     */
    public notifyVerticalEdgeReached(startY: number, finalY: number, overY: number) {
        this.mScrollerY.notifyEdgeReached(startY, finalY, overY);
    }

    /**
     * Returns whether the current Scroller is currently returning to a valid position.
     * Valid bounds were provided by the
     * {@link #fling(int, int, int, int, int, int, int, int, int, int)} method.
     *
     * One should check this value before calling
     * {@link #startScroll(int, int, int, int)} as the interpolation currently in progress
     * to restore a valid position will then be stopped. The caller has to take into account
     * the fact that the started scroll will start from an overscrolled position.
     *
     * @return true when the current position is overscrolled and in the process of
     *         interpolating back to a valid value.
     */
    public isOverScrolled(): boolean {
        return ((!this.mScrollerX.mFinished &&
            this.mScrollerX.mState != SPLINE) ||
            (!this.mScrollerY.mFinished &&
                this.mScrollerY.mState != SPLINE));
    }

    /**
     * Stops the animation. Contrary to {@link #forceFinished(boolean)},
     * aborting the animating causes the scroller to move to the final x and y
     * positions.
     *
     * @see #forceFinished(boolean)
     */
    public abortAnimation() {
        this.mScrollerX.finish();
        this.mScrollerY.finish();
    }

    /**
     * Returns the time elapsed since the beginning of the scrolling.
     *
     * @return The elapsed time in milliseconds.
     *
     * @hide
     */
    public timePassed(): number {
        const time = Date.now();// AnimationUtils.currentAnimationTimeMillis();
        const startTime = Math.min(this.mScrollerX.mStartTime, this.mScrollerY.mStartTime);
        return (time - startTime);
    }

    /**
     * @hide
     */
    public isScrollingInDirection(xvel: number, yvel: number) {
        const dx = this.mScrollerX.mFinal - this.mScrollerX.mStart;
        const dy = this.mScrollerY.mFinal - this.mScrollerY.mStart;
        return !this.isFinished() && signum(xvel) == signum(dx) &&
            signum(yvel) == signum(dy);
    }


}