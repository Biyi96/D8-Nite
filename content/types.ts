/**
 * Content model for a date night. A new date is a new file in
 * `content/dates/` that exports `date` with this shape, plus one line in
 * `content/dates/index.ts`. No component changes needed.
 */

export type Stop = {
  /** Used for the photo folder (`/public/photos/<id>/`) and the URL hash. */
  id: string;
  /** Small label above the headline, e.g. "Stop 01 · Drinks". */
  eyebrow: string;
  name: string;
  /**
   * Optional line breaks for the huge hero headline. Defaults to the venue
   * name split into two roughly equal lines. (The first stop's hero always
   * shows the date's title instead.)
   */
  headline?: string[];
  venue: string;
  /** 24h "HH:MM". */
  arrive: string;
  leave: string;
  /** Hero background colour. */
  bg: string;
  /** Accent colour: placeholder model, glow, placeholder photos. */
  accent: string;
  /** Path under /public. Drop the GLB in and it replaces the placeholder room. */
  model: string;
  blurb: string;
  address: string;
  menuUrl: string;
  /** Label for the menu card. Defaults to "The menu". */
  menuLabel?: string;
  /** Optional preview image for the menu card, path under /public. */
  menuImage?: string;
  mapsUrl: string;
  /**
   * Photo paths under /public. Leave empty to pick up every image in
   * `/public/photos/<id>/` automatically (sorted by filename).
   */
  photos: string[];
};

export type DateNight = {
  /** URL slug: /dates/<slug>. ISO date keeps them sortable. */
  slug: string;
  title: string;
  dateLabel: string;
  /** Short paragraph under the landing headline. */
  intro?: string;
  /** Credit line in the corner chrome. */
  credit?: string;
  stops: Stop[];
};

/** A stop after the server has checked which assets actually exist. */
export type ResolvedStop = Stop & { hasModel: boolean };
export type ResolvedDateNight = Omit<DateNight, "stops"> & {
  stops: ResolvedStop[];
};
