import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { SatellitesService, SatellitePosition } from '../../services/satellites'; // Asegúrate que la ruta sea correcta

@Component({
  selector: 'app-map',
  standalone: true, // Si usas Angular 17+
  imports: [], 
  templateUrl: './map.html',
  styleUrl: './map.css'
})
export class MapComponent implements OnInit {
  private map!: L.Map;

  constructor(private satelliteService: SatellitesService) {}

  ngOnInit(): void {
    this.initMap();
    this.loadSatellites();
  }

  private initMap(): void {
    // 1. Inicializamos el mapa centrado en coordenadas [0, 0] y zoom alejado
    this.map = L.map('map-container').setView([0, 0], 2);

    // 2. Añadimos la capa visual (Tiles). Usamos OpenStreetMap por ser gratis/fácil.
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private loadSatellites(): void {
    this.satelliteService.getSatellitesWithPosition().subscribe({
      next: (satellites: SatellitePosition[]) => {
        console.log('Satélites recibidos:', satellites); // Para depurar
        
        satellites.forEach(sat => {
          // Por cada satélite, pintamos un círculo rojo
          L.circleMarker([sat.lat, sat.lon], {
            radius: 5,
            fillColor: "#ff0000",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          })
          .bindPopup(`<b>${sat.name}</b><br>Alt: ${sat.alt.toFixed(2)} km`) // Popup al hacer clic
          .addTo(this.map);
        });
      },
      error: (err) => console.error('Error cargando satélites:', err)
    });
  }
}