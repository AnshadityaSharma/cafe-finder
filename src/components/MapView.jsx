import React, { useEffect, useRef } from 'react'
import { Navigation, Locate } from 'lucide-react'
import L from 'leaflet'
import DetailsModal from './DetailsModal'
import useMediaQuery from '../hooks/useMediaQuery'

// Fix default Leaflet icon paths (webpack/vite strips them)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function createDotIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};width:22px;height:22px;border-radius:50%;border:3px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,.35);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  })
}

const userDot = createDotIcon('#4285F4')
const placeDot = createDotIcon('#ff3366')

export default function MapView({
  center,
  onCenterChange,
  placeType,
  places = [],
  selectedPlace,
  setSelectedPlace,
  filters,
  mobileDrawerOpenToggle
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const userMarkerRef = useRef(null)
  const isMobile = useMediaQuery('(max-width: 899px)')

  // 1. Create map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapRef.current = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom: 14,
      zoomControl: false,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19
    }).addTo(mapRef.current)

    // Add zoom control to bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // 2. Pan map when center changes
  useEffect(() => {
    if (!mapRef.current || !center) return
    mapRef.current.flyTo([center.lat, center.lng], 15, { animate: true, duration: 1.2 })

    // Show/update user location dot
    if (center._userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([center.lat, center.lng])
      } else {
        userMarkerRef.current = L.marker([center.lat, center.lng], { icon: userDot, zIndexOffset: 1000 }).addTo(mapRef.current)
      }
    }
  }, [center])

  // 3. Update place markers when places array changes
  useEffect(() => {
    if (!mapRef.current) return

    // Clear old markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    places.forEach(place => {
      if (!place.lat || !place.lng) return
      const marker = L.marker([place.lat, place.lng], { icon: placeDot })
        .addTo(mapRef.current)
        .on('click', () => setSelectedPlace(place))
      markersRef.current.push(marker)
    })
  }, [places, setSelectedPlace])

  return (
    <div className="map-wrapper" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* top-left: locate me button */}
      <div className="map-floating-btn top-left glassmorphism">
        <button className="icon-button" title="Centre on my location" onClick={() => {
          if (!navigator.geolocation) return alert('Geolocation unavailable')
          navigator.geolocation.getCurrentPosition(p => {
            onCenterChange({ lat: p.coords.latitude, lng: p.coords.longitude, _userLocation: true })
          }, e => alert(e.message), { enableHighAccuracy: true })
        }}>
          <Locate size={20} color="#333" />
        </button>
      </div>

      {/* top-right: mobile list toggle */}
      {isMobile && (
        <div className="map-floating-btn top-right glassmorphism">
          <button className="icon-button" onClick={() => mobileDrawerOpenToggle && mobileDrawerOpenToggle()}>
            <Navigation size={20} color="#333" />
          </button>
        </div>
      )}

      {/* Details modal */}
      {selectedPlace && (
        <div className={`details-overlay ${isMobile ? 'mobile' : 'desktop'}`}>
          <DetailsModal
            place={selectedPlace}
            onClose={() => setSelectedPlace(null)}
            onDirections={() => {
              window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`, '_blank')
            }}
          />
        </div>
      )}
    </div>
  )
}
