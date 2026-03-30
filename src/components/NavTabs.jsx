import React from 'react'
import { Coffee, UtensilsCrossed, Landmark, Beer, BedDouble, TreePine } from 'lucide-react'

const tabs = [
  { key: 'cafes', label: 'Cafes', Icon: Coffee },
  { key: 'restaurants', label: 'Restaurants', Icon: UtensilsCrossed },
  { key: 'bars', label: 'Bars', Icon: Beer },
  { key: 'hotels', label: 'Hotels', Icon: BedDouble },
  { key: 'parks', label: 'Parks', Icon: TreePine },
  { key: 'tourist', label: 'Tourist', Icon: Landmark },
]

export default function NavTabs({ active, onChange }) {
  return (
    <div className="nav-tabs-bar">
      {tabs.map(({ key, label, Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`nav-tab ${active === key ? 'active' : ''}`}
        >
          <Icon size={15} />
          <span className="tab-label">{label}</span>
        </button>
      ))}
    </div>
  )
}
