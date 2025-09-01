// src/components/MapView.jsx
import React, { useEffect, useRef, useState } from 'react'
import locationIcon from '../assets/icons/location.svg'
import menuIcon from '../assets/icons/menu.svg'
import DetailsModal from './DetailsModal'
import useMediaQuery from '../hooks/useMediaQuery'
import { getPlaceDetails } from '../utils/placesHelpers'

/*
  MapView responsibilities:
  - create map once (using window.google.maps.Map)
  - run nearbySearch -> add markers
  - when a marker is clicked -> setSelectedPlace(nearbyPlace)
  - when selectedPlace has place_id -> fetch details (getPlaceDetails) and replace selectedPlace with details
  - handle requestDirections (calls DirectionsService, renders via DirectionsRenderer)
*/

export default function MapView({
  center,
  onCenterChange,
  placeType,
  selectedPlace,
  setSelectedPlace,
  filters,
  mobileDrawerOpenToggle
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([]) // array of google.maps.Marker
  const directionsRendererRef = useRef(null)
  const userMarkerRef = useRef(null)
  const userAccuracyRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)
  const [geoDebug, setGeoDebug] = useState(null)
  const isMobile = useMediaQuery('(max-width: 899px)')

  // create map when google is loaded and container exists
  useEffect(() => {
    if (!containerRef.current) return
    if (!window.google || !window.google.maps) return

    if (!mapRef.current) {
      mapRef.current = new window.google.maps.Map(containerRef.current, {
        center,
        zoom: 14,
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false,
        gestureHandling: 'greedy'
      })
      setMapReady(true)
    }
  }, [containerRef])

  // Add or update user location marker
  function showUserLocationMarker(pos) {
    setGeoDebug({
      lat: pos.lat || pos.latitude || (typeof pos.lat === 'function' ? pos.lat() : undefined),
      lng: pos.lng || pos.longitude || (typeof pos.lng === 'function' ? pos.lng() : undefined),
      accuracy: pos.accuracy || (pos.coords && pos.coords.accuracy) || undefined,
      timestamp: Date.now()
    })
    if (!window.google || !window.google.maps || !mapRef.current) return
    const position = { lat: pos.lat || pos.latitude || pos.lat(), lng: pos.lng || pos.longitude || pos.lng() }
    const accuracy = pos.accuracy || pos.coords?.accuracy || 0
    if (!window.google.maps.marker?.AdvancedMarkerElement) return;
    if (userMarkerRef.current) {
      userMarkerRef.current.position = position;
      userMarkerRef.current.map = mapRef.current;
    } else {
      userMarkerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position,
        title: 'Your Location',
        content: (() => {
          const el = document.createElement('div');
          el.style.width = '20px';
          el.style.height = '20px';
          el.style.background = '#4285F4';
          el.style.border = '3px solid #fff';
          el.style.borderRadius = '50%';
          el.style.boxShadow = '0 2px 8px rgba(66,133,244,0.2)';
          return el;
        })()
      });
    }

    // draw accuracy circle
    if (userAccuracyRef.current) {
      userAccuracyRef.current.setCenter(position)
      userAccuracyRef.current.setRadius(accuracy)
      userAccuracyRef.current.setMap(mapRef.current)
    } else {
      userAccuracyRef.current = new window.google.maps.Circle({
        strokeColor: '#4285F4',
        strokeOpacity: 0.25,
        strokeWeight: 1,
        fillColor: '#4285F4',
        fillOpacity: 0.08,
        map: mapRef.current,
        center: position,
        radius: accuracy
      })
    }
  }

  // keep map center in sync when prop changes
  useEffect(() => {
    if (!mapRef.current || !center) return
    try {
      mapRef.current.panTo(center)
      // If center is user's location, show marker
      if (center && center._userLocation) {
        showUserLocationMarker(center)
      } else if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null)
      }
    } catch (e) { /* ignore */ }
    }, [center])

  // nearby search and markers (new Place API)
  useEffect(() => {
    if (!mapRef.current) return
    if (!window.google || !window.google.maps) return

    // clear existing markers
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    let mounted = true
    ;(async () => {
      try {
        const { Place } = await window.google.maps.importLibrary('places')
        const req = {
          fields: ['displayName', 'location', 'rating', 'photos', 'id'],
          locationRestriction: {
            center: new window.google.maps.LatLng(center.lat, center.lng),
            radius: filters?.radius || 1500
          },
          includedPrimaryTypes: [placeType],
          maxResultCount: Math.max(1, Math.min(20, 20))
        }

        const { places } = await Place.searchNearby(req)
        if (!mounted || !Array.isArray(places)) return
        const filtered = places.filter(r => (filters?.minRating ? (r.rating || 0) >= filters.minRating : true))
        const toShow = filtered.slice(0, 60)
        toShow.forEach(place => {
          const pos = place.location || (place.geometry && place.geometry.location)
          if (!pos) return
          if (!window.google.maps.marker?.AdvancedMarkerElement) return;
          const marker = new window.google.maps.marker.AdvancedMarkerElement({
            map: mapRef.current,
            position: pos,
            title: place.displayName || place.name,
            content: (() => {
              const el = document.createElement('div');
              el.style.width = '20px';
              el.style.height = '20px';
              el.style.background = '#ff6b92';
              el.style.border = '2px solid #fff';
              el.style.borderRadius = '50%';
              el.style.boxShadow = '0 2px 8px rgba(255,107,146,0.2)';
              return el;
            })()
          });
          marker.addListener('click', () => setSelectedPlace(place));
          markersRef.current.push(marker);
        })
      } catch (e) {
        console.warn('Nearby search failed:', e)
      }
    })()

    return () => { mounted = false }
  }, [center, placeType, filters, setSelectedPlace])

  // when selectedPlace has id (from nearbySearch), fetch full details and replace it
  useEffect(() => {
    if (!selectedPlace || !selectedPlace.id) return
    if (!mapRef.current) return

    let canceled = false
    const fields = [
      'displayName','rating','formattedPhoneNumber','formattedAddress',
      'regularOpeningHours','photos','reviews','location','website','url','userRatingCount'
    ]

    getPlaceDetails(selectedPlace.id, fields)
      .then(details => {
        if (canceled) return
        // Patch reviews/photos for DetailsModal compatibility
        const patched = {
          ...details,
          name: details.displayName || details.name,
          formatted_address: details.formattedAddress || details.formatted_address,
          user_ratings_total: details.userRatingCount || details.user_ratings_total,
          reviews: details.reviews || details.reviews || [],
          photos: details.photos || details.photos || []
        }
        setSelectedPlace(patched)
        const loc = details.location || (details.geometry && details.geometry.location)
        if (loc) {
          try {
            if (loc.lat && loc.lng) mapRef.current.panTo(loc)
            else mapRef.current.panTo({ lat: loc.lat(), lng: loc.lng() })
            if (!isMobile) mapRef.current.setZoom(15)
          } catch (e) { /* ignore pan errors */ }
        }
      })
      .catch(err => console.warn('Place details failed:', err))

    return () => { canceled = true }
  }, [selectedPlace?.id, setSelectedPlace, isMobile])

  // Request directions and render them via DirectionsRenderer
  function requestDirections(destinationLatLng) {
    if (!mapRef.current) return alert('Map not ready.')
    if (!navigator.geolocation) return alert('Geolocation not available.')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const origin = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        // pass accuracy so the accuracy circle can be drawn
        showUserLocationMarker({ ...origin, _userLocation: true, accuracy: pos.coords.accuracy })
        const ds = new window.google.maps.DirectionsService()
        ds.route(
          { origin, destination: destinationLatLng, travelMode: window.google.maps.TravelMode.WALKING },
          (result, status) => {
            if (status === 'OK' && result) {
              // create renderer if missing
              if (!directionsRendererRef.current) {
                directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
                  suppressMarkers: false,
                  preserveViewport: false
                })
              }
              directionsRendererRef.current.setMap(mapRef.current)
              directionsRendererRef.current.setDirections(result)

              // fit to route
              try {
                const route = result.routes && result.routes[0]
                if (route && route.overview_path) {
                  const bounds = new window.google.maps.LatLngBounds()
                  route.overview_path.forEach(p => bounds.extend(p))
                  mapRef.current.fitBounds(bounds)
                }
              } catch (e) {
                console.warn('Could not fit bounds for route', e)
              }
            } else {
              alert('Directions failed: ' + status)
            }
          }
        )
      },
      (err) => alert('Could not access your location: ' + err.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    )
  }

  // cleanup on unmount
  useEffect(() => {
    return () => {
      // remove markers
      markersRef.current.forEach(m => m.setMap(null))
      markersRef.current = []
      // remove directions renderer
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null)
        directionsRendererRef.current = null
      }
      // remove user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null)
        userMarkerRef.current = null
      }
      // optional: null map
      if (mapRef.current) {
        mapRef.current = null
      }
    }
  }, [])

  // Always render the map container; overlay loading message if not ready
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {/* Debug overlay for geolocation */}
      {geoDebug && (
        <div style={{
          position: 'absolute', bottom: 12, left: 12, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '8px 14px', borderRadius: 8, fontSize: 13
        }}>
          <div><b>Geolocation Debug</b></div>
          <div>Lat: {geoDebug.lat}</div>
          <div>Lng: {geoDebug.lng}</div>
          <div>Accuracy: {geoDebug.accuracy} m</div>
          <div style={{fontSize:11,opacity:0.7}}>Timestamp: {new Date(geoDebug.timestamp).toLocaleTimeString()}</div>
        </div>
      )}
      {!mapReady && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.7)', zIndex: 10
        }}>
          Loading map…
        </div>
      )}

      {/* top-left: center button */}
      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 60 }}>
        <button className="map-button" title="Center to my location" onClick={()=>{
          if (!navigator.geolocation) return alert('Geolocation unavailable')
          navigator.geolocation.getCurrentPosition(p => {
            const posObj = { lat: p.coords.latitude, lng: p.coords.longitude, _userLocation: true, accuracy: p.coords.accuracy }
            onCenterChange(posObj)
            if (mapRef.current) {
              mapRef.current.panTo(posObj)
              showUserLocationMarker(posObj)
            }
          }, e => alert(e.message), { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 })
        }}>
          <img src={locationIcon} alt="Locate" style={{ width: 22, height: 22, display: 'block' }} />
        </button>
      </div>

      {/* top-right: open list on mobile */}
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 60 }}>
        <button className="map-button" onClick={() => mobileDrawerOpenToggle && mobileDrawerOpenToggle()} style={{ display: isMobile ? 'inline-block' : 'none' }}>
          <img src={menuIcon} alt="Menu" style={{ width: 22, height: 22, display: 'block' }} />
        </button>
      </div>

      {/* details modal — MapView owns it here and supplies onDirections handler */}
      {selectedPlace && (
        isMobile
          ? <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 70 }}>
              <DetailsModal
                place={selectedPlace}
                onClose={() => setSelectedPlace(null)}
                onDirections={() => {
                  // Try all possible geometry/location fields
                  const dest = selectedPlace.location || (selectedPlace.geometry && selectedPlace.geometry.location)
                  if (dest && (dest.lat || (typeof dest.lat === 'function'))) {
                    // If lat/lng are functions, call them
                    const lat = typeof dest.lat === 'function' ? dest.lat() : dest.lat
                    const lng = typeof dest.lng === 'function' ? dest.lng() : dest.lng
                    requestDirections({ lat, lng })
                  } else {
                    alert('No geometry available.')
                  }
                }}
              />
            </div>
          : <div style={{ position: 'absolute', right: 18, bottom: 18, zIndex: 70 }}>
              <DetailsModal
                place={selectedPlace}
                onClose={() => setSelectedPlace(null)}
                onDirections={() => {
                  const dest = selectedPlace.location || (selectedPlace.geometry && selectedPlace.geometry.location)
                  if (dest && (dest.lat || (typeof dest.lat === 'function'))) {
                    const lat = typeof dest.lat === 'function' ? dest.lat() : dest.lat
                    const lng = typeof dest.lng === 'function' ? dest.lng() : dest.lng
                    requestDirections({ lat, lng })
                  } else {
                    alert('No geometry available.')
                  }
                }}
              />
            </div>
      )}
    </div>
  )
}
