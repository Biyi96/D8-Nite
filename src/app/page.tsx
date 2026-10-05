import { notFound, redirect } from "next/navigation";
import { latestDate } from "@/lib/dates";

export default function Home() {
  const date = latestDate();
  if (!date) notFound();
  redirect(`/dates/${date.slug}`);
}
