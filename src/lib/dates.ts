import "server-only";
import fs from "node:fs";
import path from "node:path";
import { dates } from "@content/dates";
import type { DateNight, ResolvedDateNight } from "@content/types";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const PHOTO_EXT = /\.(jpe?g|png|webp|avif)$/i;

export function allDates(): DateNight[] {
  return [...dates].sort((a, b) => b.slug.localeCompare(a.slug));
}

export function latestDate(): DateNight | undefined {
  return allDates()[0];
}

export function getDate(slug: string): DateNight | undefined {
  return dates.find((d) => d.slug === slug);
}

function publicFileExists(publicPath: string) {
  return fs.existsSync(path.join(PUBLIC_DIR, publicPath));
}

function discoverPhotos(stopId: string): string[] {
  const dir = path.join(PUBLIC_DIR, "photos", stopId);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => PHOTO_EXT.test(f))
    .sort()
    .map((f) => `/photos/${stopId}/${f}`);
}

/**
 * Checks which models and photos are actually on disk, so a missing GLB shows
 * the placeholder room without a 404, and dropped-in photos appear on their own.
 */
export function resolveAssets(date: DateNight): ResolvedDateNight {
  return {
    ...date,
    stops: date.stops.map((stop) => ({
      ...stop,
      hasModel: publicFileExists(stop.model),
      photos: stop.photos.length ? stop.photos : discoverPhotos(stop.id),
    })),
  };
}
