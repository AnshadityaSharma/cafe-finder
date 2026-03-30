import React from 'react'
import { Star } from 'lucide-react'

export default function PlaceCard({ place, onClick }) {
  const address = place.formattedAddress || 'Address not available'
  const rating = place.rating || 'N/A'
  const reviews = place.userRatingCount || 0
  const letter = place.displayName ? place.displayName.charAt(0).toUpperCase() : '?'

  return (
    <div className="place-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="thumb">
        <span style={{color: 'var(--primary)', fontWeight: 800, fontFamily: 'Outfit', fontSize: 22}}>{letter}</span>
      </div>
      <div className="meta">
        <div className="name">{place.displayName || place.name}</div>
        <div className="rating-row">
          <Star size={12} fill="#FFB800" color="#FFB800" />
          <span style={{fontWeight: 600, color: 'var(--text-main)'}}>{rating}</span>
          <span>({reviews} reviews)</span>
        </div>
        <div className="sub">{address}</div>
      </div>
    </div>
  )
}
