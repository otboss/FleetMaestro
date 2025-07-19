interface ParsedNmea {
    coordinates: { lat: number; lon: number } | null;
    speedKmh: number | null;
    altitudeMeters: number | null;
    fixQuality: number | null;
    satelliteCount: number | null;
    accuracy: number | null; // HDOP in meters (lower = more accurate)
    dateUTC: string | null; // "YYYY-MM-DD"
    timeUTC: string | null; // "HH:mm:ss"
}

export function parseNmeaBlock(nmeaLines: string[]): ParsedNmea {
    let result: ParsedNmea = {
      coordinates: null,
      speedKmh: null,
      altitudeMeters: null,
      fixQuality: null,
      satelliteCount: null,
      accuracy: null,
      dateUTC: null,
      timeUTC: null,
    };
  
    for (const line of nmeaLines) {
      const fields = line.split(',');
  
      if (line.startsWith('$GPRMC')) {
        // Example: $GPRMC,210843.00,V,,,,,,,130725,,,N*73
        const timeStr = fields[1]; // hhmmss.ss
        const dateStr = fields[9]; // ddmmyy
        if (timeStr && dateStr) {
          const hh = timeStr.slice(0, 2);
          const mm = timeStr.slice(2, 4);
          const ss = timeStr.slice(4, 6);
          const dd = dateStr.slice(0, 2);
          const MM = dateStr.slice(2, 4);
          const yy = dateStr.slice(4, 6);
          result.timeUTC = `${hh}:${mm}:${ss}`;
          result.dateUTC = `20${yy}-${MM}-${dd}`;
        }
      }
  
      else if (line.startsWith('$GPVTG')) {
        // Example: $GPVTG,,,,,,,,,N*30
        const speedKmh = parseFloat(fields[7]);
        if (!isNaN(speedKmh)) result.speedKmh = speedKmh;
      }
  
      else if (line.startsWith('$GPGGA')) {
        // Example: $GPGGA,210843.00,,,,,0,03,3.51,,,,,,*5E
        const fixQuality = parseInt(fields[6]);
        const satelliteCount = parseInt(fields[7]);
        const hdop = parseFloat(fields[8]);
        const altitude = parseFloat(fields[9]);
  
        if (!isNaN(fixQuality)) result.fixQuality = fixQuality;
        if (!isNaN(satelliteCount)) result.satelliteCount = satelliteCount;
        if (!isNaN(hdop)) result.accuracy = hdop;
        if (!isNaN(altitude)) result.altitudeMeters = altitude;
      }
  
      else if (line.startsWith('$GPGSA')) {
        // Example: $GPGSA,A,1,28,10,32,,,,,,,,,,3.65,3.51,1.00*0C
        const hdop = parseFloat(fields[16]);
        if (!isNaN(hdop)) result.accuracy = hdop;
      }
  
      else if (line.startsWith('$GPGLL')) {
        // Example: $GPGLL,,,,,210843.00,V,N*46
        // lat/lon may be in fields[1] and [3]
        const latRaw = fields[1];
        const latDir = fields[2];
        const lonRaw = fields[3];
        const lonDir = fields[4];
  
        if (latRaw && lonRaw) {
          const lat = convertToDecimal(latRaw, latDir);
          const lon = convertToDecimal(lonRaw, lonDir);
          if (lat !== null && lon !== null) {
            result.coordinates = { lat, lon };
          }
        }
      }
  
      // You can also parse $GPGSV for satellite data if needed
    }
  
    return result;
  }
  
  function convertToDecimal(coord: string, dir: string): number | null {
    // Converts "ddmm.mmmm" or "dddmm.mmmm" to decimal degrees
    if (!coord || !dir) return null;
    const degLen = coord.includes('.') ? coord.indexOf('.') > 4 ? 3 : 2 : 2;
    const degrees = parseFloat(coord.slice(0, degLen));
    const minutes = parseFloat(coord.slice(degLen));
    if (isNaN(degrees) || isNaN(minutes)) return null;
    let decimal = degrees + minutes / 60;
    if (dir === 'S' || dir === 'W') decimal *= -1;
    return decimal;
  }
  