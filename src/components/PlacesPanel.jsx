import React, {useState, useEffect, useRef} from 'react'
import PlaceCard from './PlaceCard'
import Controls from './Controls'
import { fetchNearbyPlaces, searchLocation, reverseGeocode } from '../utils/overpassHelpers'
import { DEFAULT_RADIUS } from '../constants'
import { Search, MapPin } from 'lucide-react'

export default function PlacesPanel({ placeType, onSelect, filters, onFilterChange, center, onLocate, onCenterChange, onCloseMobile, onPlacesLoad }) {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [retryCount, setRetryCount] = useState(0)
  const debounceRef = useRef(null)
  const fetchDebounceRef = useRef(null)
  const geocodeTimerRef = useRef(null)

  const centerLat = center?.lat
  const centerLng = center?.lng
  const radius = filters?.radius || DEFAULT_RADIUS
  const minRating = filters?.minRating || 0

  // ── Fetch nearby places (debounced) ────────────────────────────────────────
  useEffect(() => {
    if (fetchDebounceRef.current) clearTimeout(fetchDebounceRef.current)

    fetchDebounceRef.current = setTimeout(() => {
      let mounted = true

      async function fetchNearby() {
        if (!centerLat || !centerLng) return
        setLoading(true)
        setError(null)
        try {
          const list = await fetchNearbyPlaces(centerLat, centerLng, radius, placeType)
          if (!mounted) return
          const filtered = list.filter(r => minRating ? Number(r.rating) >= minRating : true)
          const finalPlaces = filtered.slice(0, 60)
          setPlaces(finalPlaces)
          if (onPlacesLoad) onPlacesLoad(finalPlaces)
          setError(null)
        } catch (e) {
          if (!mounted) return
          setError(e.message)
        } finally {
          if (mounted) setLoading(false)
        }
      }

      fetchNearby()
      return () => { mounted = false }
    }, 600)

    return () => { if (fetchDebounceRef.current) clearTimeout(fetchDebounceRef.current) }
  }, [placeType, centerLat, centerLng, radius, minRating, retryCount])

  // ── Reverse geocode addresses in the background ─────────────────────────────
  // Runs after places load; fills in "Address not available" one-by-one at 1/s
  useEffect(() => {
    if (places.length === 0) return

    // Clear any previous geocoding run
    if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current)

    // Only queue places that don't have an address yet
    const needsAddress = places
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => !p.formattedAddress || p.formattedAddress === 'Address not available')

    if (needsAddress.length === 0) return

    let idx = 0

    function geocodeNext() {
      if (idx >= needsAddress.length) return
      const { p, i } = needsAddress[idx++]

      reverseGeocode(p.lat, p.lng).then(addr => {
        if (!addr) return
        setPlaces(prev => {
          const next = [...prev]
          if (next[i] && next[i].id === p.id) {
            next[i] = { ...next[i], formattedAddress: addr }
          }
          return next
        })
      })

      // Space requests 1100ms apart to stay under Nominatim's 1 req/s limit
      geocodeTimerRef.current = setTimeout(geocodeNext, 1100)
    }

    // Start after a brief delay so main fetch isn't competing
    geocodeTimerRef.current = setTimeout(geocodeNext, 800)

    return () => { if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current) }
  }, [places.length, placeType]) // trigger when a fresh set of places arrives

  return (
    <div className="places-panel">
      <form onSubmit={e => e.preventDefault()} style={{marginBottom:16}}>
        <div style={{display:'flex', gap:6, position:'relative'}}>
          <div className="search-input-wrapper" style={{flex: 1, position: 'relative'}}>
            <Search size={18} style={{position: 'absolute', left: 12, top: 12, color: '#aaa', pointerEvents: 'none'}} />
            <input
              value={query}
              onChange={e => {
                const v = e.target.value
                setQuery(v)
                if (debounceRef.current) clearTimeout(debounceRef.current)
                debounceRef.current = setTimeout(async () => {
                  if (!v.trim()) { setSuggestions([]); return }
                  try {
                    const res = await searchLocation(v)
                    setSuggestions(res)
                  } catch { /* silently ignore */ }
                }, 400)
              }}
              placeholder="Search a city or address..."
              style={{width: '100%', padding:'10px 12px 10px 36px', borderRadius: 12, border: '1px solid #eef0f3', fontSize: 14, fontFamily: 'Inter', outline: 'none'}}
            />
          </div>
          <button className="btn btn-primary" type="button" onClick={() => {
            if (suggestions.length > 0) {
              const s = suggestions[0]
              onCenterChange && onCenterChange({ lat: s.lat, lng: s.lng })
              setSuggestions([])
            }
          }}>Go</button>

          {suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((s, idx) => (
                <div key={s.id || idx} className="suggestion-item" onClick={() => {
                  onCenterChange && onCenterChange({ lat: s.lat, lng: s.lng })
                  setQuery(s.displayName)
                  setSuggestions([])
                }}>
                  <MapPin size={15} style={{marginRight: 8, flexShrink: 0, color: '#999'}}/>
                  <span style={{flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{s.displayName}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12}}>
        <h3 style={{margin:0, fontFamily: 'Outfit', fontSize: 22, fontWeight: 700}}>Explore Nearby</h3>
        <div className="badge">{places.length} results</div>
      </div>

      <Controls filters={filters} onChange={onFilterChange} onLocate={onLocate} />

      <div style={{marginTop:20}}>
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Searching nearby places...</p>
          </div>
        )}
        {error && (
          <div className="error-state">
            <p>{String(error)}</p>
            <button
              className="btn btn-primary"
              style={{marginTop: 12, fontSize: 13, padding: '8px 20px'}}
              onClick={() => { setError(null); setRetryCount(c => c + 1); }}
            >
              Try Again
            </button>
          </div>
        )}
        {!loading && places.length === 0 && !error && (
          <div className="empty-state">No places found in this area. Try increasing the radius.</div>
        )}
        <div className="places-list">
          {places.map((p, i) => (
            <PlaceCard key={p.id || i} place={p} onClick={() => onSelect(p)} />
          ))}
        </div>
      </div>
    </div>
  )
}
