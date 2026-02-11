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

  const startWatching = (highAccuracy) => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const options = {
      enableHighAccuracy: highAccuracy,
      timeout: highAccuracy ? 5000 : 10000,
      maximumAge: 0,
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos = [latitude, longitude];

        setPosition(newPos);
        onUserLocation(newPos);

        if (firstFlyBy.current) {
          clearTimeout(deadlineTimerRef.current);
          setIsLoading(false);
          map.flyTo(newPos, map.getZoom());
          firstFlyBy.current = false;
        }
      },
      (error) => {
        console.warn(
          `Location error (HighAccuracy: ${highAccuracy}):`,
          error.message,
        );

        if (
          highAccuracy &&
          (error.code === error.TIMEOUT ||
            error.code === error.POSITION_UNAVAILABLE)
        ) {
          console.log("Switching to low accuracy fallback...");
          startWatching(false);
        } else {
          if (firstFlyBy.current) {
            clearTimeout(deadlineTimerRef.current);
            setIsLoading(false);
            disableRouting();
          }
        }
      },
      options,
    );
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setIsLoading(false);
      disableRouting();
      return;
    }

    setIsLoading(true);

    deadlineTimerRef.current = setTimeout(() => {
      if (firstFlyBy.current) {
        console.log("Deadline reached: Showing map anyway.");
        setIsLoading(false);
        disableRouting();
      }
    }, 8000);

    startWatching(true);

    return () => {
      if (watchIdRef.current !== null)
        navigator.geolocation.clearWatch(watchIdRef.current);
      if (deadlineTimerRef.current) clearTimeout(deadlineTimerRef.current);
    };
  }, [map]);

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
