/**
 * Sizing for the isometric diorama. Models are normalised to fit a unit cube,
 * and a unit cube seen from a true isometric angle projects to a hexagon
 * 2·√(2/3) ≈ 1.633 tall and √2 ≈ 1.414 wide.
 */
export const HEX_HEIGHT = 2 * Math.sqrt(2 / 3);
export const HEX_WIDTH = Math.SQRT2;

/** Orthographic zoom (px per world unit) so the model fills ~55% of the hero height. */
export function isoZoom(width: number, height: number) {
  return Math.min((height * 0.55) / HEX_HEIGHT, (width * 0.74) / HEX_WIDTH);
}

/** Cap on canvas pixel ratio: crisp on phones without paying for 3x. */
export const MAX_DPR = 2;
