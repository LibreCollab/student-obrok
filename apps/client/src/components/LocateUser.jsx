import React, { useEffect, useState, useRef } from "react";
import { Marker, useMap } from "react-leaflet";
import L from "leaflet";
import myLocationMarker from "../assets/icons/my_location_marker.svg";

const LocateUser = ({ onUserLocation, setIsLoading, disableRouting }) => {
  const map = useMap();
  const [position, setPosition] = useState(null);
  const firstFlyBy = useRef(true);
  const retryCount = useRef(0);
  const maxRetries = 5;

  useEffect(() => {
    firstFlyBy.current && setIsLoading(true);

    const attemptToGetLocation = () => {
      if (retryCount.current < maxRetries) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setPosition([latitude, longitude]);
            onUserLocation([latitude, longitude]);
            setIsLoading(false);
            if (firstFlyBy.current) {
              map.flyTo([latitude, longitude], map.getZoom());
              firstFlyBy.current = false;
            }
          },
          () => {
            retryCount.current += 1;
            if (retryCount.current >= maxRetries) {
              setIsLoading(false);
              disableRouting();
            }
          }
        );
      } else {
        clearInterval(intervalId);
      }
    };

    const intervalId = setInterval(attemptToGetLocation, 5000); // retry every 5 seconds

    return () => clearInterval(intervalId); // cleanup on unmount
  }, [map]);

  const userIcon = L.icon({
    iconUrl: myLocationMarker,
    iconSize: [38, 95],
    className: "white-marker"
  });

  return position === null ? null : (
    <Marker position={position} icon={userIcon} />
  );
};

export default LocateUser;
