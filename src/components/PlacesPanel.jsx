import React, {useState, useEffect, useRef} from 'react'
import PlaceCard from './PlaceCard'
import Controls from './Controls'
import { isGoogleLoaded } from '../utils/googleLoader'
import { DEFAULT_RADIUS, MAX_PLACES } from '../constants'

export default function PlacesPanel({ placeType, onSelect, filters, onFilterChange, center, onLocate, onCenterChange }) {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const debounceRef = useRef(null)

  useEffect(() => {
    let mounted = true
    async function fetchNearby() {
      setLoading(true); setError(null); setPlaces([])
      if (!isGoogleLoaded()) { setError('Maps library not loaded yet'); setLoading(false); return }
  try {
        const request = {
          // Required parameters for new API
          fields: [
            "displayName",
            "formattedAddress",
            "location",
            "rating",
            "userRatingCount",
            "photos",
            "id",
            "businessStatus"
          ],
          locationRestriction: {
            center: new window.google.maps.LatLng(center.lat, center.lng),
            radius: filters.radius || DEFAULT_RADIUS,
          },
          includedPrimaryTypes: [placeType],
          // Optional parameters
          maxResultCount: Math.max(1, Math.min(MAX_PLACES, 20)),
          // You can add more fields as needed, e.g. language, region
        }
        const { Place } = await window.google.maps.importLibrary('places');
        Place.searchNearby(request)
          .then(({ places }) => {
            if (!mounted) return;
            setLoading(false);
            const list = Array.isArray(places) ? places : [];
            const filtered = list.filter(r => filters.minRating ? (r.rating || 0) >= filters.minRating : true)
            setPlaces(filtered.slice(0, MAX_PLACES))
          })
          .catch(err => {
            if (!mounted) return;
            setLoading(false);
            setError('Places search failed: ' + (err && err.message ? err.message : String(err)))
          });
  } catch (e) { setError(e.message); setLoading(false) }
    }
    fetchNearby()
    return () => mounted = false
  }, [placeType, filters, center])

  return (
    <div>
      <form onSubmit={e => e.preventDefault()} style={{marginBottom:10}}>
        <div style={{display:'flex',gap:6, position:'relative'}}>
          <input
            value={query}
            onChange={e => {
              const v = e.target.value
              setQuery(v)
              setError(null)
              // debounce suggestions
              if (debounceRef.current) clearTimeout(debounceRef.current)
              debounceRef.current = setTimeout(async () => {
                if (!v) { setSuggestions([]); return }
                if (!isGoogleLoaded()) { setError('Maps library not loaded yet'); return }
                try {
                  const { Place } = await window.google.maps.importLibrary('places')
                  const res = await Place.searchByText({ text: v, fields: ['displayName','location'], maxResultCount: 5 })
                  const list = (res && res.places) || []
                  setSuggestions(list)
                } catch (err) { setError('Autocomplete failed: ' + (err && err.message ? err.message : String(err))) }
              }, 300)
            }}
            placeholder="Search a city or address"
            style={{flex:1,padding:8}}
          />
          <button className="btn" type="button" onClick={async () => {
            // select first suggestion or perform a direct search
            try {
              if (suggestions.length > 0) {
                const s = suggestions[0]
                const loc = s.location || s.geometry || null
                if (loc) {
                  const centerObj = loc.lat && loc.lng ? { lat: loc.lat, lng: loc.lng } : { lat: loc.lat(), lng: loc.lng() }
                  onCenterChange && onCenterChange(centerObj)
                  setSuggestions([])
                }
              }
            } catch (err) { setError('Search failed: ' + String(err)) }
          }}>Go</button>

          {suggestions.length > 0 && (
            <div style={{position:'absolute', top:40, left:0, right:0, background:'#fff', border:'1px solid #eee', zIndex:100, maxHeight:200, overflow:'auto'}}>
              {suggestions.map((s, idx) => (
                <div key={s.id || s.placeId || s.displayName || idx} style={{padding:8, borderBottom:'1px solid #fafafa', cursor:'pointer'}} onClick={() => {
                  const loc = s.location || s.geometry || null
                  if (loc) {
                    const centerObj = loc.lat && loc.lng ? { lat: loc.lat, lng: loc.lng } : { lat: loc.lat(), lng: loc.lng() }
                    onCenterChange && onCenterChange(centerObj)
                    setQuery(s.displayName || s.name || '')
                    setSuggestions([])
                  }
                }}>{s.displayName || s.name}</div>
              ))}
            </div>
          )}
        </div>
      </form>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h3 style={{margin:0}}>Explore</h3>
        <div className="small">{places.length} results</div>
      </div>

      <div style={{marginTop:10}}><Controls filters={filters} onChange={onFilterChange} onLocate={onLocate} /></div>

      <div style={{marginTop:12}}>
        {loading && <div className="small">Searching nearby…</div>}
        {error && <div style={{color:'crimson'}}>{String(error)}</div>}
        {!loading && places.length === 0 && !error && <div className="small">No results here. Try increasing the radius.</div>}
        <div style={{marginTop:10}}>
          {places.map((p, i) => {
            const key = p.id || p.place_id || p.placeId || p.displayName || p.name || i
            return <PlaceCard key={key} place={p} onClick={() => onSelect(p)} />
          })}
        </div>
      </div>
    </div>
  )
}
