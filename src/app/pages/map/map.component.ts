import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { MapService } from 'src/app/core/map/map.service';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  private baseLayer!: L.TileLayer;
  private markerLayer!: any;
  private markers: L.Marker[] = [];
  private currentMarkers: L.Marker[] = [];

  private movingMarker!: L.Marker;
  private routePolyline: L.Polyline[] = [];
  private stepCount = 0;
  private moveTimer: any;
  private stopTimer: any;
  private markerIndex = 0;
  routePoints: L.LatLngExpression[] = [
    [21.028511, 105.804817],
    [21.030000, 105.810000],
    [21.032000, 105.815000],
    [21.035000, 105.820000],
    [21.038000, 105.825000],
  ];

 selectedMarker: { status?: string, title?: string, info?: string, lat: number, lng: number } | null = null;
  constructor(private mapSrv: MapService) {}
  selectedBase: 'osm'|'stamen'|'carto'|'google' = 'osm';
  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    this.map.remove();
  }

  initMap() {

    const savedBase = (localStorage.getItem('selectedMap') as 'osm'|'stamen'|'carto'|'google') || 'osm';
    this.selectedBase = savedBase;
    this.map = L.map('map', { center: [21.028511, 105.804817], zoom: 13 });
    this.baseLayer = this.mapSrv.getTileLayer(savedBase).addTo(this.map);

    this.markerLayer = (L as any).markerClusterGroup({
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      iconCreateFunction: (cluster: any) => this.clusterIcon(cluster)
    });
    this.map.addLayer(this.markerLayer);

    this.addMarker([21.028511, 105.804817], 'Hanoi 1', 'Marker 1 info');
    this.addMarker([21.035000, 105.820000], 'Hanoi 2', 'Marker 2 info');

    this.demoGeofence();


  }

  // change base layer
  changeBase(key: 'osm'|'stamen'|'carto'|'google') {
    if (this.baseLayer) this.map.removeLayer(this.baseLayer);
    this.baseLayer = this.mapSrv.getTileLayer(key);
    this.map.addLayer(this.baseLayer);

    this.selectedBase = key; 
    localStorage.setItem('selectedMap', key); 
  }

  // add single marker
  addMarker(latlng: L.LatLngExpression, title = '', info = '') {
    const marker = L.marker(latlng, { title, icon: this.getMarkerIcon('green') });
    marker.bindPopup(`<b>${title}</b><br>${info}`, { offset: [0, -10] });
    marker.on('click', () => {
      const { lat, lng } = marker.getLatLng();
      this.selectedMarker = { title, info, lat, lng };
    });
    // show popup on hover (open on mouseover, close on mouseout)
    marker.on('mouseover', () => { marker.openPopup(); });
    marker.on('mouseout', () => { marker.closePopup(); });

    this.markerLayer.addLayer(marker);
    this.currentMarkers.push(marker);
    return marker;
  }
  demoGeofence() {
    // polyline
  const linePoints: L.LatLngTuple[] = [
  [21.028511, 105.804817],
  [21.0305, 105.809],
  [21.033, 105.815],
  [21.035, 105.824]
];
    const polyline = this.mapSrv.createPolyline(linePoints, '#ff6600', 4);
    polyline.addTo(this.map);

    // polygon
 const polygonPoints: L.LatLngTuple[] = [
  [21.026, 105.800],
  [21.026, 105.810],
  [21.032, 105.812],
  [21.034, 105.802],
];
    const polygon = this.mapSrv.createPolygon(polygonPoints, '#007acc', 'rgba(0,122,204,0.15)');
    polygon.addTo(this.map);
  }

  // demo clustering 1000 markers (random around center)
  generateClusterDemo(count = 1000) {
    // remove previous cluster content
    this.markerLayer.clearLayers();

    const center = this.map.getCenter();
    const lat0 = center.lat;
    const lng0 = center.lng;

    for (let i = 0; i < count; i++) {
      const lat = lat0 + (Math.random() - 0.5) * 0.5;
      const lng = lng0 + (Math.random() - 0.5) * 0.5;
      const m = L.marker([lat, lng]);
      m.bindPopup(`Random ${i+1}`);
      this.markerLayer.addLayer(m);
    }
  }

  // customize cluster icon color based on child count
  clusterIcon(cluster: any) {
    const childCount = cluster.getChildCount();
    let c = 'marker-cluster-small'; // default blue-ish
    let color = '#27ae60'; // green
    if (childCount >= 1000) { color = '#ff4d4f'; c = 'marker-cluster-large'; }
    else if (childCount >= 500) { color = '#faad14'; c = 'marker-cluster-medium'; }
    else if (childCount >= 100) { color = '#52c41a'; c = 'marker-cluster-small'; }
    // create a divIcon with custom background color
    const html = `<div style="background:${color};"><span>${childCount}</span></div>`;
    return L.divIcon({
      html,
      className: `custom-cluster ${c}`,
      iconSize: L.point(40, 40)
    });
  }

  // helper to clear cluster
  clearMarkers() {
    this.markerLayer.clearLayers();
    this.currentMarkers = [];
  }

// Khởi động marker động
startMovingMarker() {
    const center = this.map.getCenter();
    this.movingMarker = L.marker(center, {
      icon: this.getMarkerIcon('green')
    }).addTo(this.map);
    this.markerIndex++;

    this.movingMarker.bindPopup(this.getMarkerPopupContent(this.markerIndex, "Đang di chuyển"));
    this.movingMarker.on('mouseover', () => this.movingMarker.openPopup());
    this.movingMarker.on('mouseout', () => this.movingMarker.closePopup());
    this.movingMarker.on('click', () => {
      const { lat, lng } = this.movingMarker.getLatLng();
      this.selectedMarker = { title: `Demo ${this.markerIndex}`, info: `Marker động demo ${this.markerIndex}`, status: (this.movingMarker.options as any).status, lat, lng };
    });
    this.moveTimer = setInterval(() => this.moveMarkerStep(), 5000);
  }


  randomOffset(maxMeters = 500): [number, number] {
    const dx = (Math.random() - 0.5) * 2 * maxMeters;
    const dy = (Math.random() - 0.5) * 2 * maxMeters;
    const latOffset = dy / 111320;
    const lngOffset = dx / (111320 * Math.cos(this.map.getCenter().lat * Math.PI / 180));
    return [latOffset, lngOffset];
  }

  moveMarkerStep() {
    if (!this.movingMarker) return;
    const oldLatLng = this.movingMarker.getLatLng();
    const [latOffset, lngOffset] = this.randomOffset(500);
    const newLatLng = L.latLng(oldLatLng.lat + latOffset, oldLatLng.lng + lngOffset);

    this.movingMarker.setLatLng(newLatLng);
    (this.movingMarker.options as any).status = "Đang di chuyển";
    this.movingMarker.bindPopup(this.getMarkerPopupContent(this.markerIndex, (this.movingMarker.options as any).status));

    const dist = oldLatLng.distanceTo(newLatLng);
    let color = 'green';
    if (dist < 100) color = '#ff0000';
    else if (dist < 200) color = '#ff6666';
    else if (dist < 300) color = '#ffcc00';
    else if (dist < 400) color = '#d4fc76ff';
    else color = '#00cc00';

    const pl = L.polyline([oldLatLng, newLatLng], { color, weight: 4 }).addTo(this.map);
    this.routePolyline.push(pl);

    this.stepCount++;
    if (this.stepCount % 5 === 0) {
      clearInterval(this.moveTimer);
      this.movingMarker.setIcon(this.getMarkerIcon('yellow'));
      (this.movingMarker.options as any).status = "Đang dừng";
      this.movingMarker.bindPopup(this.getMarkerPopupContent(this.markerIndex, (this.movingMarker.options as any).status));

      this.stopTimer = setTimeout(() => {
        this.movingMarker.setIcon(this.getMarkerIcon('green'));
        (this.movingMarker.options as any).status = "Đang di chuyển";
        this.movingMarker.bindPopup(this.getMarkerPopupContent(this.markerIndex,(this.movingMarker.options as any).status));
        this.moveTimer = setInterval(() => this.moveMarkerStep(), 5000);
      }, 15000);
    }
  }

// hover content
  private getMarkerPopupContent(index: number, status: string): string {
    return `<b>Demo ${index}</b><br>Trạng thái: ${status}`;
  }
  // Đổi Icon marker và đổi màu Icon marker theo trạng thái
  getMarkerIcon(color: 'green' | 'yellow') {
  const carSvg = ` 
    <svg viewBox="64 64 896 896" focusable="false" width="20" height="20" fill="${color}" xmlns="http://www.w3.org/2000/svg">
      <path d="M959 413c0-17-12-32-29-35l-79-16-58-141a32 32 0 0 0-30-20H271a32 32 0 0 0-30 20l-58 141-79 16c-17 3-29 18-29 35v78c0 18 14 32 32 32h32v200c0 35 29 64 64 64h64c35 0 64-29 64-64V672h384v19c0 35 29 64 64 64h64c35 0 64-29 64-64V523h32c18 0 32-14 32-32v-78zM304 664c0 18-14 32-32 32s-32-14-32-32v-64c0-18 14-32 32-32s32 14 32 32v64zm480 0c0 18-14 32-32 32s-32-14-32-32v-64c0-18 14-32 32-32s32 14 32 32v64z"/>
    </svg>
  `;
  return L.divIcon({
    className: 'custom-marker',
    html: carSvg,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
}
copyToClipboard(lat: number, lng: number) {
  const coords = `${lat}, ${lng}`;
  navigator.clipboard.writeText(coords).then(() => {
    console.log('Đã copy:', coords);
  }).catch(err => {
    console.error('Lỗi copy:', err);
  });
}

openInGoogleMaps(lat: number, lng: number) {
  const url = `https://www.google.com/maps?q=${lat},${lng}`;
  window.open(url, '_blank');
}
}
  // <svg viewBox="64 64 896 896" focusable="false" width="20" height="20" fill="${color}" xmlns="http://www.w3.org/2000/svg">
  //     <path d="M959 413c0-17-12-32-29-35l-79-16-58-141a32 32 0 0 0-30-20H271a32 32 0 0 0-30 20l-58 141-79 16c-17 3-29 18-29 35v78c0 18 14 32 32 32h32v200c0 35 29 64 64 64h64c35 0 64-29 64-64V672h384v19c0 35 29 64 64 64h64c35 0 64-29 64-64V523h32c18 0 32-14 32-32v-78zM304 664c0 18-14 32-32 32s-32-14-32-32v-64c0-18 14-32 32-32s32 14 32 32v64zm480 0c0 18-14 32-32 32s-32-14-32-32v-64c0-18 14-32 32-32s32 14 32 32v64z"/>
  //   </svg>