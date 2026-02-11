import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import { OSRM_URL } from "../api/consts";

const RoutingEngine = ({ start, end, mode }) => {
  const map = useMap();
  const routingControl = useRef(null);

  useEffect(() => {
    if (start && end) {
      if (routingControl.current) {
        map.removeControl(routingControl.current);
      }

      const profileMap = {
        walking: "foot",
        car: "car",
        cycling: "bicycle",
      };

      routingControl.current = L.Routing.control({
        waypoints: [L.latLng(start), L.latLng(end)],
        lineOptions: {
          styles: [{ color: "#6FA1EC", weight: 5 }],
        },
        router: L.Routing.osrmv1({
          serviceUrl: OSRM_URL,
          profile: profileMap[mode] || "foot",
        }),
        createMarker: () => null,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        show: false,
      }).addTo(map);
    }

    return () => {
      if (routingControl.current) {
        map.removeControl(routingControl.current);
      }
    };
  }, [map, start, end, mode]);
  return null;
};

export default RoutingEngine;
