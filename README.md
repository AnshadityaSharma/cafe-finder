# Cafe Finder

A modern React + Vite web app to discover cafes, restaurants, and tourist attractions near you, with Google Maps integration, directions, reviews, and a responsive UI.

## Features

- **Google Maps Integration:** Interactive map with markers for places, user location, and directions.
- **Nearby Search:** Find cafes, restaurants, or tourist spots near your current location or any searched address/city.
- **Search by Address/City:** Use autocomplete to search for any location and see places nearby.
- **User Location:** Shows your current location on the map (with accuracy circle if available).
- **Directions:** Get walking directions from your location to any place.
- **Details Modal:** View place details, photos, reviews, and website links in a modal.
- **Responsive Design:** Works great on desktop and mobile, with animated transitions and modern SVG icons.
- **Theming:** Tabs for cafes, restaurants, and tourist attractions with color themes.

## How It Works

1. **Map Loading:**
	- Loads Google Maps JS API with Places and Advanced Marker libraries.
	- Shows a map centered on your location or a default city.

2. **Nearby Search:**
	- Uses Google Maps Places API v3 to search for places of the selected type (cafe, restaurant, tourist attraction) within a radius.
	- Places are shown as animated markers on the map and listed in the sidebar.

3. **User Location:**
	- Click the location button to use browser geolocation (requests high accuracy).
	- Your location is shown as a blue marker with an accuracy circle.

4. **Search by Address/City:**
	- Use the search bar to autocomplete and select any address/city.
	- The map recenters and shows places near that location.

5. **Details & Directions:**
	- Click any marker or list item to open the details modal.
	- See photos, reviews, ratings, and website links.
	- Click "Directions" to get walking directions from your location to the place.

6. **Mobile Experience:**
	- On mobile, the list and details modal appear as bottom sheets for easy navigation.
	- Controls and icons are touch-friendly and animated.

## Technologies Used

- **React** (with hooks)
- **Vite** (fast dev/build)
- **Google Maps JS API** (with Places v3, Advanced Marker)
- **@react-google-maps/api** (script loader)
- **Framer Motion** (modal animations)
- **Custom CSS** (responsive grid, theming, transitions)

## Setup & Development

1. **Clone the repo:**
	```sh
	git clone https://github.com/AnshadityaSharma/cafe-finder.git
	cd cafe-finder
	```
2. **Install dependencies:**
	```sh
	npm install
	```
3. **Add your Google Maps API key:**
	- Create a `.env.local` file:
	  ```sh
	  echo VITE_GOOGLE_MAPS_API_KEY=your_api_key_here > .env.local
	  ```
	- Get an API key from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and enable Maps + Places APIs.
4. **Run locally:**
	```sh
	npm run dev
	```
5. **Build for production:**
	```sh
	npm run build
	```

## Deployment

- **Recommended:** Deploy to [Vercel](https://vercel.com) or [Netlify](https://netlify.com) for instant HTTPS and CI/CD.
- Push your code to GitHub, connect your repo in Vercel/Netlify, set your environment variable (`VITE_GOOGLE_MAPS_API_KEY`), and deploy.

## Folder Structure

```
my-cafe-finder/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── constants.js
│   ├── main.jsx
│   ├── assets/
│   │   └── icons/
│   ├── components/
│   │   ├── MapView.jsx
│   │   ├── DetailsModal.jsx
│   │   ├── PlacesPanel.jsx
│   │   ├── NavTabs.jsx
│   │   ├── PlaceCard.jsx
│   ├── hooks/
│   │   └── useMediaQuery.jsx
│   ├── utils/
│   │   ├── googleLoader.js
│   │   └── placesHelpers.js
├── package.json
├── vite.config.js
├── README.md
```

## Customization

- **Change default city:** Edit `DEFAULT_LOCATION` in `src/constants.js`.
- **Add more place types:** Update `PLACE_TYPES` in `src/constants.js` and UI tabs.
- **Style/theme:** Edit `src/App.css` for colors, spacing, and transitions.

## Troubleshooting

- **Map not loading?** Check your API key and browser console for errors.
- **Location inaccurate?** Try on mobile with GPS/location enabled for best results.
- **Directions not working?** Make sure location permissions are granted and API key is valid.


