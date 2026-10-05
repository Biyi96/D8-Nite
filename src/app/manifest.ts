import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "D8Nite",
    short_name: "D8Nite",
    description: "A date-night itinerary, one stop at a time.",
    start_url: "/",
    display: "standalone",
    background_color: "#6B1640",
    theme_color: "#6B1640",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
