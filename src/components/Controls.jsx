import React from 'react'
import { MapPin, Navigation } from 'lucide-react'

export default function Controls({ filters, onChange, onLocate }) {
  return (
    <div className="controls-card glass-panel" style={{marginBottom: 16}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center', marginBottom: 12}}>
        <div>
          <div style={{fontWeight:600, fontSize: 13, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Search Radius</div>
          <div style={{fontFamily: 'Outfit', fontSize: 18, fontWeight: 700, color: '#ff3366'}}>
            {filters.radius >= 1000 ? `${(filters.radius / 1000).toFixed(1).replace(/\.0$/, '')} km` : `${filters.radius} m`}
          </div>
        </div>
        <button onClick={onLocate} className="icon-button" style={{color: '#ff3366'}}>
          <Navigation size={18} />
        </button>
      </div>

      <input className="range" type="range" min="500" max="10000" step="500" value={filters.radius} 
        onChange={e => onChange({...filters, radius: Number(e.target.value)})} />

      <div style={{display:'flex', gap:16, marginTop:16, alignItems:'center', flexWrap: 'wrap'}}>
        <label style={{display:'flex', gap:8, alignItems:'center', fontSize: 14, fontWeight: 500, cursor: 'pointer'}}>
          <input type="checkbox" checked={filters.openNow} onChange={e => onChange({...filters, openNow: e.target.checked})} 
            style={{width: 16, height: 16, accentColor: '#ff3366'}} /> 
          Open now
        </label>
        <label style={{display:'flex', gap:8, alignItems:'center', fontSize: 14, fontWeight: 500, cursor: 'pointer'}}>
          <span>Min rating</span>
          <select value={filters.minRating} onChange={e => onChange({...filters, minRating:Number(e.target.value)})} 
            style={{padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', outline: 'none', cursor: 'pointer', fontFamily: 'Inter'}}>
            <option value={0}>Any</option>
            <option value={3.0}>3.0+</option>
            <option value={4.0}>4.0+</option>
            <option value={4.5}>4.5+</option>
          </select>
        </label>
      </div>
    </div>
  )
}
