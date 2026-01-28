import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import * as satellite from 'satellite.js';

export interface SatelliteRaw{
  id: number;
  sat_name: string;
  line1: string;
  line2: string;
  date_added: string;
}

export interface SatellitePosition{
  name: string;
  lat: number;
  lon: number;
  alt: number;
}

@Injectable({
  providedIn: 'root',
})
export class SatellitesService {

  // El navegador completará esto automáticamente:
  // Si estás en localhost:4200 -> pedirá a http://localhost:4200/api/satellites
  private apiUrl = "/api/satellites";

  constructor(private http: HttpClient) { }

  /**
   * 1. Obtiene los satélites de la API
   * 2. Calcula su posición ACTUAL en tiempo real
   */
  getSatellitesWithPosition(): Observable<SatellitePosition[]> {
    return this.http.get<SatelliteRaw[]>(this.apiUrl).pipe(
      map((rawSatellites) => {
        // Transformamos cada satélite "crudo" en una posición
        return rawSatellites.map(sat => this.calculatePosition(sat));
      })
    );
  }

  /**
   * Lógica matemática: Convierte TLE + Hora Actual -> Lat/Long
   */
  private calculatePosition(sat: SatelliteRaw): SatellitePosition {
    // 1. Inicializar el registro del satélite con las dos líneas TLE
    const satrec = satellite.twoline2satrec(sat.line1, sat.line2);

    // 2. Obtener el tiempo actual
    const now = new Date();

    // 3. Propagar la órbita (calcular posición y velocidad ECI)
    const positionAndVelocity = satellite.propagate(satrec, now);
    if (positionAndVelocity == null) return { name: sat.sat_name, lat: 0, lon: 0, alt: 0 }; // Retorno seguro
    
    const positionEci = positionAndVelocity.position;

    // Validación: A veces el cálculo falla si el TLE es muy viejo
    if (!positionEci || typeof positionEci === 'boolean') {
        return { name: sat.sat_name, lat: 0, lon: 0, alt: 0 }; // Retorno seguro
    }

    // 4. Convertir coordenadas ECI (espaciales) a Geodésicas (terrestres)
    // Se necesita el tiempo GMST para la rotación de la tierra
    const gmst = satellite.gstime(now);
    const positionGd = satellite.eciToGeodetic(positionEci as satellite.EciVec3<number>, gmst);

    // 5. Convertir radianes a grados para el mapa
    const longitude = satellite.degreesLong(positionGd.longitude);
    const latitude  = satellite.degreesLat(positionGd.latitude);
    const height    = positionGd.height;

    return {
      name: sat.sat_name,
      lat: latitude,
      lon: longitude,
      alt: height
    };
  }
  
}
