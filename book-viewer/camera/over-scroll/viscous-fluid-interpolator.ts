

const VISCOUS_FLUID_SCALE = 8.0;
// must be set to 1.0 (used in viscousFluid())

const VISCOUS_FLUID_NORMALIZE = 1.0 / viscousFluid(1.0);
// account for very small floating-point error
const VISCOUS_FLUID_OFFSET = 1.0 - VISCOUS_FLUID_NORMALIZE * viscousFluid(1.0);;


function viscousFluid(x) {
    x *= VISCOUS_FLUID_SCALE;
    if (x < 1.0) {
        x -= (1.0 - Math.exp(-x));
    } else {
        const start = 0.36787944117;   // 1/e == exp(-1)
        x = 1.0 - Math.exp(1.0 - x);
        x = start + x * (1.0 - start);
    }
    return x;
}




export class ViscousFluidInterpolator {
    /** Controls the viscous fluid effect (how much of it). */
    public getInterpolation(input): number {
        const interpolated = VISCOUS_FLUID_NORMALIZE * viscousFluid(input);
        if (interpolated > 0) {
            return interpolated + VISCOUS_FLUID_OFFSET;
        }
        return interpolated;
    }
}