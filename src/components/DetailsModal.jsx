import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Navigation, Globe, Star, Clock, Phone } from 'lucide-react'
import { reverseGeocode } from '../utils/overpassHelpers'
import useMediaQuery from '../hooks/useMediaQuery'

export default function DetailsModal({ place, onClose, onDirections }) {
  if (!place) return null
  const isMobile = useMediaQuery('(max-width: 899px)')
  const [resolvedAddress, setResolvedAddress] = useState(
    place.formattedAddress !== 'Address not available' ? place.formattedAddress : null
  )

  // If still showing "Address not available", reverse geocode from coordinates
  useEffect(() => {
    if (resolvedAddress) return
    if (!place.lat || !place.lng) return
    reverseGeocode(place.lat, place.lng).then(addr => {
      if (addr) setResolvedAddress(addr)
    })
  }, [place.id])

  const tags = place.tags || {}
  const phone = tags.phone || tags['contact:phone'] || tags['contact:mobile']
  const website = tags.website || tags['contact:website'] || tags['url']
  const openingHours = tags.opening_hours
  const cuisine = tags.cuisine?.replace(/;/g, ', ')

  const displayAddress = resolvedAddress || 'Locating address...'

  const content = (
    <div className="details-content">
      <div className="details-header">
        <div style={{flex:1, minWidth:0}}>
          <h2 className="details-title">{place.displayName || place.name}</h2>
          <p className="details-address">{displayAddress}</p>
          <div className="details-rating">
            <Star size={14} fill="#FFB800" color="#FFB800" />
            <span style={{fontWeight: 600}}>{place.rating}</span>
            <span className="small-text">({place.userRatingCount} reviews)</span>
          </div>
        </div>
        <button onClick={onClose} className="icon-button" title="Close" style={{flexShrink:0, marginLeft:8}}>
          <X size={18} />
        </button>
      </div>

      <div className="details-actions">
        <button className="btn btn-primary" onClick={() => onDirections && onDirections()}>
          <Navigation size={15} />
          Directions
        </button>
        {website && (
          <a
            className="btn btn-outline"
            href={website.startsWith('http') ? website : `https://${website}`}
            target="_blank"
            rel="noreferrer"
          >
            <Globe size={15} />
            Website
          </a>
        )}
      </div>

      {(openingHours || phone || cuisine) && (
        <div className="details-info-section">
          {openingHours && (
            <div className="info-row">
              <Clock size={14} style={{marginRight:8, flexShrink:0, color:'#888'}} />
              <span>{openingHours}</span>
            </div>
          )}
          {phone && (
            <div className="info-row">
              <Phone size={14} style={{marginRight:8, flexShrink:0, color:'#888'}} />
              <span>{phone}</span>
            </div>
          )}
          {cuisine && (
            <div className="info-row">
              <span style={{marginRight:8, color:'#888', fontSize:13}}>Cuisine</span>
              <span style={{textTransform:'capitalize'}}>{cuisine}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{y: 300, opacity: 0}}
          animate={{y: 0, opacity: 1}}
          exit={{y: 300, opacity: 0}}
          transition={{type: 'spring', damping: 28, stiffness: 220}}
          className="details-sheet glass-panel"
        >
          {content}
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{y: 30, opacity: 0, scale: 0.97}}
        animate={{y: 0, opacity: 1, scale: 1}}
        exit={{opacity: 0, scale: 0.97}}
        transition={{type: 'spring', damping: 28, stiffness: 220}}
        className="details-desktop glassmorphism"
      >
        {content}
      </motion.div>
    </AnimatePresence>
  )
}
