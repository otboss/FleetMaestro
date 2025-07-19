
// import { exec } from "child_process"

// const cmd = `stty -F /dev/ttyACM0 9600 raw -echo && timeout 1.0 cat /dev/ttyACM0`;

// export const getCoordinates = () => {
//     return new Promise((resolve, reject) => {
//         exec(cmd, (error, stdout, stderr) => {
//             if (error) {
//               console.error(`Command failed: ${error.message}`);
//               return;
//             }
          
//             if (stderr) {
//               console.error(`stderr: ${stderr}`);
//             }
          
//             console.log(`GPS Output:\n${stdout}`);
//           })
//     })
// }


import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

export type Coordinates = {
  lat: number;
  lon: number;
};

export type GPSData = {
  coordinates: Coordinates | null;
  speedKmh: number | null;
  altitudeMeters: number | null;
  fixQuality: number | null;
  satelliteCount: number | null;
  dateUTC: string | null;
  timeUTC: string | null;
};

export function readGPSData(portPath = '/dev/ttyACM0', baudRate = 9600): Promise<GPSData> {
  return new Promise((resolve, reject) => {
    const port = new SerialPort({ path: portPath, baudRate });
    const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

    let resolved = false;

    parser.on('data', line => {
      if (line.startsWith('$GPGGA') || line.startsWith('$GNGGA')) {
        const parts = line.split(',');

        const fixQuality = parseInt(parts[6], 10);
        const satelliteCount = parseInt(parts[7], 10);
        const altitudeMeters = parseFloat(parts[9]);
        const timeUTC = parseTime(parts[1]);
        const lat = parseNMEACoordinate(parts[2], parts[3]);
        const lon = parseNMEACoordinate(parts[4], parts[5]);

        const data: GPSData = {
          coordinates: lat !== null && lon !== null ? { lat, lon } : null,
          speedKmh: null, // Not present in GGA sentence
          altitudeMeters: isNaN(altitudeMeters) ? null : altitudeMeters,
          fixQuality: isNaN(fixQuality) ? null : fixQuality,
          satelliteCount: isNaN(satelliteCount) ? null : satelliteCount,
          dateUTC: null,
          timeUTC,
        };

        if (!resolved) {
          resolved = true;
          port.close();
          resolve(data);
        }
      }

      if (line.startsWith('$GPVTG')) {
        const parts = line.split(',');
        const speedKmh = parseFloat(parts[7]);

        if (!resolved) {
          resolved = true;
          port.close();
          resolve({
            coordinates: null,
            speedKmh: isNaN(speedKmh) ? null : speedKmh,
            altitudeMeters: null,
            fixQuality: null,
            satelliteCount: null,
            dateUTC: null,
            timeUTC: null,
          });
        }
      }
    });

    port.on('error', err => {
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });

    // Fallback timeout in case no data is received
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        port.close();
        resolve({
          coordinates: null,
          speedKmh: null,
          altitudeMeters: null,
          fixQuality: null,
          satelliteCount: null,
          dateUTC: null,
          timeUTC: null,
        });
      }
    }, 2000);
  });
}

function parseNMEACoordinate(coord: string, direction: string): number | null {
  if (!coord || coord.length < 4) return null;

  const degLength = coord.includes('.') ? coord.indexOf('.') - 2 : coord.length - 2;
  const degrees = parseInt(coord.slice(0, degLength));
  const minutes = parseFloat(coord.slice(degLength));

  let decimal = degrees + minutes / 60;
  if (direction === 'S' || direction === 'W') decimal *= -1;

  return isNaN(decimal) ? null : decimal;
}

function parseTime(rawTime: string): string | null {
  if (!rawTime || rawTime.length < 6) return null;
  const hh = rawTime.slice(0, 2);
  const mm = rawTime.slice(2, 4);
  const ss = rawTime.slice(4, 6);
  return `${hh}:${mm}:${ss} UTC`;
}
