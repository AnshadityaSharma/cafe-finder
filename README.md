# Cafe Finder

A modern, responsive place discovery app built with React and Leaflet. Browse cafes, restaurants, bars, hotels, parks, and tourist attractions near any location.

## Features

- Interactive map powered by OpenStreetMap + Leaflet (completely free)
- Place search via Overpass API (no API key required)
- Location autocomplete via Nominatim
- 6 categories: Cafes, Restaurants, Bars, Hotels, Parks, Tourist spots
- Adjustable search radius
- Rating filters
- Geolocation support
- Mobile responsive with drawer interface
- Directions via Google Maps link

## Tech Stack

- **React 18** with Vite
- **Leaflet** for maps (OpenStreetMap tiles via CARTO)
- **Overpass API** for place data from OpenStreetMap
- **Nominatim** for geocoding / location search
- **Framer Motion** for animations
- **Lucide React** for icons

## Getting Started

```bash
npm install
npm run dev
```

No API keys required. Everything runs on free, open-source APIs.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run sync` | Auto commit and push to GitHub |

## License

MIT
