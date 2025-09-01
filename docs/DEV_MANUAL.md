# Developer Manual

APIs used:
- Maps JavaScript API
- Places API
- Directions API

Set API key in .env.local:
VITE_GOOGLE_MAPS_API_KEY=YOUR_KEY

Files:
- Map: src/components/MapView.jsx
- List & filters: src/components/PlacesPanel.jsx
- Details caching: src/utils/placesHelpers.js

Production:
- Restrict API key by HTTP referrers to your deployment domains.
- For heavy usage, move sensitive Places Details requests to a server-side proxy to hide the API key.
