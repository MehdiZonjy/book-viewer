const HORIZON = 100;
const HISTORY_SIZE = 20;

interface PositionVector {
    X: number;
    Y: number;
}
class Movement {
    constructor(public EventTime: number, public Position: PositionVector) {

    }
}


export class Estimator {
    static get MAX_DEGREE() {
        return 4;
    }
    public Time: number;
    public XCoeff: number[];
    public YCoeff: number[];
    public Degree: number;
    public Confidence;
    constructor() {
        this.XCoeff = createArray(Estimator.MAX_DEGREE + 1);
        this.YCoeff = createArray(Estimator.MAX_DEGREE + 1);


    }




}

//TODO support pointers
export class VelocityTrackerStrategy {
    private mIndex: number;
    private mMovements: Movement[]
    constructor(private mDegree: number) {

        this.mMovements = [];
        for (let i = 0; i < HISTORY_SIZE; i++)
            this.mMovements.push(new Movement(0, { X: 0, Y: 0 }));
        this.clear();
    }
    public clear() {
        this.mIndex = -1;
    }
    public addMovement(time: number, x, y) {
        if (++this.mIndex == HISTORY_SIZE) {
            this.mIndex = 0;
        }
        let movement = this.mMovements[this.mIndex];
        movement.EventTime = time;
        movement.Position.X = x;
        movement.Position.Y = y;
        console.log(`time: ${time} movementX ${movement.Position.X} movementY ${movement.Position.Y}`);
    }

    public getEstimator() {
        let x = createArray(HISTORY_SIZE);
        let y = createArray(HISTORY_SIZE);
        let w = createArray(HISTORY_SIZE);
        let time = createArray(HISTORY_SIZE);

        let m = 0;
        let index = this.mIndex;

        let newestMovement = this.mMovements[this.mIndex];

        do {
            let movement = this.mMovements[index];
            let age = newestMovement.EventTime - movement.EventTime;
            //   console.log(age);
            if (age > HORIZON)
                break;

            let position = movement.Position;

            x[m] = position.X;
            y[m] = position.Y;
            w[m] = this.chooseWeight(index);// 1.0;
            time[m] = -age;//* 0.000000001;
            index = (index == 0 ? HISTORY_SIZE : index) - 1;
        } while (++m < HISTORY_SIZE);

        if (m == 0)
            return undefined;

        let estimator = new Estimator();
        // Calculate a least squares polynomial fit.
        let degree = this.mDegree;
        if (degree > m - 1)
            degree = m - 1;
        if (degree >= 1) {

            let xDet = 0, yDet = 0;

            let n = degree + 1;
            console.log(m);
            console.log(x);
            console.log(y);
            console.log(time);



            for (let i = 0; i < m; i++)
                console.log(`${time[i]} ${y[i]}`);

              xDet = solveLeastSquares(time, x, w, m, n, estimator.XCoeff);
            yDet = solveLeastSquares(time, y, w, m, n, estimator.YCoeff);
            if(y[0] - y[m-1]<0&& estimator.YCoeff[1]>0)
            {
                console.log('Y correct sign  1');
                estimator.YCoeff[1]*=-1;
            }
            else if (y[0] - y[m-1] >0 && estimator.YCoeff[1]<0)
            {
                console.log('Y correct sign 1');
                estimator.YCoeff[1]*=-1;
                
            }
             if(x[0] - x[m-1]<0&& estimator.XCoeff[1]>0)
            {
                console.log('X correct sign 1');
                estimator.XCoeff[1]*=-1;
            }
            else if (x[0] - x[m-1] >0 && estimator.XCoeff[1]<0)
            {
                console.log('X correct sign 1');
                estimator.XCoeff[1]*=-1;
                
            }

/*

  
            if (m > 3) {
                let diff1 = Math.abs(y[0] - y[1]);
                let diff2 = Math.abs(y[1] - y[2]);


                if (diff1 + diff2 < 5) {
                    console.log('you seem to be slowing down , no velocity will be calculated');
                    console.log(`calculated speedX ${estimator.XCoeff[1]} speedY ${estimator.YCoeff[1]}`);
                    estimator.XCoeff[1]=0;
                    estimator.YCoeff[1]=0;
                    return undefined;
                }
            }
*/



            if (xDet !== undefined && yDet !== undefined) {
                estimator.Time = newestMovement.EventTime;
                estimator.Degree = degree;
                estimator.Confidence = xDet * yDet;
                console.log(estimator);
                return estimator;

            }
        }
        estimator.XCoeff[0] = x[0];
        estimator.YCoeff[0] = y[0];
        estimator.Time = newestMovement.EventTime;
        estimator.Degree = 0;
        estimator.Confidence = 1;
        return estimator;
    }


    chooseWeight(index) {
        // Weight points based on how much time elapsed between them and the next
        // point so that points that "cover" a shorter time span are weighed less.
        //   delta  0ms: 0.5
        //   delta 10ms: 1.0
        if (index == this.mIndex) {
            return 1.0;
        }
        let nextIndex = (index + 1) % HISTORY_SIZE;
        let deltaMillis = (this.mMovements[nextIndex].EventTime - this.mMovements[index].EventTime);
        if (deltaMillis < 0) {
            return 0.25;
        }
        if (deltaMillis < 10) {
            return 0.25 + deltaMillis * 0.05;
        }
        return 1.0;
    }

}



function solveLeastSquares(x, y, w, m, n, outB) {
    // Expand the X vector to a matrix A, pre-multiplied by the weights.

    let a = createArray(n, m);
    for (let h = 0; h < m; h++) {
        a[0][h] = w[h];
        for (let i = 1; i < n; i++) {
            a[i][h] = a[i - 1][h] * x[h];
        }
    }


    // Apply the Gram-Schmidt process to A to obtain its QR decomposition.
    let q = createArray(n, m);
    let r = createArray(n, n);


    for (let j = 0; j < n; j++) {
        for (let h = 0; h < m; h++) {
            q[j][h] = a[j][h];
        }
        for (let i = 0; i < j; i++) {
            let dot = vectorDot(q[j], q[i], m);
            for (let h = 0; h < m; h++) {
                q[j][h] -= dot * q[i][h];
            }
        }


        let norm = vectorNorm(q[j], m);
        if (norm < 0.000001) {
            // vectors are linearly dependent or zero so no solution
            console.log("  - no solution, norm=%f", norm);
            return undefined;
        }

        let invNorm = 1.0 / norm;
        for (let h = 0; h < m; h++) {
            q[j][h] *= invNorm;
        }

        for (let i = 0; i < n; i++) {
            r[j][i] = i < j ? 0 : vectorDot(q[j], a[i], m);
        }
    }

    // Solve R B = Qt W Y to find B.  This is easy because R is upper triangular.
    // We just work from bottom-right to top-left calculating B's coefficients.
    let wy = createArray(m);
    for (let h = 0; h < m; h++) {
        wy[h] = y[h] * w[h];
    }

    for (let i = n; i != 0;) {
        i--;
        outB[i] = vectorDot(q[i], wy, m);
        for (let j = n - 1; j > i; j--) {
            outB[i] -= r[i][j] * outB[j];
        }
        outB[i] /= r[i][i];
    }


    // Calculate the coefficient of determination as 1 - (SSerr / SStot) where
    // SSerr is the residual sum of squares (variance of the error),
    // and SStot is the total sum of squares (variance of the data) where each
    // has been weighted.

    let ymean = 0;
    for (let h = 0; h < m; h++) {
        ymean += y[h];
    }
    ymean /= m;


    let sserr = 0;
    let sstot = 0;
    for (let h = 0; h < m; h++) {
        let err = y[h] - outB[0];
        let term = 1;
        for (let i = 1; i < n; i++) {
            term *= x[h];
            err -= term * outB[i];
        }

        sserr += w[h] * w[h] * err * err;
        let temp = y[h] - ymean;
        sstot += w[h] * w[h] * temp * temp;
    }
    let outDet = sstot > 0.000001 ? 1.0 - (sserr / sstot) : 1;

    return outDet;

}



function createArray(n, m?) {
    var a = [];

    for (let i = 0; i < n; i++) {
        if (m) {

            var a2 = [];
            for (let i = 0; i < m; i++) {
                a2.push(0);
            }
            a.push(a2);
        }
        else
            a.push(0);
    }
    return a;
}



function vectorDot(a, b, m) {
    let r = 0;

    for (let i = 0; i < m; i++) {
        r += a[i] * b[i];
    }
    return r;
}
function vectorNorm(a, m) {
    let r = 0;
    for (let i = 0; i < m; i++) {
        let t = a[i];
        r += t * t;
    }
    return Math.sqrt(r);// sqrtf(r);
}
