
import {VelocityTrackerStrategy, Estimator} from './velocity-tracker-strategy';
export class VelocityTracker {
    private mLastUpdate: number;
    private mStrategy: VelocityTrackerStrategy;
    private mLastPositionUpdate;
    constructor() {
        this.mLastPositionUpdate = [0, 0];
        this.mStrategy = new VelocityTrackerStrategy(2);
    }

    public addMovement(time, x, y) {
        let deltaTime = time - this.mLastUpdate;
        if (deltaTime > 50  ) {
            console.log('long time elapsed, clear now');
            this.mStrategy.clear();
        }
      /*  else if (deltaTime < 5) {
            console.log('to fast, skip');
            return;

        } else if (deltaTime < 15 && (Math.abs(x - this.mLastPositionUpdate[0]) + Math.abs(y - this.mLastPositionUpdate[1])) < 8) {
            console.log('fast deltatime and no change in position');
            return;
        }*/

        this.mLastUpdate = time;
        this.mStrategy.addMovement(time, x, y);
        this.mLastPositionUpdate[0] = x;
        this.mLastPositionUpdate[1] = y;
    }
    public clearMovements() {
        this.mStrategy.clear();
    }
    public getVelocity(outVelocity: number[],multiplier:number=1000) {
        let estimator = this.mStrategy.getEstimator();
        if (estimator !== undefined && estimator.Degree >= 1) {
            outVelocity[0] = estimator.XCoeff[1]*multiplier;
            outVelocity[1] = estimator.YCoeff[1]*multiplier;
            return true;
        }

        outVelocity[0] = 0;
        outVelocity[1] = 0;
        return false;
    }



}