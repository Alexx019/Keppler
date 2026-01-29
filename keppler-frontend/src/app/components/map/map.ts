import { Component, OnInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { SatellitesService, SatelliteRaw } from '../../services/satellites';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [], 
  templateUrl: './map.html',
  styleUrl: './map.css'
})
export class MapComponent implements OnInit, OnDestroy {
  private map!: L.Map;
  
  // Guardamos los datos crudos para recalcular
  private satellitesData: SatelliteRaw[] = [];
  
  // DICCIONARIO: Clave = Nombre Satélite, Valor = Marcador en el mapa
  // Esto nos permite buscar y mover un marcador instantáneamente sin recrearlo.
  private markers: Map<string, L.CircleMarker> = new Map();
  
  // Referencia al intervalo para poder pararlo si sales de la página
  private intervalId: any;

  constructor(private satelliteService: SatellitesService) {}

  ngOnInit(): void {
    this.initMap();
    this.startSimulation();
  }

  // Importante: Limpiar el bucle si el usuario cambia de página
  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private initMap(): void {
    this.map = L.map('map-container', { preferCanvas: true }).setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private startSimulation(): void {
    // 1. Carga inicial de datos (SOLO SE HACE UNA VEZ)
    this.satelliteService.getRawSatellites().subscribe(data => {
      this.satellitesData = data;
      console.log(`Cargados ${data.length} satélites. Iniciando animación...`);
      
      // 2. Crear los marcadores iniciales
      this.createMarkers();

      // 3. Iniciar el "bucle" de actualización (cada 1000ms = 1 segundo)
      this.intervalId = setInterval(() => {
        this.updatePositions();
      }, 1000); 
    });
  }

  private createMarkers(): void {
    const now = new Date();
    
    this.satellitesData.forEach(sat => {
      const pos = this.satelliteService.calculatePosition(sat, now);
      if (pos) {
        // Color según altura
        const color = pos.alt > 1000 ? '#3388ff' : '#ff0000';

        // Creamos el marcador
        const marker = L.circleMarker([pos.lat, pos.lng], {
          radius: 3,
          fillColor: color,
          color: "transparent",
          fillOpacity: 0.8
        }).bindPopup(`<b>${sat.sat_name}</b>`);

        // Lo añadimos al mapa
        marker.addTo(this.map);

        // LO GUARDAMOS EN EL DICCIONARIO para usarlo luego
        this.markers.set(sat.sat_name, marker);
      }
    });
  }

  private updatePositions(): void {
    const now = new Date(); // La hora actual exacta para este frame

    // Recorremos nuestros datos guardados
    this.satellitesData.forEach(sat => {
      // 1. Calculamos nueva posición matemática
      const newPos = this.satelliteService.calculatePosition(sat, now);
      
      if (newPos) {
        // 2. Buscamos el marcador existente en nuestro diccionario
        const marker = this.markers.get(sat.sat_name);

        if (marker) {
          // 3. MOVER: Solo actualizamos coordenadas (muy rápido)
          marker.setLatLng([newPos.lat, newPos.lng]);
          
          // Opcional: Actualizar el popup si está abierto
          if (marker.isPopupOpen()) {
             marker.setPopupContent(`<b>${sat.sat_name}</b><br>Alt: ${newPos.alt.toFixed(2)} km`);
          }
        }
      }
    });
  }
}