import { 
  useRef, 
  useEffect, 
  useContext 
} from 'react';
import 'ol/ol.css';
import OlMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import ModalTransitionContext from '../../context/modal-transition-context'; // adjust path

function Map({ center, zoom, className, style }) {
  const mapRef = useRef();
  const mapInstanceRef = useRef(null);
  const isModalReady = useContext(ModalTransitionContext);

  // Create the map once on mount
  useEffect(() => {
    const map = new OlMap({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() })
      ],
      view: new View({
        center: fromLonLat([center.lng, center.lat]),
        zoom: zoom
      })
    });
    mapInstanceRef.current = map;

    // still useful for real resizes (window resize, sidebar toggle, etc.)
    const resizeObserver = new ResizeObserver(() => map.updateSize());
    resizeObserver.observe(mapRef.current);

    return () => {
      resizeObserver.disconnect();
      map.setTarget(null);
      mapInstanceRef.current = null;
    };
  }, [center, zoom]);

  // Fix sizing once the modal's transition has actually finished
  useEffect(() => {
    if (isModalReady && mapInstanceRef.current) {
      mapInstanceRef.current.updateSize();
    }
  }, [isModalReady]);

  return (
    <div
      ref={mapRef}
      className={`w-full h-64 ${className}`}
      style={style}
    ></div>
  );
}

export default Map;

// import { useRef, useEffect } from 'react';

// function Map({ center, zoom, className, style }){
//   const mapRef = useRef();

//   useEffect(() => {
//     new window.ol.Map({
//       target: mapRef.current.id,
//       layers: [
//         new window.ol.layer.Tile({
//           source: new window.ol.source.OSM()
//         })
//       ],
//       view: new window.ol.View({
//         center: window.ol.proj.fromLonLat([center.lng, center.lat]),
//         zoom: zoom
//       })
//     });
//   }, [center, zoom]);

//   return (
//     <div
//       ref={mapRef}
//       className={`w-full h-48 sm:h-56 md:h-64 lg:h-80 ${className}`}
//       style={style}
//       id="map"
//     ></div>
//   );
// };

// export default Map;
