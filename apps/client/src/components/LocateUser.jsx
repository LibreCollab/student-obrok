import React, { useEffect, useState, useRef } from "react";
import { Marker, useMap } from "react-leaflet";
import L from "leaflet";
import myLocationMarker from "../assets/icons/my_location_marker.svg";

const LocateUser = ({ onUserLocation, setIsLoading, disableRouting }) => {
  const map = useMap();
  const [position, setPosition] = useState(null);
  const firstFlyBy = useRef(true);
  const watchIdRef = useRef(null);
  const deadlineTimerRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setIsLoading(false);
      disableRouting();
      return;
    }

    setIsLoading(true);

    deadlineTimerRef.current = setTimeout(() => {
      if (firstFlyBy.current) {
        console.log("Deadline reached: Showing map without user location.");
        setIsLoading(false);
        disableRouting();
      }
    }, 7000);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos = [latitude, longitude];

        setPosition(newPos);
        onUserLocation(newPos);

        if (firstFlyBy.current) {
          clearTimeout(deadlineTimerRef.current)
          setIsLoading(false);
          map.flyTo(newPos, map.getZoom());
          firstFlyBy.current = false;
        }
      },
      (error) => {
        console.warn("Geolocation error:", error.message);
        clearTimeout(deadlineTimerRef.current);
        setIsLoading(false);
        disableRouting();
      },
      options,
    );

    return () => {
      if (watchIdRef.current !== null)
        navigator.geolocation.clearWatch(watchIdRef.current);
      if (deadlineTimerRef.current) clearTimeout(deadlineTimerRef.current);
    };
  }, [map, onUserLocation, setIsLoading, disableRouting]);

  const userIcon = L.icon({
    iconUrl: myLocationMarker,
    iconSize: [38, 95],
    className: "white-marker",
    iconAnchor: [19, 95],
  });

  return position === null ? null : (
    <Marker position={position} icon={userIcon} />
  );
};

export default LocateUser;
