import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { SatellitesService, SatelliteRaw } from '../../services/satellites';
import { FAVORITE_SATELLITES, FAVORITE_GROUPS, FavoriteGroup, FavoriteSatelliteInfo } from '../../services/favorite-satellites';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.html',
  styleUrl: './map.css'
})
export class MapComponent implements OnInit, OnDestroy {
  private map!: L.Map;

  // Guardamos los datos crudos para recalcular
  private satellitesData: SatelliteRaw[] = [];

  private markers: Map<string, L.Marker | L.CircleMarker> = new Map();

  // Referencia al bucle de animación
  private animationFrameId: number | null = null;

  // Estado UI Filtros
  categories: string[] = [];
  selectedCategories: Set<string> = new Set(['Earth Resources']);
  showCategoriesMenu: boolean = true;
  
  // Estado UI Favoritos
  favoriteGroups = FAVORITE_GROUPS;
  showFavoritesMenu: boolean = true;
  expandedFavoriteGroups: Set<string> = new Set(); 
  selectedFavoriteSatellites: Set<string> = new Set(
    FAVORITE_GROUPS.filter(g => g.name !== 'Ciencia Espacial').flatMap(g => g.satellites.map(s => s.name))
  );

  // Estado UI Tracking
  trackedSatellite: SatelliteRaw | null = null;
  trackedIntel: any = null;
  trackedPosition: any = null;

  // Controles Interactivos
  isTrackingLocked: boolean = false;
  showOrbit: boolean = true;
  showFootprint: boolean = true;
  showInfoPanel: boolean = false;

  // Elementos Leaflet Dinámicos para el Tracking
  private orbitLine: L.Polyline | null = null;
  private footprintCircle: L.Circle | null = null;
  private trackingSquare: L.Marker | null = null;
  private permanentTooltip: L.Marker | null = null;

  // UI variables for Side panel
  tleCopied: boolean = false;

  constructor(private satelliteService: SatellitesService) { }

  ngOnInit(): void {
    this.initMap();
    this.startSimulation();

    // Escuchar eventos de movimiento de usuario para soltar la cámara (Untethering)
    this.map.on('dragstart', () => {
      // dragstart solo se dispara por arrastre manual del usuario, no por panTo()
      if (this.isTrackingLocked) {
        this.isTrackingLocked = false;
        this.updateMapLayout();
      }
    });

    // Al hacer un clic en el mapa (no arrastrar), se esconde el panel de info pero sigue el trackeo
    this.map.on('click', (e: any) => {
      // Leaflet dispara 'click' en el mapa incluso al pinchar algunos controles, pero no al pinchar
      // en un L.circleMarker si este detiene la propagación (Leaflet suele hacerlo nativamente, pero aseguramos).
      // Si llegamos a nivel mapa asumiendo que el usuario pinchó "vacio":
      if (this.showInfoPanel) {
        this.showInfoPanel = false;
        this.updateMapLayout();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private initMap(): void {
<<<<<<< Updated upstream
    // Zoom control abajoderecha para que no pise el HUD
    const maxBounds: L.LatLngBoundsExpression = [
      [-90, -180],
      [90, 180]
    ];
    this.map = L.map('map-container', {
      preferCanvas: true,
      zoomControl: false,
      minZoom: 3,                 // Evita ver demasiados mapas repetidos
      maxZoom: 10,
      maxBounds: maxBounds,
      worldCopyJump: true         // Soluciona el antimeridiano
    }).setView([20, 0], 3);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors, © CARTO',
      noWrap: false // Permite repetir horizontalmente y worldCopyJump hace la magia
=======
    this.map = L.map('map-container', { preferCanvas: true, zoomControl: false }).setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
>>>>>>> Stashed changes
    }).addTo(this.map);
  }

  private startSimulation(): void {
    this.satelliteService.getRawSatellites().subscribe((data: SatelliteRaw[]) => {
      this.satellitesData = data;
      console.log(`Cargados ${data.length} satélites. Iniciando animación...`);

      // Extraemos categorías únicas
      const uniqueCats = new Set<string>();
      data.forEach((s: SatelliteRaw) => {
        if (s.category) uniqueCats.add(s.category);
      });
      if (uniqueCats.size === 0) uniqueCats.add('Desconocida');

      this.categories = Array.from(uniqueCats).sort();
      // Ya no seleccionamos categorías por defecto, salvo Earth Resources y los Favoritos
      this.selectedCategories = new Set(['Earth Resources']);

      // Creamos los marcadores iniciales
      this.createMarkers();

      // Bucle de renderizado continuo (60fps)
      const animate = () => {
        this.updatePositions();
        this.animationFrameId = requestAnimationFrame(animate);
      };

      // Iniciamos el bucle
      animate();
    });
  }

  private createMarkers(): void {
    const now = new Date();

    this.satellitesData.forEach(sat => {
      const pos = this.satelliteService.calculatePosition(sat, now);
      if (pos) {
        // Color Palantir
        const cat = sat.category || 'Desconocida';
        const color = this.getSatelliteColor(sat);

        // Estilo Palantir Ficha Táctica
        const norad = sat.norad_cat_id || 'N/A';
        const year = sat.launch_year || 'N/A';
        const desig = sat.intl_designator || 'N/A';
        const prio = sat.priority || 'Standard';

        let prioColor = '#00ffcc';
        if (prio.includes('High')) prioColor = '#ff3333';
        else if (prio.includes('Experimental')) prioColor = '#ffff00';

        const popupHTML = `
          <div style="font-family: 'Courier New', monospace; color: #00ffcc; background: #0a0f19; padding: 10px; border: 1px solid #00ffcc; box-shadow: 0 0 10px rgba(0,255,204,0.3); min-width: 200px;">
            <h4 style="margin: 0 0 10px 0; border-bottom: 1px solid #00ffcc; padding-bottom: 5px; text-transform: uppercase;">${sat.sat_name}</h4>
            <div style="font-size: 0.9em; margin-bottom: 3px;"><b>CAT:</b> ${cat}</div>
            <div style="font-size: 0.9em; margin-bottom: 3px;"><b>NORAD ID:</b> ${norad}</div>
            <div style="font-size: 0.9em; margin-bottom: 3px;"><b>YEAR:</b> ${year}</div>
            <div style="font-size: 0.9em; margin-bottom: 3px;"><b>DESIG:</b> ${desig}</div>
            <div style="font-size: 0.9em; margin-bottom: 8px; color: ${prioColor};"><b>PRIORITY:</b> ${prio}</div>
            <div id="alt-${norad}" style="font-size: 0.8em; color: #aaa;">ALT: Cargando...</div>
          </div>
        `;

        const isFav = FAVORITE_SATELLITES[sat.sat_name] !== undefined;
        let marker: L.Marker | L.CircleMarker;

        if (isFav) {
          // Render as a star for favorites
          marker = L.marker([pos.lat, pos.lng], {
            icon: L.divIcon({
              className: 'favorite-star-icon',
              html: `<div style="color: ${color}; text-shadow: 0 0 5px ${color}; width: 100%; height: 100%; text-align: center; line-height: 20px;">★</div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })
          }).bindTooltip(popupHTML, { className: 'tactical-popup', direction: 'top', opacity: 1 });
        } else {
          // Render as a standard dot
          marker = L.circleMarker([pos.lat, pos.lng], {
            radius: 3,
            fillColor: color,
            color: color,
            weight: 1,
            fillOpacity: 1
          }).bindTooltip(popupHTML, { className: 'tactical-popup', direction: 'top', opacity: 1 });
        }



        // Evento Click: Iniciar Tracking Militar y abrir Panel Derecho
        marker.on('click', (e: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e as any); // Evitar que el click se propague al mapa y cierre el panel
          this.trackSatellite(sat);
        });

        // Solo lo añadimos si la categoría está seleccionada o es favorito seleccionado
        const isFavSelected = this.selectedFavoriteSatellites.has(sat.sat_name);
        if (this.selectedCategories.has(cat) || isFavSelected) {
          marker.addTo(this.map);
        }

        this.markers.set(sat.sat_name, marker);
      }
    });
  }

  private updatePositions(): void {
    const now = new Date();

    this.satellitesData.forEach(sat => {
      const cat = sat.category || 'Desconocida';
      const isFavSelected = this.selectedFavoriteSatellites.has(sat.sat_name);
      
      // Optimización: Si no está activa ni es favorito seleccionado, ni calculamos ni movemos
      if (!this.selectedCategories.has(cat) && !isFavSelected) return;

      const newPos = this.satelliteService.calculatePosition(sat, now);

      if (newPos) {
        const marker = this.markers.get(sat.sat_name);

        if (marker) {
          marker.setLatLng([newPos.lat, newPos.lng]);

          if (marker.isTooltipOpen()) {
            const altElement = document.getElementById(`alt-${sat.norad_cat_id || 'N/A'}`);
            if (altElement) {
              altElement.innerText = `ALT: ${newPos.alt.toFixed(2)} km`;
            }
          }
        }

        // Si este es el satélite que estamos rastreando (Lock-On target)
        if (this.trackedSatellite && this.trackedSatellite.sat_name === sat.sat_name) {
          this.trackedPosition = newPos;

          // El auto-pan de la cámara a 60 FPS causaba la ilusión de que la trayectoria se movía
          // y generaba vibración subpixelada (jitter). Ahora la cámara se queda fija, 
          // permitiendo ver cómo el satélite avanza sobre la línea estática.

          // Actualizar cuadrado de tracking
          if (this.trackingSquare) {
            (this.trackingSquare as L.Marker).setLatLng([newPos.lat, newPos.lng]);
          }
          if (this.permanentTooltip) {
            this.permanentTooltip.setLatLng([newPos.lat, newPos.lng]);
          }

          // 2. Mover la silueta/footprint del radar (círculo)
          if (this.footprintCircle) {
            this.footprintCircle.setLatLng([newPos.lat, newPos.lng]);
          }
        }
      }
    });
  }

  // --- Helper Cálculo Bounds Cuadrado ---
  private getSquareBounds(lat: number, lng: number, sizeDeg: number): L.LatLngBounds {
    const half = sizeDeg / 2;
    return L.latLngBounds([
      [lat - half, lng - half],
      [lat + half, lng + half]
    ]);
  }

  // --- UI Lógica Tracking ---
  trackSatellite(sat: SatelliteRaw): void {
    this.trackedSatellite = sat;
    this.showInfoPanel = true;    // Mostrar la información a la derecha

    // Centramos la cámara al seleccionarlo de golpe y luego lo liberamos para que navegue visualmente
    this.isTrackingLocked = true;
    setTimeout(() => this.isTrackingLocked = false, 1000);

    // Obtenemos inteligencia asíncrona de Wikipedia / Fallback
    this.satelliteService.getSatelliteIntel(sat).subscribe((intel) => {
      this.trackedIntel = intel;
    });

    // Limpiar gráficos antiguos
    if (this.orbitLine) { this.map.removeLayer(this.orbitLine); }
    if (this.footprintCircle) { this.map.removeLayer(this.footprintCircle); }
    if (this.trackingSquare) { this.map.removeLayer(this.trackingSquare); }
    if (this.permanentTooltip) { this.map.removeLayer(this.permanentTooltip); }

    // Ocultar el resto de satélites
    this.markers.forEach((m, name) => {
      if (name !== sat.sat_name) {
        if (this.map.hasLayer(m)) this.map.removeLayer(m);
      }
    });

    // Asegurar que el marker del objetivo esté visible (evita bugs visuales por saltos directos iterativos)
    const targetMarker = this.markers.get(sat.sat_name);
    if (targetMarker && !this.map.hasLayer(targetMarker)) {
      targetMarker.addTo(this.map);
    }

    const now = new Date();
    const pos = this.satelliteService.calculatePosition(sat, now);
    if (!pos) return;

    // Zoom instantáneo fuerte al objetivo y notificar apertura de UI al mapa
    this.updateMapLayout();
    this.map.setView([pos.lat, pos.lng], 5, { animate: true });

    // Cuadrado de tracking fijo de 40x40 píxeles
    this.trackingSquare = L.marker([pos.lat, pos.lng], {
      icon: L.divIcon({
        className: 'target-crosshair',
        html: '<div style="width:100%;height:100%;border:3px solid #ff3333;box-sizing:border-box;box-shadow:inset 0 0 10px rgba(255, 51, 51, 0.6), 0 0 10px rgba(255, 51, 51, 0.6);"></div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      }),
      interactive: false
    }).addTo(this.map);

    // Etiqueta permanente (usamos un marcador invisible con tooltip permanente)
    this.permanentTooltip = L.marker([pos.lat, pos.lng], { opacity: 0 }).bindTooltip(
      `<div style="color: #ff3333; font-weight: bold; font-family: 'Courier New';">${sat.sat_name}</div>`,
      { permanent: true, direction: 'right', className: 'tactical-tooltip', offset: [5, 0] }
    ).addTo(this.map);

    // Dibujar la Huella de Área de Cobertura (Formula geométrica del horizonte terrestre)
    const R = 6371; // Radio de la Tierra en km
    const posAlt = Math.max(pos.alt, 100); // Mínimo 100km si hay error pa q no pete
    const radiusMeters = Math.acos(R / (R + posAlt)) * R * 1000;

    this.footprintCircle = L.circle([pos.lat, pos.lng], {
      radius: radiusMeters,
      color: '#ff3333',
      weight: 1,
      fillColor: '#ff3333',
      fillOpacity: 0.1,
      dashArray: '5, 10'
    }).addTo(this.map);

    // Dibujar Trayectoria/Órbita predictiva
    const pathPoints = this.satelliteService.calculateOrbit(sat, now, 90, 1); // +-90 mins, pasos de 1 min

    // Partir la línea cuando el satélite cruza el anti-meridiano (Lng > 180 o < -180) para que no haya una recta
    const latLngsArrays: L.LatLng[][] = [];
    let currentSegment: L.LatLng[] = [];

    for (let i = 0; i < pathPoints.length; i++) {
      const p = pathPoints[i];
      if (i > 0) {
        const prevP = pathPoints[i - 1];
        if (Math.abs(p.lng - prevP.lng) > 180) {
          latLngsArrays.push(currentSegment);
          currentSegment = [];
        }
      }
      currentSegment.push(new L.LatLng(p.lat, p.lng));
    }
    if (currentSegment.length > 0) latLngsArrays.push(currentSegment);

    this.orbitLine = L.polyline(latLngsArrays as any, {
      color: '#00ffcc',
      weight: 2,
      opacity: 0.6,
      dashArray: '10, 10',
      smoothFactor: 1
    }).addTo(this.map);

    this.renderDynamics(sat, pos);
  }

  // Función separada para renderizar huella y órbita reactivamente a los booleanos
  renderDynamics(sat?: SatelliteRaw, pos?: any): void {
    if (!sat) sat = this.trackedSatellite!;
    if (!pos) pos = this.trackedPosition;
    if (!sat || !pos) return;

    const now = new Date();

    // Footerprint
    if (this.footprintCircle) this.map.removeLayer(this.footprintCircle);
    if (this.showFootprint) {
      const R = 6371;
      const posAlt = Math.max(pos.alt, 100);
      const radiusMeters = Math.acos(R / (R + posAlt)) * R * 1000;

      this.footprintCircle = L.circle([pos.lat, pos.lng], {
        radius: radiusMeters,
        color: '#ff3333',
        fillColor: '#ff3333',
        fillOpacity: 0.1,
        weight: 1,
        dashArray: '5, 10'
      }).addTo(this.map);
    }

    // Órbita
    if (this.orbitLine) this.map.removeLayer(this.orbitLine);
    if (this.showOrbit) {
      const pathPoints = this.satelliteService.calculateOrbit(sat, now, 90, 1);
      const latLngsArrays: L.LatLng[][] = [];
      let currentSegment: L.LatLng[] = [];

      for (let i = 0; i < pathPoints.length; i++) {
        const p = pathPoints[i];
        if (i > 0 && Math.abs(p.lng - pathPoints[i - 1].lng) > 180) {
          latLngsArrays.push(currentSegment);
          currentSegment = [];
        }
        currentSegment.push(new L.LatLng(p.lat, p.lng));
      }
      if (currentSegment.length > 0) latLngsArrays.push(currentSegment);

      this.orbitLine = L.polyline(latLngsArrays as any, {
        color: '#00ffcc',
        weight: 2,
        opacity: 0.6,
        dashArray: '10, 10',
        smoothFactor: 1
      }).addTo(this.map);
    }
  }

  // Alternadores de la UI Panel
  toggleLock(): void {
    // El botón 'Lock' ahora sirve para centrar la cámara instantáneamente en el objetivo principal
    if (this.trackedPosition) {
      this.isTrackingLocked = true;
      this.updateMapLayout();
      this.map.panTo([this.trackedPosition.lat, this.trackedPosition.lng], { animate: true });
      
      // Una vez centrado al instante suavemente, liberamos para que navegue
      setTimeout(() => this.isTrackingLocked = false, 1000);
    }
  }

  toggleOrbit(): void {
    this.showOrbit = !this.showOrbit;
    this.renderDynamics();
  }

  toggleFootprint(): void {
    this.showFootprint = !this.showFootprint;
    this.renderDynamics();
  }

  untrackSatellite(): void {
    this.trackedSatellite = null;
    this.trackedIntel = null;
    this.trackedPosition = null;
    this.isTrackingLocked = false;
    this.showInfoPanel = false;

    if (this.orbitLine) { this.map.removeLayer(this.orbitLine); }
    if (this.footprintCircle) { this.map.removeLayer(this.footprintCircle); }
    if (this.trackingSquare) { this.map.removeLayer(this.trackingSquare); }
    if (this.permanentTooltip) { this.map.removeLayer(this.permanentTooltip); }

    // Restaurar todos los satélites visibles según el filtro
    this.satellitesData.forEach(s => {
      const cat = s.category || 'Desconocida';
      const isFavSelected = this.selectedFavoriteSatellites.has(s.sat_name);
      if (this.selectedCategories.has(cat) || isFavSelected) {
        const m = this.markers.get(s.sat_name);
        if (m && !this.map.hasLayer(m)) m.addTo(this.map);
      }
    });

    this.updateMapLayout();
  }

  // --- Helper para sincronizar el redimensionado de Angular con Leaflet ---
  private updateMapLayout(): void {
    // 1. Comportamiento Rueda de Ratón
    // Al no estar ya forzando el seguimiento con auto-pan continuo,
    // revertimos a que la rueda del ratón siempre haga zoom al puntero, como de costumbre.
    this.map.options.scrollWheelZoom = true;

    // 2. Comportamiento Recálculo de Centro Cinemático
    // Dado que Angular abre/cierra el panel derecho con *ngIf, el ancho del div del mapa
    // en CSS-Flexbox crece y encoge. Hay que avisar a Leaflet para que recalcule
    // instantáneamente dónde está ahora el "centro exacto" del hueco visible sin dar tirones.
    setTimeout(() => {
      // El truco definitivo: pan:false le dice a Leaflet que no intente
      // "corregir" el centro geográfico cuando cambie el tamaño del div.
      // Esto hace que el mapa simplemente parezca que se destapa/tapa por la derecha sin saltar.
      this.map.invalidateSize({ pan: false });
      
      if (this.isTrackingLocked && this.trackedPosition) {
        // Al recalcular, el centro de la pantalla es más pequeño. 
        // Centramos suavemente al satélite en el nuevo hueco táctico.
        this.map.panTo([this.trackedPosition.lat, this.trackedPosition.lng], { animate: true });
      }
    }, 50); // Mínimo retardo DOM de seguridad
  }

  closeInfoPanel(): void {
    this.showInfoPanel = false;
    this.updateMapLayout();
    
    // Centramos la cámara al cerrar el panel táctico SOLO si el satélite está visible
    if (this.trackedPosition) {
      const pos = L.latLng(this.trackedPosition.lat, this.trackedPosition.lng);
      if (this.map.getBounds().contains(pos)) {
        this.isTrackingLocked = true;
        this.map.panTo(pos, { animate: true });
        setTimeout(() => this.isTrackingLocked = false, 1000);
      }
    }
  }

  openInfoPanel(): void {
    this.showInfoPanel = true;
    this.updateMapLayout();
    
    // Centramos la cámara al re-abrir el panel táctico SOLO si el satélite está visible
    if (this.trackedPosition) {
      const pos = L.latLng(this.trackedPosition.lat, this.trackedPosition.lng);
      if (this.map.getBounds().contains(pos)) {
        this.isTrackingLocked = true;
        this.map.panTo(pos, { animate: true });
        setTimeout(() => this.isTrackingLocked = false, 1000);
      }
    }
  }

  copyTLE(): void {
    if (this.trackedSatellite) {
      const tle = `${this.trackedSatellite.sat_name}\n${this.trackedSatellite.line1}\n${this.trackedSatellite.line2}`;
      navigator.clipboard.writeText(tle).then(() => {
        this.tleCopied = true;
        setTimeout(() => this.tleCopied = false, 2000); // Reset after 2 secs
      });
    }
  }

  // --- UI Lógica Filtros ---

  toggleCategory(category: string): void {
    if (this.selectedCategories.has(category)) {
      this.selectedCategories.delete(category);
      // Quitar del mapa instantáneamente los que no sean favoritos seleccionados
      this.satellitesData
        .filter((s: SatelliteRaw) => (s.category || 'Desconocida') === category)
        .forEach((s: SatelliteRaw) => {
          if (this.selectedFavoriteSatellites.has(s.sat_name)) return; // Si es favorito y está seleccionado, se mantiene
          
          const marker = this.markers.get(s.sat_name);
          if (marker) {
            this.map.removeLayer(marker);
          }
        });
    } else {
      this.selectedCategories.add(category);
      // Añadir al mapa calculando posición exacta actual
      const now = new Date();
      this.satellitesData
        .filter((s: SatelliteRaw) => (s.category || 'Desconocida') === category)
        .forEach((s: SatelliteRaw) => {
          const marker = this.markers.get(s.sat_name);
          const pos = this.satelliteService.calculatePosition(s, now);
          if (marker && pos) {
            marker.setLatLng([pos.lat, pos.lng]);
            if (!this.trackedSatellite || this.trackedSatellite.sat_name === s.sat_name) {
              marker.addTo(this.map);
            }
          }
        });
    }
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories.has(category);
  }

  // Lógica Favoritos Desplegables

  toggleFavoritesMenu(): void {
    this.showFavoritesMenu = !this.showFavoritesMenu;
  }

  toggleFavoriteGroupExpansion(groupName: string): void {
    if (this.expandedFavoriteGroups.has(groupName)) {
      this.expandedFavoriteGroups.delete(groupName);
    } else {
      this.expandedFavoriteGroups.add(groupName);
    }
  }

  isFavoriteGroupExpanded(groupName: string): boolean {
    return this.expandedFavoriteGroups.has(groupName);
  }

  isFavoriteSatelliteSelected(satName: string): boolean {
    return this.selectedFavoriteSatellites.has(satName);
  }

  isFavoriteGroupSelected(group: FavoriteGroup): boolean {
    return group.satellites.every(s => this.selectedFavoriteSatellites.has(s.name));
  }

  toggleFavoriteSatellite(satName: string): void {
    const isSelected = this.selectedFavoriteSatellites.has(satName);
    const now = new Date();

    if (isSelected) {
      this.selectedFavoriteSatellites.delete(satName);
      
      // Borrar del mapa si no pertenece además a una categoría estándar activa
      const satData = this.satellitesData.find(s => s.sat_name === satName);
      if (satData && !this.selectedCategories.has(satData.category || 'Desconocida')) {
        const marker = this.markers.get(satName);
        if (marker) this.map.removeLayer(marker);
      }
    } else {
      this.selectedFavoriteSatellites.add(satName);
      
      // Renderizar en el mapa
      const satData = this.satellitesData.find(s => s.sat_name === satName);
      if (satData) {
        const marker = this.markers.get(satName);
        const pos = this.satelliteService.calculatePosition(satData, now);
        if (marker && pos) {
          marker.setLatLng([pos.lat, pos.lng]);
          if (!this.trackedSatellite || this.trackedSatellite.sat_name === satName) {
            marker.addTo(this.map);
          }
        }
      }
    }
  }

  toggleFavoriteGroup(group: FavoriteGroup): void {
    const isAllSelected = this.isFavoriteGroupSelected(group);
    
    // Si todos están seleccionados, los deseleccionamos todos. Si no, los seleccionamos todos.
    group.satellites.forEach(s => {
      if (isAllSelected && this.selectedFavoriteSatellites.has(s.name)) {
        this.toggleFavoriteSatellite(s.name); // Deseleccionar individualmente para reusar lógica de borrar marker
      } else if (!isAllSelected && !this.selectedFavoriteSatellites.has(s.name)) {
        this.toggleFavoriteSatellite(s.name); // Seleccionar individualmente para reusar lógica de añadir marker
      }
    });
  }

  goToFavoriteSatellite(satName: string): void {
    // 1. Mostrar si no está visible
    if (!this.selectedFavoriteSatellites.has(satName)) {
      this.toggleFavoriteSatellite(satName);
    }

    // 2. Trackear y Enfocar
    const satData = this.satellitesData.find(s => s.sat_name === satName);
    if (satData) {
      if (this.trackedSatellite && this.trackedSatellite.sat_name === satName) {
        // Ya trackeado, resincronizar pan de Leaflet para garantizar centrado
        const now = new Date();
        const pos = this.satelliteService.calculatePosition(satData, now);
        if (pos) {
          // Pan con offset del HUD
          const offsetX = 0.05 * (this.map.getZoom() < 5 ? 20 : 1);
          this.map.panTo([pos.lat, pos.lng - offsetX], { animate: true, duration: 0.5 });
        }
      } else {
        // Iniciar tracker desde 0
        this.trackSatellite(satData);
      }
    }
  }

  getTrackedFavoriteInfo(): FavoriteSatelliteInfo | null {
    if (!this.trackedSatellite) return null;
    return FAVORITE_SATELLITES[this.trackedSatellite.sat_name] || null;
  }

  toggleCategoriesMenu(): void {
    this.showCategoriesMenu = !this.showCategoriesMenu;
  }

  getSatelliteColor(sat: SatelliteRaw): string {
    const favInfo = FAVORITE_SATELLITES[sat.sat_name];
    if (favInfo && favInfo.color) {
      return favInfo.color;
    }
    return this.getCategoryColor(sat.category || 'Desconocida');
  }

  getCategoryColor(cat: string): string {
    let color = '#00ffcc'; // Default cyan
    if (cat === 'Starlink') color = '#ff00ff';
    else if (cat === 'Stations') color = '#ff5555'; // Lighter red
    else if (cat === 'Weather') color = '#33ccff';
    else if (cat === 'Navigation' || cat === 'GLONASS') color = '#ffcc00'; // Amber/Gold instead of pure yellow
    else if (cat === 'Military' || cat === 'TJSAT') color = '#cc0000'; // Darker red to distinguish from stations
    else if (cat === 'Earth Resources') color = '#aaff00'; // Yellow-green
    else if (cat === 'Science') color = '#00ff55'; // Pure green
    else if (cat === 'Analyst') color = '#ff00aa'; // Magenta brillante para los oscuros
    else if (cat === 'Radar') color = '#ff8800';  // Naranja radar
    return color;
  }
}