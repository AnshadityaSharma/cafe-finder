import React from 'react'

export default function NavTabs({ active, onChange }) {
  return (
    <div style={{display:'flex',gap:8,alignItems:'center'}}>
      <button onClick={() => onChange('cafes')} style={tabStyle(active==='cafes')}>☕ Cafes</button>
      <button onClick={() => onChange('tourist')} style={tabStyle(active==='tourist')}>📍 Tourist</button>
      <button onClick={() => onChange('restaurants')} style={tabStyle(active==='restaurants')}>🍽 Restaurants</button>
    </div>
  )
}

function tabStyle(isActive) {
  return {
    padding:'8px 12px',
    borderRadius:12,
    background: isActive ? 'rgba(255,255,255,0.95)' : 'transparent',
    color: isActive ? '#ff6b92' : 'white',
    border: 'none',
    fontWeight:700,
    cursor:'pointer'
  }
}
