import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Navigation, Globe, Star, Users } from 'lucide-react'
import useMediaQuery from '../hooks/useMediaQuery'

export default function DetailsModal({ place, onClose, onDirections }) {
  if (!place) return null
  const isMobile = useMediaQuery('(max-width: 899px)')
  
  // Since we're using Overpass API, photos and reviews aren't natively supported. 
  // We can show placeholder or omit them. Overpass only returns basic tags.
  const tags = place.tags || {}
  const phone = tags.phone || tags['contact:phone']
  const website = tags.website || tags['contact:website']
  const openingHours = tags.opening_hours

  const content = (
    <div className="details-content">
      <div className="details-header">
        <div>
          <h2 className="details-title">{place.displayName || place.name}</h2>
          <p className="details-address">{place.formattedAddress}</p>
          <div className="details-rating">
            <Star size={14} fill="#FFB800" color="#FFB800" />
            <span style={{fontWeight: 600}}>{place.rating}</span>
            <span className="small-text">({place.userRatingCount} reviews)</span>
          </div>
        </div>
        <button onClick={onClose} className="icon-button close-btn" title="Close">
          <X size={20} />
        </button>
      </div>

      <div className="details-actions">
        <button className="btn btn-primary" onClick={() => onDirections && onDirections()}>
          <Navigation size={16} />
          Directions
        </button>
        {website && (
          <a className="btn btn-outline" href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noreferrer">
            <Globe size={16} />
            Website
          </a>
        )}
      </div>

      <div className="details-info-section">
        {openingHours && (
          <div className="info-row">
            <strong>Hours:</strong> <span>{openingHours}</span>
          </div>
        )}
        {phone && (
          <div className="info-row">
            <strong>Phone:</strong> <span>{phone}</span>
          </div>
        )}
        {tags['cuisine'] && (
          <div className="info-row">
            <strong>Cuisine:</strong> <span style={{textTransform: 'capitalize'}}>{tags['cuisine'].replace(/;/g, ', ')}</span>
          </div>
        )}
        {tags['wheelchair'] && (
          <div className="info-row">
            <strong>Wheelchair accessible:</strong> <span>{tags['wheelchair']}</span>
          </div>
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <AnimatePresence>
        <motion.div initial={{y:300, opacity:0}} animate={{y:0, opacity:1}} exit={{y:300, opacity:0}} transition={{type:'spring', damping: 25, stiffness: 200}} className="details-sheet glass-panel">
          {content}
        </motion.div>
      </AnimatePresence>
    )
  }
  return (
    <AnimatePresence>
      <motion.div initial={{y:40, opacity:0, scale:0.95}} animate={{y:0, opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} transition={{type:'spring', damping: 25, stiffness: 200}} className="details-desktop glassmorphism">
        {content}
      </motion.div>
    </AnimatePresence>
  )
}
