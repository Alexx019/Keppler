export interface FavoriteSatelliteInfo {
  name: string;
  url: string;
  description: string;
  color?: string;
}

export interface FavoriteGroup {
  name: string;
  shortDesc: string;
  color: string;
  satellites: FavoriteSatelliteInfo[];
}

export const FAVORITE_GROUPS: FavoriteGroup[] = [
  {
    name: 'Observación Terrestre',
    shortDesc: 'Imágenes y Radar',
    color: '#ffee00', // Amarillo pollo
    satellites: [
      { name: 'SENTINEL-1A', url: 'https://browser.dataspace.copernicus.eu/', description: 'Radar de apertura sintética (SAR), atraviesa nubes.' },
      { name: 'SENTINEL-2A', url: 'https://browser.dataspace.copernicus.eu/', description: 'Imágenes ópticas de 10m de resolución.' },
      { name: 'SENTINEL-2B', url: 'https://browser.dataspace.copernicus.eu/', description: 'Imágenes ópticas de 10m de resolución.' },
      { name: 'SENTINEL-2C', url: 'https://browser.dataspace.copernicus.eu/', description: 'Imágenes ópticas de 10m de resolución.' },
      { name: 'SENTINEL-3A', url: 'https://browser.dataspace.copernicus.eu/', description: 'Temperatura del mar y color oceánico.' },
      { name: 'SENTINEL-3B', url: 'https://browser.dataspace.copernicus.eu/', description: 'Temperatura del mar y color oceánico.' },
      { name: 'LANDSAT 8', url: 'https://worldview.earthdata.nasa.gov/', description: 'Imágenes ópticas e infrarrojas de 30m.' },
      { name: 'LANDSAT 9', url: 'https://worldview.earthdata.nasa.gov/', description: 'Imágenes ópticas e infrarrojas de 30m.' },
      { name: 'CBERS 4', url: 'http://www.dgi.inpe.br/catalogo/', description: 'Imágenes ópticas (Cooperación China-Brasil).' },
      { name: 'ALOS-2', url: 'https://www.eorc.jaxa.jp/ALOS/en/index_e.htm', description: 'Radar de banda L (Japón).' },
      { name: 'ALOS-4 (DAICHI-4)', url: 'https://www.eorc.jaxa.jp/ALOS/en/index_e.htm', description: 'Radar de banda L (Japón).' },
      { name: 'IRS-P5 (CARTOSAT-1)', url: 'https://bhuvan-app1.nrsc.gov.in/', description: 'Imágenes y cartografía de la India.' },
      { name: 'CARTOSAT-2A', url: 'https://bhuvan-app1.nrsc.gov.in/', description: 'Imágenes y cartografía.' },
      { name: 'CARTOSAT-2B', url: 'https://bhuvan-app1.nrsc.gov.in/', description: 'Imágenes y cartografía.' },
      { name: 'CARTOSAT-2C', url: 'https://bhuvan-app1.nrsc.gov.in/', description: 'Imágenes y cartografía.' },
      { name: 'CARTOSAT-2D', url: 'https://bhuvan-app1.nrsc.gov.in/', description: 'Imágenes y cartografía.' },
      { name: 'CARTOSAT-2E', url: 'https://bhuvan-app1.nrsc.gov.in/', description: 'Imágenes y cartografía.' },
      { name: 'CARTOSAT-2F', url: 'https://bhuvan-app1.nrsc.gov.in/', description: 'Imágenes y cartografía.' },
      { name: 'CARTOSAT-3', url: 'https://bhuvan-app1.nrsc.gov.in/', description: 'Imágenes y cartografía.' }
    ]
  },
  {
    name: 'Meteorología',
    shortDesc: 'Tiempo Real y Clima',
    color: '#33ccff', // Azul clima
    satellites: [
      { name: 'GOES 14', url: 'https://www.star.nesdis.noaa.gov/GOES/index.php', description: 'Nubes y clima cada 10-15 min (América).' },
      { name: 'EWS-G2 (GOES 15)', url: 'https://www.star.nesdis.noaa.gov/GOES/index.php', description: 'Nubes y clima cada 10-15 min (América).' },
      { name: 'GOES 16', url: 'https://www.star.nesdis.noaa.gov/GOES/index.php', description: 'Nubes y clima cada 10-15 min (América).' },
      { name: 'GOES 17', url: 'https://www.star.nesdis.noaa.gov/GOES/index.php', description: 'Nubes y clima cada 10-15 min (América).' },
      { name: 'GOES 18', url: 'https://www.star.nesdis.noaa.gov/GOES/index.php', description: 'Nubes y clima cada 10-15 min (América).' },
      { name: 'GOES 19', url: 'https://www.star.nesdis.noaa.gov/GOES/index.php', description: 'Nubes y clima cada 10-15 min (América).' },
      { name: 'METEOSAT-9 (MSG-2)', url: 'https://view.eumetsat.int/', description: 'Clima en tiempo real (Europa y África).' },
      { name: 'METEOSAT-10 (MSG-3)', url: 'https://view.eumetsat.int/', description: 'Clima en tiempo real (Europa y África).' },
      { name: 'METEOSAT-11 (MSG-4)', url: 'https://view.eumetsat.int/', description: 'Clima en tiempo real (Europa y África).' },
      { name: 'METEOSAT-12 (MTG-I1)', url: 'https://view.eumetsat.int/', description: 'Clima en tiempo real (Europa y África).' },
      { name: 'HIMAWARI-8', url: 'https://www.jma.go.jp/bosai/map.html', description: 'Meteorología en tiempo real (Asia y Pacífico).' },
      { name: 'HIMAWARI-9', url: 'https://www.jma.go.jp/bosai/map.html', description: 'Meteorología en tiempo real (Asia y Pacífico).' },
      { name: 'FENGYUN 3A', url: 'https://satellite.nsmc.org.cn/DataPortal/en/home/index.html', description: 'Meteorología china.' },
      { name: 'FENGYUN 3B', url: 'https://satellite.nsmc.org.cn/DataPortal/en/home/index.html', description: 'Meteorología china.' },
      { name: 'FENGYUN 3C', url: 'https://satellite.nsmc.org.cn/DataPortal/en/home/index.html', description: 'Meteorología china.' },
      { name: 'FENGYUN 3D', url: 'https://satellite.nsmc.org.cn/DataPortal/en/home/index.html', description: 'Meteorología china.' },
      { name: 'FENGYUN 3E', url: 'https://satellite.nsmc.org.cn/DataPortal/en/home/index.html', description: 'Meteorología china.' },
      { name: 'FENGYUN 3F', url: 'https://satellite.nsmc.org.cn/DataPortal/en/home/index.html', description: 'Meteorología china.' },
      { name: 'FENGYUN 3G', url: 'https://satellite.nsmc.org.cn/DataPortal/en/home/index.html', description: 'Meteorología china.' },
      { name: 'FENGYUN 3H', url: 'https://satellite.nsmc.org.cn/DataPortal/en/home/index.html', description: 'Meteorología china.' },
      { name: 'FENGYUN 4A', url: 'https://satellite.nsmc.org.cn/DataPortal/en/home/index.html', description: 'Meteorología china.' },
      { name: 'GEO-KOMPSAT-2A', url: 'https://nmsc.kma.go.kr/enhome/html/main/main.do', description: 'Satélite meteorológico coreano.' },
      { name: 'ELEKTRO-L 2', url: 'http://planet.iitp.ru/', description: 'Satélite geoestacionario ruso.' },
      { name: 'INSAT-3D', url: 'https://www.mosdac.gov.in/', description: 'Meteorología del Océano Índico.' },
      { name: 'INSAT-3DR', url: 'https://www.mosdac.gov.in/', description: 'Meteorología del Océano Índico.' },
      { name: 'INSAT-3DS', url: 'https://www.mosdac.gov.in/', description: 'Meteorología del Océano Índico.' }
    ]
  },
  {
    name: 'Medio Ambiente',
    shortDesc: 'Datos Analíticos',
    color: '#00ff00', // Verde ciencia
    satellites: [
      { name: 'NOAA 20 (JPSS-1)', url: 'https://firms.modaps.eosdis.nasa.gov/map/', description: 'Incendios activos y anomalías térmicas.' },
      { name: 'NOAA 21 (JPSS-2)', url: 'https://firms.modaps.eosdis.nasa.gov/map/', description: 'Incendios activos y anomalías térmicas.' },
      { name: 'SUOMI NPP', url: 'https://firms.modaps.eosdis.nasa.gov/map/', description: 'Incendios activos y anomalías térmicas.' },
      { name: 'AQUA', url: 'https://worldview.earthdata.nasa.gov/', description: 'Clorofila, polvo y aerosoles.' },
      { name: 'TERRA', url: 'https://worldview.earthdata.nasa.gov/', description: 'Clorofila, polvo y aerosoles.' },
      { name: 'AURA', url: 'https://worldview.earthdata.nasa.gov/', description: 'Clorofila, polvo y aerosoles.' },
      { name: 'SENTINEL-5P', url: 'https://maps.s5p-pal.com/', description: 'Calidad del aire, NO2, Metano y contaminantes.' },
      { name: 'ICESAT-2', url: 'https://icesat-2.gsfc.nasa.gov/icesat-2-data', description: 'Altura del hielo y de bosques (Lidar).' },
      { name: 'SMAP', url: 'https://smap.jpl.nasa.gov/', description: 'Humedad del suelo y salinidad del mar.' },
      { name: 'SMOS', url: 'https://smap.jpl.nasa.gov/', description: 'Humedad del suelo y salinidad del mar.' },
      { name: 'GPM-CORE', url: 'https://gpm.nasa.gov/data/visualization', description: 'Mapas de lluvia y nieve global.' },
      { name: 'SENTINEL-6A', url: 'https://www.earthdata.nasa.gov/centers/po-daac', description: 'Nivel del mar y dinámica oceánica.' },
      { name: 'SENTINEL-6B', url: 'https://www.earthdata.nasa.gov/centers/po-daac', description: 'Nivel del mar y dinámica oceánica.' }
    ]
  },
  {
    name: 'Ciencia Espacial',
    shortDesc: 'Observación Solar y Profunda',
    color: '#ff00aa', // Magenta analítico
    satellites: [
      { name: 'SDO', url: 'https://sdo.gsfc.nasa.gov/data/', description: 'El Sol en alta resolución y tiempo real.' },
      { name: 'HST', url: 'https://hla.stsci.edu/', description: 'Imágenes históricas del espacio profundo.' },
      { name: 'CXO', url: 'https://cxc.harvard.edu/cda/', description: 'Observaciones de rayos X.' },
      { name: 'XMM-NEWTON', url: 'https://cxc.harvard.edu/cda/', description: 'Observaciones de rayos X.' },
      { name: 'FGRST (GLAST)', url: 'https://fermi.gsfc.nasa.gov/ssc/data/', description: 'Eventos de alta energía y rayos gamma.' },
      { name: 'SWIFT', url: 'https://fermi.gsfc.nasa.gov/ssc/data/', description: 'Eventos de alta energía y rayos gamma.' },
      { name: 'IRIS', url: 'https://iris.lmsal.com/', description: 'Observación de la corona solar.' },
      { name: 'HINODE (SOLAR-B)', url: 'https://iris.lmsal.com/', description: 'Observación de la corona solar.' }
    ]
  }
];

export const FAVORITE_SATELLITES: Record<string, FavoriteSatelliteInfo> = {};
FAVORITE_GROUPS.forEach(g => g.satellites.forEach(s => FAVORITE_SATELLITES[s.name] = { ...s, color: g.color }));
