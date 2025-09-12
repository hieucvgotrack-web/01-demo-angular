import { Injectable } from '@angular/core';
import * as L from 'leaflet';

export type TileProviderKey = 'osm' | 'stamen' | 'carto' | 'google';

@Injectable({ providedIn: 'root' })
export class MapService {
  getTileLayer(key: TileProviderKey, opts?: any): L.TileLayer {
    switch (key) {
      case 'stamen':
        return L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
          attribution: 'Map tiles by Stamen Design',
          ...opts
        });
      case 'carto':
        return L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; CartoDB',
          ...opts
        });
      case 'google':
        return L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
          subdomains: ['mt0','mt1','mt2','mt3'],
          attribution: 'Google',
          ...opts
        });
      case 'osm':
      default:
        return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          ...opts
        });
    }
  }

  createPolyline(latlngs: L.LatLngExpression[], color = '#3388ff', weight = 3, dashArray?: string) {
    return L.polyline(latlngs, { color, weight, dashArray });
  }

  createPolygon(latlngs: L.LatLngExpression[], border = '#3388ff', fill = 'rgba(51,136,255,0.2)') {
    return L.polygon(latlngs, { color: border, fillColor: fill, fillOpacity: 0.5 });
  }
}
