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
  private markerLayer!: any; // MarkerClusterGroup
  private markers: L.Marker[] = [];
  private currentMarkers: L.Marker[] = [];

  // demo route points (you can update via UI)
  routePoints: L.LatLngExpression[] = [
    [21.028511, 105.804817], // Hanoi
    [21.030000, 105.810000],
    [21.032000, 105.815000],
    [21.035000, 105.820000],
    [21.038000, 105.825000],
  ];

  constructor(private mapSrv: MapService) {}

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    this.map.remove();
  }

  initMap() {
    this.map = L.map('map', { center: [21.028511, 105.804817], zoom: 13 });

    // default layer = OSM
    this.baseLayer = this.mapSrv.getTileLayer('osm').addTo(this.map);

    // marker cluster group
    // @ts-ignore: markercluster types not installed
    this.markerLayer = (L as any).markerClusterGroup({
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      iconCreateFunction: (cluster: any) => this.clusterIcon(cluster)
    });
    this.map.addLayer(this.markerLayer);

    // initial markers (2 points)
    this.addMarker([21.028511, 105.804817], 'Hanoi - A', 'Marker A info');
    this.addMarker([21.035000, 105.820000], 'Hanoi - B', 'Marker B info');

    // draw demo polyline & polygon
    this.demoGeofence();

    // demo cluster 1000
    // don't create automatically for performance — provide method to demo
  }

  // change base layer
  changeBase(key: 'osm'|'stamen'|'carto'|'google') {
    if (this.baseLayer) this.map.removeLayer(this.baseLayer);
    this.baseLayer = this.mapSrv.getTileLayer(key);
    this.map.addLayer(this.baseLayer);
  }

  // add single marker
  addMarker(latlng: L.LatLngExpression, title = '', info = '') {
    const marker = L.marker(latlng, { title });
    marker.bindPopup(`<b>${title}</b><br>${info}`, { offset: [0, -10] });

    // show popup on hover (open on mouseover, close on mouseout)
    marker.on('mouseover', () => { marker.openPopup(); });
    marker.on('mouseout', () => { marker.closePopup(); });

    this.markerLayer.addLayer(marker);
    this.currentMarkers.push(marker);
    return marker;
  }

  // update markers along route: simulate moving update points sequentially
  // points: list of latlng; interval ms between updates
  playRoute(points: L.LatLngExpression[], interval = 800) {
    // remove old "route" markers
    this.currentMarkers.forEach(m => this.markerLayer.removeLayer(m));
    this.currentMarkers = [];

    let idx = 0;
    const timer = setInterval(() => {
      if (idx >= points.length) {
        clearInterval(timer);
        return;
      }
      const p = points[idx];
      const m = L.marker(p, { title: `pt-${idx+1}` });
      m.bindPopup(`Point ${idx+1}`);
      m.on('mouseover', () => m.openPopup());
      m.on('mouseout', () => m.closePopup());
      this.markerLayer.addLayer(m);
      this.currentMarkers.push(m);
      idx++;
    }, interval);
  }

  // draw polyline & polygon demo
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
}
