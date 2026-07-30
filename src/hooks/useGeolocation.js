import { useEffect, useState } from 'react';

export function useGeolocation(active = false) {
  const [position, setPosition] = useState({ lat: 19.0596, lng: 72.8295, mocked: true });
  useEffect(() => {
    if (!active || !navigator.geolocation) return undefined;
    const watch = navigator.geolocation.watchPosition(({ coords }) => setPosition({ lat: coords.latitude, lng: coords.longitude, mocked: false }), () => undefined, { enableHighAccuracy: true });
    return () => navigator.geolocation.clearWatch(watch);
  }, [active]);
  return position;
}
