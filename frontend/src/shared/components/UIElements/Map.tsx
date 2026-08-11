import { useRef, useEffect, useContext, CSSProperties } from 'react';
import 'ol/ol.css';
import OlMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import ModalTransitionContext from '../../context/modal-transition-context';

interface Coordinates {
  lat: number;
  lng: number;
}

interface MapProps {
  center: Coordinates;
  zoom: number;
  className?: string;
  style?: CSSProperties;
}

function Map({ center, zoom, className, style }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<OlMap | null>(null);
  const isModalReady = useContext(ModalTransitionContext);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new OlMap({
      target: mapRef.current,
      layers: [new TileLayer({ source: new OSM() })],
      view: new View({
        center: fromLonLat([center.lng, center.lat]),
        zoom: zoom,
      }),
    });
    mapInstanceRef.current = map;

    const resizeObserver = new ResizeObserver(() => map.updateSize());
    resizeObserver.observe(mapRef.current);

    return () => {
      resizeObserver.disconnect();
      map.setTarget(undefined);
      mapInstanceRef.current = null;
    };
  }, [center, zoom]);

  useEffect(() => {
    if (isModalReady && mapInstanceRef.current) {
      mapInstanceRef.current.updateSize();
    }
  }, [isModalReady]);

  return (
    <div
      ref={mapRef}
      className={`w-full h-64 ${className || ''}`}
      style={style}
    ></div>
  );
}

export default Map;