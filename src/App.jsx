// App.jsx

import React, { useState } from 'react'
// removed APIProvider to avoid double-loading Google Maps script; use useJsApiLoader
import { useJsApiLoader } from '@react-google-maps/api'

// Move libraries array outside component to avoid performance warning
const GOOGLE_MAPS_LIBRARIES = ['places']

import NavTabs from './components/NavTabs'
import MapView from './components/MapView'
import PlacesPanel from './components/PlacesPanel'
import useMediaQuery from './hooks/useMediaQuery'
import { PLACE_TYPES, DEFAULT_LOCATION } from './constants'

import './index.css'
import './App.css'


export default function App() {
  const [activeTab, setActiveTab] = useState('cafes')
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [center, setCenter] = useState(DEFAULT_LOCATION)
  const [filters, setFilters] = useState({ radius: 1500, openNow: false, minRating: 0 })
  const [mobileListOpen, setMobileListOpen] = useState(false)

  const isMobile = useMediaQuery('(max-width: 899px)')
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  // Ensure Google Maps JS API is loaded with Places library
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES
  })

  function handleLocate() {
    if (!navigator.geolocation) {
      alert('Geolocation not available in your browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude, _userLocation: true, accuracy: pos.coords.accuracy }
        setCenter(p)
      },
      err => alert('Could not get location: ' + err.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    )
  }

  function openMobileList() { setMobileListOpen(true) }
  function closeMobileList() { setMobileListOpen(false) }

  if (!isLoaded) return <div style={{padding:20}}>Loading Google Maps...</div>

  const themeClass = activeTab === 'cafes' ? 'theme-cafes' : activeTab === 'restaurants' ? 'theme-restaurants' : 'theme-tourist'

  return (
    <div className={`app-root ${themeClass}`}>
        <header className="app-header">
          <div className="header-inner">
            <div className="brand">
              <div className="brand-title">☕ Cafe Finder</div>
              <div className="brand-sub">Find cafes, restaurants & tourist places</div>
            </div>
            <div className="header-controls">
              <NavTabs active={activeTab} onChange={setActiveTab} />
            </div>
          </div>
        </header>

        {!apiKey && (
          <div className="api-warning">
            Google Maps API key missing — add <code>VITE_GOOGLE_MAPS_API_KEY</code> to <code>.env.local</code>.
          </div>
        )}

        <main className="app-grid">
          {/* Desktop left panel */}
          <aside className="left-panel" aria-hidden={isMobile}>
            <PlacesPanel
              placeType={PLACE_TYPES[activeTab]}
              onSelect={p => setSelectedPlace(p)}
              filters={filters}
              onFilterChange={setFilters}
              center={center}
              onLocate={handleLocate}
              onCenterChange={setCenter}
            />
          </aside>

          {/* Map area */}
          <section className="map-section">
            <MapView
              center={center}
              onCenterChange={setCenter}
              placeType={PLACE_TYPES[activeTab]}
              selectedPlace={selectedPlace}
              setSelectedPlace={setSelectedPlace}
              filters={filters}
              mobileDrawerOpenToggle={openMobileList}
            />
          </section>
        </main>

        {/* Mobile drawer for list (tapped from map) */}
        {isMobile && mobileListOpen && (
          <div className="mobile-drawer-backdrop" role="dialog" aria-modal="true" onClick={closeMobileList}>
            <div className="mobile-drawer" onClick={e => e.stopPropagation()}>
              <div className="mobile-drawer-header">
                <div className="mobile-drawer-title">Results</div>
                <button className="mobile-drawer-close" onClick={closeMobileList} aria-label="Close">✕</button>
              </div>
              <div className="mobile-drawer-content">
                <PlacesPanel
                  placeType={PLACE_TYPES[activeTab]}
                  onSelect={p => { setSelectedPlace(p); closeMobileList() }}
                  filters={filters}
                  onFilterChange={setFilters}
                  center={center}
                  onLocate={() => { handleLocate(); closeMobileList() }}
                  onCloseMobile={closeMobileList}
                  onCenterChange={setCenter}
                />
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
