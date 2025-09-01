import React from 'react'
import { getPhotoUrl } from '../utils/placesHelpers'

export default function PlaceCard({ place, onClick }) {
  const address = place.formattedAddress || place.vicinity || place.formatted_address || ''
  const rating = place.rating ? Number(place.rating).toFixed(1) : 'N/A'
  const reviews = place.userRatingCount || place.user_ratings_total || 0
  const photo = (place.photos && place.photos[0]) ? getPhotoUrl(place.photos[0], 400) : null

  return (
    <div className="place-card" onClick={onClick} role="button">
      <div className="thumb">
        {photo ? (
          <img src={photo} alt={place.displayName || place.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
        ) : <div>☕</div>}
      </div>
      <div className="meta">
        <div className="name">{place.displayName || place.name}</div>
        <div className="sub">{address}</div>
        <div className="small">{rating} ★ • {reviews} reviews</div>
      </div>
    </div>
  )
}
