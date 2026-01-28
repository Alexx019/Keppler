# Etapa 1: Build
FROM node:18-alpine as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Nginx
FROM nginx:alpine
COPY --from=build /app/dist/keppler-frontend/browser /usr/share/nginx/html
# Copiar TU configuración personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf 
EXPOSE 9011