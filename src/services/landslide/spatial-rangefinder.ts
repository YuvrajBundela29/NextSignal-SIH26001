export interface GeodeticMeasurement {
  origin: { name: string; lat: number; lon: number; elevationM: number };
  destination: { name: string; lat: number; lon: number; elevationM: number };
  distanceKm: number;
  elevationDeltaM: number;
  terrainGradientPct: number;
  rescueHelicopterEtaMin: number;
  groundRescueEtaMin: number;
}

export class SpatialRangefinder {
  /**
   * Great-Circle Distance via Haversine Formula
   */
  public static calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  }

  public static measureCorridor(
    p1: { name: string; lat: number; lon: number; elevationM: number },
    p2: { name: string; lat: number; lon: number; elevationM: number }
  ): GeodeticMeasurement {
    const distanceKm = this.calculateDistanceKm(p1.lat, p1.lon, p2.lat, p2.lon);
    const elevationDeltaM = Math.abs(p2.elevationM - p1.elevationM);
    const terrainGradientPct =
      distanceKm > 0 ? parseFloat(((elevationDeltaM / (distanceKm * 1000)) * 100).toFixed(1)) : 0;

    // Helicopter average mountain operational speed = 220 km/h
    const rescueHelicopterEtaMin = Math.round((distanceKm / 220) * 60);

    // Ground 4x4 mountain rescue vehicle average mountain road speed = 35 km/h (with 1.35x winding factor)
    const groundRescueEtaMin = Math.round(((distanceKm * 1.35) / 35) * 60);

    return {
      origin: p1,
      destination: p2,
      distanceKm,
      elevationDeltaM,
      terrainGradientPct,
      rescueHelicopterEtaMin,
      groundRescueEtaMin,
    };
  }

  private static toRadians(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
