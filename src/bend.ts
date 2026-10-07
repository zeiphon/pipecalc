/** Length of pipe centerline consumed by a bend of `angleDeg` at centerline radius `radius`. */
export function arcLength(angleDeg: number, radius: number): number {
  return (angleDeg * Math.PI * radius) / 180;
}
