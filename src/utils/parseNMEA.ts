type Coordinates = {
    latitude: number
    longitude: number
  }
  
  type GpsData = {
    coordinates: Coordinates | null
    speedKmh: number | null
    altitudeMeters: number | null
    fixQuality: number | null
    satelliteCount: number | null
    dateUTC: string | null
    timeUTC: string | null
  }
  
  export function parseNMEA(nmeaText: string): GpsData {
    const lines = nmeaText.trim().split('\n')
    const result: GpsData = {
      coordinates: null,
      speedKmh: null,
      altitudeMeters: null,
      fixQuality: null,
      satelliteCount: null,
      dateUTC: null,
      timeUTC: null,
    }
  
    for (const line of lines) {
      const fields = line.trim().split(',')
  
      if (line.startsWith('$GPRMC')) {
        const time = fields[1]
        const status = fields[2]
        const latRaw = fields[3]
        const latDir = fields[4]
        const lonRaw = fields[5]
        const lonDir = fields[6]
        const speedKnots = parseFloat(fields[7])
        const date = fields[9]
  
        if (status === 'A') {
          result.coordinates = {
            latitude: convertDMSToDecimal(latRaw, latDir),
            longitude: convertDMSToDecimal(lonRaw, lonDir),
          }
          result.speedKmh = parseFloat((speedKnots * 1.852).toFixed(3))
          result.dateUTC = formatDateUTC(date)
          result.timeUTC = formatTimeUTC(time)
        }
      }
  
      if (line.startsWith('$GPGGA')) {
        result.fixQuality = parseInt(fields[6], 10) || null
        result.satelliteCount = parseInt(fields[7], 10) || null
        result.altitudeMeters = parseFloat(fields[9]) || null
      }
    }
  
    return result
  }
  

  function convertDMSToDecimal(dms: string, dir: string): number {
    if (!dms || dms.length < 3) return NaN
    const dotIndex = dms.indexOf('.')
    const degLen = dotIndex <= 2 ? 1 : dotIndex - 2
  
    const degrees = parseInt(dms.slice(0, degLen), 10)
    const minutes = parseFloat(dms.slice(degLen))
  
    let decimal = degrees + minutes / 60
    if (dir === 'S' || dir === 'W') decimal *= -1
  
    return parseFloat(decimal.toFixed(6))
  }
  
  function formatDateUTC(ddmmyy: string): string | null {
    if (ddmmyy.length !== 6) return null
    const day = ddmmyy.slice(0, 2)
    const month = ddmmyy.slice(2, 4)
    const year = '20' + ddmmyy.slice(4, 6)
    return `${year}-${month}-${day}`
  }
  
  function formatTimeUTC(hhmmss: string): string | null {
    if (hhmmss.length < 6) return null
    const hh = hhmmss.slice(0, 2)
    const mm = hhmmss.slice(2, 4)
    const ss = hhmmss.slice(4, 6)
    return `${hh}:${mm}:${ss}Z`
  }
  