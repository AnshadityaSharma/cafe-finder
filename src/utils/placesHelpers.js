// WARNING: As of March 1st, 2025, google.maps.places.PlacesService is deprecated for new customers.
// See: https://developers.google.com/maps/documentation/javascript/places-migration-overview
// Begin planning migration to google.maps.places.Place API.
// small cache for place details to reduce calls
const detailsCache = new Map()

export function getPhotoUrl(photo, maxWidth = 800) {
  try {
  // New Photo API exposes getURI or getURI({maxWidth,maxHeight}) in Place class
  if (typeof photo.getURI === 'function') return photo.getURI({ maxWidth })
  if (typeof photo.getURI === 'undefined' && typeof photo.getUrl === 'function') return photo.getUrl({ maxWidth })
  if (typeof photo.getUrl === 'function') return photo.getUrl({ maxWidth })
  } catch (e) {
    return null
  }
}

export async function getPlaceDetails(placeId, fields = []) {
  if (detailsCache.has(placeId)) return detailsCache.get(placeId)

  try {
    const { Place } = await window.google.maps.importLibrary('places');
    const place = new Place({ id: placeId });
    const res = await place.fetchFields({ fields });
    detailsCache.set(placeId, res);
    return res;
  } catch (e) {
    throw e;
  }
}
