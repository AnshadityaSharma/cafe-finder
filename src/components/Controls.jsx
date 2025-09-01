import React from 'react'

export default function Controls({ filters, onChange, onLocate }) {
  return (
    <div className="card controls" style={{padding:12}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontWeight:700}}>Search radius</div>
          <div className="small">{filters.radius} meters</div>
        </div>
        <button onClick={onLocate} className="map-button" style={{background:'#fff'}}>Locate me</button>
      </div>

      <input className="range" type="range" min="250" max="5000" step="250" value={filters.radius} 
        onChange={e => onChange({...filters, radius: Number(e.target.value)})} style={{marginTop:10}} />

      <div style={{display:'flex',gap:12,marginTop:10,alignItems:'center'}}>
        <label style={{display:'flex',gap:6,alignItems:'center'}}><input type="checkbox" checked={filters.openNow} onChange={e => onChange({...filters, openNow: e.target.checked})} /> Open now</label>
        <label style={{display:'flex',gap:6,alignItems:'center'}}>Min rating
          <select value={filters.minRating} onChange={e => onChange({...filters, minRating:Number(e.target.value)})} style={{marginLeft:8}}>
            <option value={0}>Any</option>
            <option value={3}>3+</option>
            <option value={4}>4+</option>
          </select>
        </label>
      </div>
    </div>
  )
}
