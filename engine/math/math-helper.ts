/**
 * clambs value between min and max 
 * 
 * @export
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns
 */
export function range(value: number, min: number, max: number) {
    return Math.max(min, Math.min(value, max));
}


export function signum(n: number): number {

    if (n > 0)
        return 1;
    else if (n < 0)
        return -1;
    else return 0
}