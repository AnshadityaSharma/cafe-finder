import React from 'react'

export default function useMediaQuery(query) {
  const [matches, setMatches] = React.useState(false)
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)
    setMatches(mq.matches)
    if (mq.addEventListener) mq.addEventListener('change', handler)
    else mq.addListener(handler)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler)
      else mq.removeListener(handler)
    }
  }, [query])
  return matches
}
