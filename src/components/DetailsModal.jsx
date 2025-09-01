import React from 'react'
import closeIcon from '../assets/icons/close.svg'
import directionsIcon from '../assets/icons/directions.svg'
import { motion } from 'framer-motion'
import { getPhotoUrl } from '../utils/placesHelpers'
import useMediaQuery from '../hooks/useMediaQuery'

export default function DetailsModal({ place, onClose, onDirections }) {
  if (!place) return null
  const photos = place.photos || []
  const reviews = place.reviews || []
  const isMobile = useMediaQuery('(max-width: 899px)')

  const content = (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div>
          <div style={{fontWeight:800}}>{place.name}</div>
          <div className="small">{place.formatted_address || place.vicinity}</div>
          <div className="small" style={{marginTop:6}}>Rating: {place.rating || 'N/A'} ({place.user_ratings_total || 0})</div>
        </div>
        <div style={{marginLeft:12}}>
          <button onClick={onClose} style={{border:'none',background:'transparent',padding:2,cursor:'pointer'}} title="Close">
            <img src={closeIcon} alt="Close" style={{width:22,height:22,display:'block',opacity:0.8,transition:'opacity 0.15s'}} onMouseOver={e=>e.currentTarget.style.opacity=1} onMouseOut={e=>e.currentTarget.style.opacity=0.8} />
          </button>
        </div>
      </div>

      <div className="photos-row" style={{marginTop:12}}>
        {photos.length === 0 && <div className="small">No photos</div>}
        {photos.slice(0,6).map((p,i) => {
          const url = getPhotoUrl(p, 400)
          return url ? <img key={i} src={url} alt={`p-${i}`} /> : null
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="btn" style={{display:'flex',alignItems:'center',gap:6}} onClick={() => onDirections && onDirections()}>
          <img src={directionsIcon} alt="Directions" style={{width:18,height:18,display:'inline'}} />
          Directions
        </button>
        {place.website && (
          <a
            className="btn"
            style={{ background: '#fff', color: '#ff6b92', border: '1px solid #eee' }}
            href={place.website}
            target="_blank"
            rel="noreferrer"
          >
            Website
          </a>
        )}
      </div>


      <div style={{marginTop:12}}>
        <div style={{fontWeight:700}}>Top reviews</div>
        <div style={{marginTop:8}}>
          {reviews.length === 0 && <div className="small">No reviews available.</div>}
          {reviews.slice(0,3).map((r,i) => (
            <div key={i} style={{background:'#fafafa',padding:8,borderRadius:8,marginBottom:8}}>
              <div style={{fontWeight:700}}>{r.author_name} • {r.rating} ★</div>
              <div style={{fontSize:13,marginTop:6}}>{r.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <motion.div initial={{y:300}} animate={{y:0}} exit={{y:300}} className="details-sheet">
        {content}
      </motion.div>
    )
  }
  return (
    <motion.div initial={{y:40,opacity:0}} animate={{y:0,opacity:1}} className="details-desktop">
      {content}
    </motion.div>
  )
}
