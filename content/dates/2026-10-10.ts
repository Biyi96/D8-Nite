import type { DateNight } from "../types";

export const date: DateNight = {
  slug: "2026-10-10",
  title: "Date Night",
  dateLabel: "Saturday 10 October",
  intro:
    "Three stops, one city, one very good Saturday. First up: a hidden bar behind a velvet curtain.",
  credit: "Made with ♥ by B",
  stops: [
    {
      id: "red-room",
      eyebrow: "Stop 01 · Drinks",
      name: "The Red Room",
      venue: "The Connaught, Mayfair",
      arrive: "15:00",
      leave: "15:45",
      bg: "#6B1640",
      accent: "#F4C7CF",
      model: "/models/red-room.glb",
      blurb: "A hidden bar behind a velvet curtain. Pink onyx, red art, wine by the glass.",
      address: "The Connaught, Carlos Place, Mayfair, London W1K 2AL",
      menuUrl: "https://www.the-connaught.co.uk/restaurants-bars/red-room",
      mapsUrl:
        "https://www.google.com/maps/dir/?api=1&destination=The+Connaught+Carlos+Place+London+W1K+2AL",
      photos: [], // add to /public/photos/red-room/
    },
    {
      id: "tate-britain",
      eyebrow: "Stop 02 · Exhibition",
      name: "The 90s: Art and Fashion",
      headline: ["The 90s", "Art & Fashion"],
      venue: "Tate Britain, Millbank",
      arrive: "16:00",
      leave: "17:45",
      bg: "#6A4A8C",
      accent: "#E8DCC6",
      model: "/models/tate-britain.glb",
      blurb: "Edward Enninful's 90s: Teller, Knight, McQueen, Westwood.",
      address: "Tate Britain, Millbank, London SW1P 4RG",
      menuUrl: "https://www.tate.org.uk/whats-on/tate-britain/the-90s",
      menuLabel: "The exhibition",
      mapsUrl:
        "https://www.google.com/maps/dir/?api=1&destination=Tate+Britain+Millbank+London+SW1P+4RG",
      photos: [],
    },
    {
      id: "barbarella",
      eyebrow: "Stop 03 · Dinner",
      name: "Barbarella",
      headline: ["Barba", "rella"],
      venue: "Big Mamma, Canary Wharf",
      arrive: "18:30",
      leave: "21:00",
      bg: "#B5481A",
      accent: "#D9DDE3",
      model: "/models/barbarella.glb",
      blurb: "70s Cinecittà glamour on the water. Lobster spaghettoni.",
      address: "YY Building, 30 South Colonnade, Canary Wharf, London E14 5HX",
      menuUrl: "https://www.bigmammagroup.com/italian-restaurants/barbarella",
      mapsUrl:
        "https://www.google.com/maps/dir/?api=1&destination=30+South+Colonnade+Canary+Wharf+London+E14+5HX",
      photos: [],
    },
  ],
};
