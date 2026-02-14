import { useEffect, useState, useMemo, useRef } from "react";
import { Source, Layer, useMap } from "react-map-gl/maplibre";
import { OSRM_URL } from "../api/consts";

const RoutingEngine = ({ startLng, startLat, endLng, endLat, mode }) => {
  const [routeData, setRouteData] = useState(null);
  const { current: map } = useMap();
  const lastFitRef = useRef(null);

  const lineStyle = useMemo(() => {
    switch (mode) {
      case "walking":
        return {
          color: "#DC143C",
          width: 5,
          opacity: 0.9,
          dasharray: [2, 2],
          cap: "butt",
        };
      case "cycling":
        return {
          color: "#FF0080",
          width: 5,
          opacity: 0.9,
          dasharray: [0.5, 2],
          cap: "round",
        };
      case "car":
        return {
          color: "#FF073A",
          width: 5,
          opacity: 0.9,
          dasharray: null,
          cap: "round",
        };
      default:
        return {
          color: "#FF073A",
          width: 5,
          opacity: 0.9,
          dasharray: null,
          cap: "round",
        };
    }
  }, [mode]);

  useEffect(() => {
    if (
      startLng == null ||
      startLat == null ||
      endLng == null ||
      endLat == null
    )
      return;

    const controller = new AbortController();

    const profileMap = {
      walking: "foot",
      car: "car",
      cycling: "bicycle",
    };

    const profile = profileMap[mode] || "foot";
    const url = `${OSRM_URL}/${profile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

    setRouteData(null);

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const newRouteData = {
            type: "Feature",
            geometry: route.geometry,
          };

          setRouteData(newRouteData);

          const fitKey = `${endLng},${endLat},${mode}`;
          if (map && lastFitRef.current !== fitKey) {
            lastFitRef.current = fitKey;

            try {
              const coords = route.geometry.coordinates;
              const lngs = coords.map((c) => c[0]);
              const lats = coords.map((c) => c[1]);

              map.fitBounds(
                [
                  [Math.min(...lngs), Math.min(...lats)],
                  [Math.max(...lngs), Math.max(...lats)],
                ],
                {
                  padding: {
                    top: 100,
                    bottom: 100,
                    left: 100,
                    right: 100,
                  },
                  duration: 1000,
                  maxZoom: 16,
                },
              );
            } catch (error) {
              console.error("Error fitting bounds:", error);
            }
          }
        } else {
          console.error("No routes found in response:", data);
          setRouteData(null);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Routing error:", err);
          setRouteData(null);
        }
      });

    return () => controller.abort();
  }, [startLng, startLat, endLng, endLat, mode]);

  if (!routeData) return null;

  return (
    <Source key={`route-${mode}`} id="route" type="geojson" data={routeData}>
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
