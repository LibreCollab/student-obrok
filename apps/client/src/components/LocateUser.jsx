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

  const onUserLocationRef = useRef(onUserLocation);
  const setIsLoadingRef = useRef(setIsLoading);
  const disableRoutingRef = useRef(disableRouting);
  const mapRefRef = useRef(mapRef);

  useEffect(() => {
    onUserLocationRef.current = onUserLocation;
  }, [onUserLocation]);
  useEffect(() => {
    setIsLoadingRef.current = setIsLoading;
  }, [setIsLoading]);
  useEffect(() => {
    disableRoutingRef.current = disableRouting;
  }, [disableRouting]);
  useEffect(() => {
    mapRefRef.current = mapRef;
  }, [mapRef]);

  const lastReportedPos = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setIsLoadingRef.current(false);
      disableRoutingRef.current();
      return;
    }

    setIsLoadingRef.current(true);

    deadlineTimerRef.current = setTimeout(() => {
      if (firstFlyBy.current) {
        console.log("Deadline reached: Showing map anyway.");
        setIsLoadingRef.current(false);
        disableRoutingRef.current();
      }
    }, 8000);

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
          const newPos = [longitude, latitude];

          setPosition(newPos);

          // Only notify parent if moved > 15m (prevents cascade re-renders)
          const prev = lastReportedPos.current;
          if (!prev || haversineDistance(prev, newPos) > 15) {
            lastReportedPos.current = newPos;
            onUserLocationRef.current(newPos);
          }

          if (firstFlyBy.current) {
            clearTimeout(deadlineTimerRef.current);
            setIsLoadingRef.current(false);
            lastReportedPos.current = newPos;
            onUserLocationRef.current(newPos);

            mapRefRef.current?.current?.flyTo({
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
              setIsLoadingRef.current(false);
              disableRoutingRef.current();
            }
          }
        },
        options,
      );
    };

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

// Haversine distance in meters (Don't ask me to explain this pls)
function haversineDistance([lng1, lat1], [lng2, lat2]) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default LocateUser;
