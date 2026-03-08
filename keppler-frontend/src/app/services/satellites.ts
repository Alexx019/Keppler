import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as satellite from 'satellite.js';
import { environment } from '../../environments/environment';

// Interfaz para los datos crudos que vienen de TU backend (con sat_name)
export interface SatelliteRaw {
  sat_name: string;
  category: string;
  norad_cat_id?: number;
  launch_year?: number;
  intl_designator?: string;
  priority?: string;
  owner?: string;
  launch_site?: string;
  ops_status?: string;
  line1: string;
  line2: string;
  updated_at?: string;
  // Opcional: guardamos el objeto satrec precálculado para rendimiento
  satrec?: any;
}

export interface SatellitePosition {
  name: string;
  lat: number;
  lng: number;
  alt: number;
  time?: Date;
}

export interface SatelliteIntel {
  country: string;
  flagUrl: string;
  description: string;
  imageUrl: string;
  type: string;
}

@Injectable({ providedIn: 'root' })
export class SatellitesService {
  private apiUrl = `${environment.apiUrl}/satellites`;

  constructor(private http: HttpClient) { }

  // 1. Obtenemos los datos crudos (TLEs) una sola vez
  getRawSatellites(): Observable<SatelliteRaw[]> {
    return this.http.get<SatelliteRaw[]>(this.apiUrl).pipe(
      map((sats: SatelliteRaw[]) => {
        // PRE-OPTIMIZACIÓN: Convertimos las strings TLE a objetos matemáticos 'satrec'
        // Esto se hace una vez al principio para no repetirlo cada segundo.
        return sats.map((sat: SatelliteRaw) => {
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
    if (positionAndVelocity == null) {
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
      alt: positionGd.height,
      time: date
    };
  }

  // 3. Obtener la trayectoria pasada y futura (-90 min a +90 min)
  calculateOrbit(sat: SatelliteRaw, centerDate: Date, durationMins: number = 90, stepMins: number = 1): SatellitePosition[] {
    const path: SatellitePosition[] = [];
    const start = new Date(centerDate.getTime() - durationMins * 60000);
    const end = new Date(centerDate.getTime() + durationMins * 60000);

    for (let d = new Date(start); d <= end; d.setMinutes(d.getMinutes() + stepMins)) {
      const pos = this.calculatePosition(sat, new Date(d));
      if (pos) {
        path.push(pos);
      }
    }
    return path;
  }

  // 4. Inteligencia Artificial / Wikipedia API con Fallback (Mock)
  getSatelliteIntel(sat: SatelliteRaw): Observable<SatelliteIntel> {
    // Diccionario Oficial de Códigos de País SATCAT
    const DB_OWNER = sat.owner || 'UNKNOWN';
    let realCountry = 'Unknown / Classified';
    let realFlag = 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Flag_of_the_United_Nations.svg';

    if (DB_OWNER.includes('US')) { realCountry = 'United States'; realFlag = 'https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg'; }
    else if (DB_OWNER.includes('CIS') || DB_OWNER.includes('USSR') || DB_OWNER.includes('RU')) { realCountry = 'Russian Federation'; realFlag = 'https://upload.wikimedia.org/wikipedia/en/f/f3/Flag_of_Russia.svg'; }
    else if (DB_OWNER.includes('PRC') || DB_OWNER.includes('CHBZ')) { realCountry = 'China'; realFlag = 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Flag_of_the_People%27s_Republic_of_China.svg'; }
    else if (DB_OWNER.includes('UK')) { realCountry = 'United Kingdom'; realFlag = 'https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg'; }
    else if (DB_OWNER.includes('FR')) { realCountry = 'France'; realFlag = 'https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg'; }
    else if (DB_OWNER.includes('JPN')) { realCountry = 'Japan'; realFlag = 'https://upload.wikimedia.org/wikipedia/en/9/9e/Flag_of_Japan.svg'; }
    else if (DB_OWNER.includes('ESA')) { realCountry = 'European Space Agency'; realFlag = 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg'; }
    else if (DB_OWNER.includes('IND')) { realCountry = 'India'; realFlag = 'https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg'; }
    else if (DB_OWNER.includes('ISRA')) { realCountry = 'Israel'; realFlag = 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Flag_of_Israel.svg'; }
    else if (DB_OWNER.includes('GER')) { realCountry = 'Germany'; realFlag = 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Flag_of_Germany.svg'; }
    else if (DB_OWNER.includes('ROC')) { realCountry = 'Taiwan'; realFlag = 'https://upload.wikimedia.org/wikipedia/commons/7/72/Flag_of_the_Republic_of_China.svg'; }
    else if (DB_OWNER.includes('SAUD')) { realCountry = 'Saudi Arabia'; realFlag = 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Flag_of_Saudi_Arabia.svg'; }
    else if (DB_OWNER.includes('VTNM')) { realCountry = 'Vietnam'; realFlag = 'https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg'; }
    else if (DB_OWNER.includes('SKOR')) { realCountry = 'South Korea'; realFlag = 'https://upload.wikimedia.org/wikipedia/commons/0/09/Flag_of_South_Korea.svg'; }
    else if (DB_OWNER.includes('IT')) { realCountry = 'Italy'; realFlag = 'https://upload.wikimedia.org/wikipedia/en/0/03/Flag_of_Italy.svg'; }
    else if (DB_OWNER.includes('UAE')) { realCountry = 'United Arab Emirates'; realFlag = 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Flag_of_the_United_Arab_Emirates.svg'; }
    else if (DB_OWNER.includes('AZER')) { realCountry = 'Azerbaijan'; realFlag = 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Flag_of_Azerbaijan.svg'; }
    else if (DB_OWNER.includes('KAZ')) { realCountry = 'Kazakhstan'; realFlag = 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Flag_of_Kazakhstan.svg'; }
    else if (DB_OWNER.includes('SVN')) { realCountry = 'Slovenia'; realFlag = 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Flag_of_Slovenia.svg'; }
    else if (DB_OWNER.includes('BRAZ')) { realCountry = 'Brazil'; realFlag = 'https://upload.wikimedia.org/wikipedia/commons/0/05/Flag_of_Brazil.svg'; }
    else if (DB_OWNER.includes('CA')) { realCountry = 'Canada'; realFlag = 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Flag_of_Canada.svg'; }
    else if (DB_OWNER.includes('POL')) { realCountry = 'Poland'; realFlag = 'https://upload.wikimedia.org/wikipedia/commons/1/12/Flag_of_Poland.svg'; }
    else if (DB_OWNER.includes('TURK')) { realCountry = 'Turkey'; realFlag = 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Flag_of_Turkey.svg'; }

    // El Mock base inicializado con los datos reales de BD si los tenemos
    let mockIntel: SatelliteIntel = {
      country: realCountry !== 'Unknown / Classified' ? realCountry : 'Unknown',
      flagUrl: realFlag,
      description: `Activo orbital con ID de catálogo NORAD: ${sat.norad_cat_id || 'N/A'}. Información extendida no disponible.`,
      imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=400&auto=format&fit=crop', // Default Sat
      type: 'Payload (Unknown)'
    };

    // Le metemos la info del backend si existe (viene como intel_description / intel_image_url gracias al JOIN)
    if ((sat as any).intel_description) {
      mockIntel.description = (sat as any).intel_description;
    }
    if ((sat as any).intel_image_url) {
      mockIntel.imageUrl = (sat as any).intel_image_url;
    }

    // Ya no hacemos petición HTTP al a wikipedia desde el frontend, TODO viene desde nuestra REST API
    return of(mockIntel);
  }
}