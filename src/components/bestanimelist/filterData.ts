export const categories = [
  { id: "all", label: "All Archives", icon: "Database" },
  { id: "trending", label: "Trending Now", icon: "Zap" },
  { id: "top-rated", label: "Highest Rated", icon: "Star" },
  { id: "new", label: "Newly Synced", icon: "Clock" },
];

export const filterSections = [
  {
    id: "format",
    title: "Format",
    options: [
      { id: "tv", label: "TV Series" },
      { id: "movie", label: "Movie" },
      { id: "ova", label: "OVA" },
    ],
  },
  {
    id: "status",
    title: "Air Status",
    options: [
      { id: "finished", label: "Completed" },
      { id: "airing", label: "Currently Airing" },
    ],
  },
  {
    id: "genres",
    title: "Neural Tags",
    options: [
      { id: "action", label: "Action" },
      { id: "psychological", label: "Psychological" },
      { id: "seinen", label: "Seinen" },
      { id: "shonen", label: "Shonen" },
      { id: "thriller", label: "Thriller" },
    ],
  },
];