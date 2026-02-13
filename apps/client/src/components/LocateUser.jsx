import React, { useEffect, useState, useRef } from "react";
import { Marker } from "react-map-gl/maplibre";

const LocateUser = ({
  mapRef,
  onUserLocation,
  setIsLoading,
  disableRouting,
}) => {
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
        const newPos = [longitude, latitude]; // MapLibre uses [lng, lat]

        setPosition(newPos);
        onUserLocation(newPos);

        if (firstFlyBy.current) {
          clearTimeout(deadlineTimerRef.current);
          setIsLoading(false);

          mapRef.current?.flyTo({
            center: newPos,
            duration: 1000,
          });

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
  }, []);

  return position === null ? null : (
    <Marker longitude={position[0]} latitude={position[1]}>
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          backgroundColor: "#4285F4",
          border: "3px solid white",
          boxShadow: "0 0 10px rgba(0,0,0,0.3)",
        }}
      />
    </Marker>
  );
};

export default LocateUser;
