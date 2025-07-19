export function haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    inKilometers = true
  ): number {
    const toRadians = (deg: number) => (deg * Math.PI) / 180;
  
    const R = inKilometers ? 6371 : 6371000; // Radius of Earth in km or meters
    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lon2 - lon1);
  
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    const distance = R * c;
  
    return distance; // km or meters
  }
  