import React from 'react'
import { Navigation } from 'lucide-react'

export default function Controls({ filters, onChange, onLocate }) {
  return (
    <div className="controls-card" style={{marginBottom: 16}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center', marginBottom: 12}}>
        <div>
          <div style={{fontWeight:600, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Search Radius</div>
          <div style={{fontFamily: 'Outfit', fontSize: 18, fontWeight: 700, color: 'var(--primary)'}}>
            {filters.radius >= 1000 ? `${(filters.radius / 1000).toFixed(1).replace(/\.0$/, '')} km` : `${filters.radius} m`}
          </div>
        </div>
        <button onClick={onLocate} className="icon-button" style={{color: 'var(--primary)'}}>
          <Navigation size={18} />
        </button>
      </div>

      <input className="range" type="range" min="500" max="10000" step="500" value={filters.radius} 
        onChange={e => onChange({...filters, radius: Number(e.target.value)})} />

      <div style={{display:'flex', gap:16, marginTop:16, alignItems:'center', flexWrap: 'wrap'}}>
        <label style={{display:'flex', gap:8, alignItems:'center', fontSize: 14, fontWeight: 500, cursor: 'pointer', color: 'var(--text-main)'}}>
          <input type="checkbox" className="filter-checkbox" checked={filters.openNow} onChange={e => onChange({...filters, openNow: e.target.checked})} /> 
          Open now
        </label>
        <label style={{display:'flex', gap:8, alignItems:'center', fontSize: 14, fontWeight: 500, cursor: 'pointer', color: 'var(--text-main)'}}>
          <span>Min rating</span>
          <select className="filter-select" value={filters.minRating} onChange={e => onChange({...filters, minRating:Number(e.target.value)})}>
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
