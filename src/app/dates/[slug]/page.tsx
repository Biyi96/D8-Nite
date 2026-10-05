import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { allDates, getDate, resolveAssets } from "@/lib/dates";
import DateExperience from "@/components/DateExperience";

export const dynamicParams = false;

export function generateStaticParams() {
  return allDates().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata(
  props: PageProps<"/dates/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const date = getDate(slug);
  if (!date) return {};
  return {
    title: `${date.title} · ${date.dateLabel}`,
    description: date.stops.map((s) => `${s.arrive} ${s.name}`).join(" → "),
  };
}

export async function generateViewport(
  props: PageProps<"/dates/[slug]">,
): Promise<Viewport> {
  const { slug } = await props.params;
  return { themeColor: getDate(slug)?.stops[0]?.bg };
}

export default async function DatePage(props: PageProps<"/dates/[slug]">) {
  const { slug } = await props.params;
  const date = getDate(slug);
  if (!date) notFound();
  return <DateExperience date={resolveAssets(date)} />;
}
