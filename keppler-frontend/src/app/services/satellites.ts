import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import * as satellite from 'satellite.js';

// Interfaz para los datos crudos que vienen de TU backend (con sat_name)
export interface SatelliteRaw {
  sat_name: string;
  line1: string;
  line2: string;
  // Opcional: guardamos el objeto satrec precálculado para rendimiento
  satrec?: any; 
}

export interface SatellitePosition {
  name: string;
  lat: number;
  lng: number;
  alt: number;
}

@Injectable({ providedIn: 'root' })
export class SatellitesService {
  private apiUrl = '/api/satellites'; 

  constructor(private http: HttpClient) { }

  // 1. Obtenemos los datos crudos (TLEs) una sola vez
  getRawSatellites(): Observable<SatelliteRaw[]> {
    return this.http.get<SatelliteRaw[]>(this.apiUrl).pipe(
      map(sats => {
        // PRE-OPTIMIZACIÓN: Convertimos las strings TLE a objetos matemáticos 'satrec'
        // Esto se hace una vez al principio para no repetirlo cada segundo.
        return sats.map(sat => {
          sat.satrec = satellite.twoline2satrec(sat.line1, sat.line2);
          return sat;
        });
      })
    );
  }

  // 2. Función pública para calcular posición en un momento dado (date)
  calculatePosition(sat: SatelliteRaw, date: Date): SatellitePosition | null {
    // Usamos el satrec ya procesado si existe, o lo creamos
    const satrec = sat.satrec || satellite.twoline2satrec(sat.line1, sat.line2);

    const positionAndVelocity = satellite.propagate(satrec, date);
    if (positionAndVelocity == null){
      return null;
    }

    const positionEci = positionAndVelocity.position;

    if (!positionEci || typeof positionEci === 'boolean') {
      return null;
    }

    const gmst = satellite.gstime(date);
    const positionGd = satellite.eciToGeodetic(positionEci as satellite.EciVec3<number>, gmst);

    return {
      name: sat.sat_name,
      lat: satellite.degreesLat(positionGd.latitude),
      lng: satellite.degreesLong(positionGd.longitude),
      alt: positionGd.height
    };
  }
}