// Deterministic MVP dispatch engine. Replace the mock coordinates with a maps/ETA API
// when live driver GPS and traffic data are available.
const locations = {
  'd1': { lat: 19.0596, lng: 72.8295 },
  'd2': { lat: 19.0728, lng: 72.8352 },
  'r1': { lat: 19.0607, lng: 72.8362 },
  'r2': { lat: 19.0551, lng: 72.8244 },
  'r3': { lat: 19.0662, lng: 72.8271 },
  'r4': { lat: 19.0583, lng: 72.8312 },
  customer: { lat: 19.0624, lng: 72.8341 },
};

const toRadians = (value) => value * Math.PI / 180;
export function distanceKm(a, b) {
  if (!a || !b) return 2.5;
  const earthRadius = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function rankDrivers(order, drivers, orders) {
  const activeByDriver = orders.reduce((map, candidate) => {
    if (candidate.driver_id && candidate.status !== 'delivered') map[candidate.driver_id] = (map[candidate.driver_id] || 0) + 1;
    return map;
  }, {});
  const completedByDriver = orders.reduce((map, candidate) => {
    if (candidate.driver_id && candidate.status === 'delivered') map[candidate.driver_id] = (map[candidate.driver_id] || 0) + 1;
    return map;
  }, {});

  const activeDrivers = drivers.filter((driver) => driver.role === 'driver' && (driver.account_status || 'active') === 'active');
  const onlineDrivers = activeDrivers.filter((driver) => driver.status === 'online');
  const candidates = onlineDrivers.length > 0 ? onlineDrivers : activeDrivers;

  return candidates.map((driver) => {
    const activeOrders = activeByDriver[driver.id] || 0;
    const pickupKm = distanceKm(locations[driver.id], locations[order.restaurant_id]);
    const deliveryKm = distanceKm(locations[order.restaurant_id], locations.customer);
    const etaMinutes = Math.round((pickupKm + deliveryKm) / 25 * 60) + activeOrders * 12;
    const fairnessBonus = Math.min(completedByDriver[driver.id] || 0, 10) * .25;
    return { driver, pickupKm: Number(pickupKm.toFixed(1)), deliveryKm: Number(deliveryKm.toFixed(1)), etaMinutes, score: etaMinutes - fairnessBonus, activeOrders };
  }).sort((a, b) => a.score - b.score);
}

export function chooseBestDriver(order, drivers, orders) { return rankDrivers(order, drivers, orders)[0] || null; }
