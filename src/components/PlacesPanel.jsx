import React, {useState, useEffect, useRef, useCallback} from 'react'
import PlaceCard from './PlaceCard'
import Controls from './Controls'
import { fetchNearbyPlaces, searchLocation } from '../utils/overpassHelpers'
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

  // Memoize the values we actually care about to avoid spurious re-fetches
  const centerLat = center?.lat
  const centerLng = center?.lng
  const radius = filters?.radius || DEFAULT_RADIUS
  const minRating = filters?.minRating || 0

  useEffect(() => {
    // Debounce the actual fetch by 600ms so rapid center changes
    // (like multiple "my location" clicks) don't spam the API
    if (fetchDebounceRef.current) clearTimeout(fetchDebounceRef.current)
    
    fetchDebounceRef.current = setTimeout(() => {
      let mounted = true

      async function fetchNearby() {
        if (!centerLat || !centerLng) return
        setLoading(true)
        setError(null)
        // DON'T clear places here — keep showing old results until new ones arrive
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
          // Keep existing places visible even if the new fetch failed
        } finally {
          if (mounted) setLoading(false)
        }
      }

      fetchNearby()

      return () => { mounted = false }
    }, 600)

    return () => {
      if (fetchDebounceRef.current) clearTimeout(fetchDebounceRef.current)
    }
  }, [placeType, centerLat, centerLng, radius, minRating, retryCount])

  return (
    <div className="places-panel">
      <form onSubmit={e => e.preventDefault()} style={{marginBottom:16}}>
        <div style={{display:'flex', gap:6, position:'relative'}}>
          <div className="search-input-wrapper" style={{flex: 1, position: 'relative'}}>
            <Search size={18} className="search-icon" style={{position: 'absolute', left: 12, top: 12, color: '#888'}} />
            <input
              value={query}
              onChange={e => {
                const v = e.target.value
                setQuery(v)
                setError(null)
                if (debounceRef.current) clearTimeout(debounceRef.current)
                debounceRef.current = setTimeout(async () => {
                  if (!v) { setSuggestions([]); return }
                  try {
                    const res = await searchLocation(v)
                    setSuggestions(res)
                  } catch (err) { /* silently ignore autocomplete errors */ }
                }, 400)
              }}
              placeholder="Search a city or address..."
              style={{width: '100%', padding:'10px 12px 10px 36px', borderRadius: 12, border: '1px solid #eef0f3', fontSize: 14, fontFamily: 'Inter'}}
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
                  <MapPin size={16} style={{marginRight: 8, color: '#666'}}/>
                  <span style={{flex:1}}>{s.displayName}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
      
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center', marginBottom: 12}}>
        <h3 style={{margin:0, fontFamily: 'Outfit', fontSize: 22, fontWeight: 700}}>Explore Nearby</h3>
        <div className="badge">{places.length} results</div>
      </div>

      <Controls filters={filters} onChange={onFilterChange} onLocate={onLocate} />

      <div style={{marginTop:20}}>
        {loading && <div className="loading-state">
          <div className="spinner"></div>
          <p>Searching nearby places...</p>
        </div>}
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
        {!loading && places.length === 0 && !error && <div className="empty-state">No places found in this area. Try increasing the radius.</div>}
        <div className="places-list">
          {places.map((p, i) => {
            const key = p.id || i
            return <PlaceCard key={key} place={p} onClick={() => onSelect(p)} />
          })}
        </div>
      </div>
    </div>
  )
}
