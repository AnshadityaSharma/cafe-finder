export function isGoogleLoaded() {
  return typeof window !== 'undefined' && !!window.google && !!window.google.maps
}
