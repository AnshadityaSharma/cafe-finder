import React, { useState } from 'react'
import { X } from 'lucide-react'

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
  const [places, setPlaces] = useState([])
  const [center, setCenter] = useState(DEFAULT_LOCATION)
  const [filters, setFilters] = useState({ radius: 3000, openNow: false, minRating: 0 })
  const [mobileListOpen, setMobileListOpen] = useState(false)

  const isMobile = useMediaQuery('(max-width: 899px)')

  function handleLocate() {
    if (!navigator.geolocation) {
      alert('Geolocation not available in your browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude, _userLocation: true }
        setCenter(p)
      },
      err => alert('Could not get location: ' + err.message),
      { enableHighAccuracy: true }
    )
  }

  function openMobileList() { setMobileListOpen(true) }
  function closeMobileList() { setMobileListOpen(false) }

  return (
    <div className="app-root">
      <header className="app-header glassmorphism">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-title">Cafe Finder</div>
          </div>
          <div className="header-controls">
            <NavTabs active={activeTab} onChange={setActiveTab} />
          </div>
        </div>
      </header>

      <main className="app-grid">
        <aside className="left-panel" aria-hidden={isMobile && !mobileListOpen}>
          <PlacesPanel
            placeType={PLACE_TYPES[activeTab]}
            onSelect={p => setSelectedPlace(p)}
            filters={filters}
            onFilterChange={setFilters}
            center={center}
            onLocate={handleLocate}
            onCenterChange={setCenter}
            onPlacesLoad={setPlaces}
          />
        </aside>

        <section className="map-section">
          <MapView
            center={center}
            onCenterChange={setCenter}
            placeType={PLACE_TYPES[activeTab]}
            places={places}
            selectedPlace={selectedPlace}
            setSelectedPlace={setSelectedPlace}
            filters={filters}
            mobileDrawerOpenToggle={openMobileList}
          />
        </section>
      </main>

      {isMobile && mobileListOpen && (
        <div className="mobile-drawer-backdrop" onClick={closeMobileList}>
          <div className="mobile-drawer glass-panel" onClick={e => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div className="mobile-drawer-title">Explore Nearby</div>
              <button className="icon-button" onClick={closeMobileList} aria-label="Close drawer">
                <X size={18} />
              </button>
            </div>
            <div className="mobile-drawer-content">
              <PlacesPanel
                placeType={PLACE_TYPES[activeTab]}
                onSelect={p => { setSelectedPlace(p); closeMobileList(); }}
                filters={filters}
                onFilterChange={setFilters}
                center={center}
                onLocate={() => { handleLocate(); closeMobileList(); }}
                onCloseMobile={closeMobileList}
                onCenterChange={setCenter}
                onPlacesLoad={setPlaces}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
