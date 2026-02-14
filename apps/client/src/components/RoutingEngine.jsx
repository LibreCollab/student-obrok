import { useEffect, useState, useRef, useCallback } from "react";
import { Source, Layer, useMap } from "react-map-gl/maplibre";
import { OSRM_URL } from "../api/consts";

const PROFILE_MAP = {
  walking: "foot",
  car: "car",
  cycling: "bicycle",
};

const LINE_STYLES = {
  walking: {
    color: "#DC143C",
    width: 5,
    opacity: 0.9,
    dasharray: [2, 2],
    cap: "butt",
  },
  cycling: {
    color: "#FF0080",
    width: 5,
    opacity: 0.9,
    dasharray: [0.5, 2],
    cap: "round",
  },
  car: {
    color: "#FF073A",
    width: 5,
    opacity: 0.9,
    dasharray: null,
    cap: "round",
  },
};

const RoutingEngine = ({ startLng, startLat, endLng, endLat, mode }) => {
  const [routeData, setRouteData] = useState(null);
  const { current: map } = useMap();
  const lastFitRef = useRef(null);
  const mapRef = useRef(map);

  useEffect(() => {
    mapRef.current = map;
  }, [map]);

  const fitBoundsToRoute = useCallback((coordinates, fitKey) => {
    if (lastFitRef.current === fitKey) return;
    lastFitRef.current = fitKey;

    const currentMap = mapRef.current;
    if (!currentMap) return;

    try {
      const lngs = coordinates.map((c) => c[0]);
      const lats = coordinates.map((c) => c[1]);

      const isSmallScreen = window.innerWidth < 500;
      const padding = isSmallScreen
        ? { top: 60, bottom: 60, left: 40, right: 40 }
        : { top: 100, bottom: 100, left: 100, right: 100 };

      currentMap.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding, duration: 1000, maxZoom: 16 },
      );
    } catch (error) {
      console.error("Error fitting bounds:", error);
    }
  }, []);

  useEffect(() => {
    if (
      startLng == null ||
      startLat == null ||
      endLng == null ||
      endLat == null
    )
      return;

    const controller = new AbortController();
    const profile = PROFILE_MAP[mode] || "foot";
    const url = `${OSRM_URL}/${profile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data.routes?.length) {
          console.error("No routes found:", data);
          setRouteData(null);
          return;
        }

        const geometry = data.routes[0].geometry;

        setRouteData({
          type: "Feature",
          geometry,
        });

        const fitKey = `${endLng},${endLat},${mode}`;
        fitBoundsToRoute(geometry.coordinates, fitKey);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Routing error:", err);
          setRouteData(null);
        }
      });

    return () => controller.abort();
  }, [startLng, startLat, endLng, endLat, mode, fitBoundsToRoute]);

  const lineStyle = LINE_STYLES[mode] || LINE_STYLES.car;

  if (!routeData) return null;

  return (
    <Source id="route" type="geojson" data={routeData}>
      <Layer
        id="route-line"
        type="line"
        paint={{
          "line-color": lineStyle.color,
          "line-width": lineStyle.width,
          "line-opacity": lineStyle.opacity,
          ...(lineStyle.dasharray && {
            "line-dasharray": lineStyle.dasharray,
          }),
        }}
        layout={{
          "line-cap": lineStyle.cap,
          "line-join": "round",
        }}
      />
    </Source>
  );
};

export default RoutingEngine;
