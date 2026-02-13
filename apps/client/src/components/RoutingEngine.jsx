import { useEffect, useState, useMemo } from "react";
import { Source, Layer, useMap } from "react-map-gl/maplibre";
import { OSRM_URL } from "../api/consts";

const RoutingEngine = ({ start, end, mode }) => {
  const [routeData, setRouteData] = useState(null);
  const { current: map } = useMap();

  const lineStyle = useMemo(() => {
    switch (mode) {
      case "walking":
        return {
          color: "#DC143C", // Crimson
          width: 5,
          opacity: 0.9,
          dasharray: [2, 2],
          cap: "butt",
        };
      case "cycling":
        return {
          color: "#FF0080", // Neon Magenta
          width: 5,
          opacity: 0.9,
          dasharray: [0.5, 2],
          cap: "round",
        };
      case "car":
        return {
          color: "#FF073A", // Neon Red (like crimson but brighter)
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
    if (!start || !end) return;

    setRouteData(null);

    const profileMap = {
      walking: "foot",
      car: "car",
      cycling: "bicycle",
    };

    const profile = profileMap[mode] || "foot";
    const url = `${OSRM_URL}/${profile}/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
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

          if (map && route.geometry && route.geometry.coordinates) {
            try {
              const coords = route.geometry.coordinates;
              const lngs = coords.map((c) => c[0]);
              const lats = coords.map((c) => c[1]);

              const minLng = Math.min(...lngs);
              const maxLng = Math.max(...lngs);
              const minLat = Math.min(...lats);
              const maxLat = Math.max(...lats);

              map.fitBounds(
                [
                  [minLng, minLat],
                  [maxLng, maxLat],
                ],
                {
                  padding: { top: 100, bottom: 100, left: 100, right: 100 },
                  duration: 1000,
                  maxZoom: 16,
                },
              );
            } catch (error) {
              console.error("Error fitting bounds:", error);
            }
          }
        } else {
          console.error("❌ No routes found in response:", data);
          setRouteData(null);
        }
      })
      .catch((err) => {
        console.error("❌ Routing error:", err);
        setRouteData(null);
      });
  }, [start, end, mode, map]);

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
