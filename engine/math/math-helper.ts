/**
 * clambs value between min and max 
 * 
 * @export
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns
 */
export function range(value:number,min:number,max:number){
    return Math.max(min, Math.min(value,max));
}


