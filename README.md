# Keppler

Rastreador de satétiles a base de TLEs. Funciona con microservicios, un ingestor, una api rest y una base de datos postgreSQL. Todo mostrado en una web hecha con React + Vite para enseñar en 3d la posiion de cada uno de los satélites con respecto al globo terrestre usando la librería Cesium JS, además para la visualización en 2D usamos leaflet

### Puertos

Keppler hace uso de los puertos 901X

- La API REST corre en el puerto 9010
- El frontend corre en el puerto 9011
- La base de datos corre internamente en la network en el puerto 5432