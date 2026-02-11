import React, { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../assets/map.css";
import LocateUser from "../components/LocateUser";
import RoutingEngine from "../components/RoutingEngine";
import { Box, Button, styled } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GlobalLoadingProgress from "../components/GlobalLoadingProgress";
import CreditMarker from "../components/CreditMarker";
import VendorMarkers from "../components/VendorMarkers";
import useAuth from "../hooks/useAuth";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";

const Map = () => {
  const position = [42.00430265307896, 21.409471852749466];
  const [userLocation, setUserLocation] = useState(null);
  const [_, setVendorLocation] = useState(null);
  const [isDisabledRoutingButton, changeIsDisabledRoutingButton] =
    useState(false);
  const [route, setRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { auth } = useAuth();
  const navigate = useNavigate();

  const handleUserLocation = (location) => {
    setUserLocation(location);
  };

  const handleVendorLocation = (location) => {
    setRoute({ start: userLocation, end: location });
    setVendorLocation(location);
    changeIsDisabledRoutingButton(true);
  };

  const handleCancelRoute = () => {
    setRoute(null);
    setVendorLocation(null);
    changeIsDisabledRoutingButton(false);
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  const disableRouting = () => {
    changeIsDisabledRoutingButton(true);
  };

  return (
    <Box className="map-container">
      {isLoading && <GlobalLoadingProgress />}
      <MapContainer
        center={position}
        minZoom={10}
        zoom={16}
        maxZoom={18}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tiles.stadiamaps.com/tiles/stamen_toner_dark/{z}/{x}/{y}{r}.{ext}"
          ext="png"
        />
        <VendorMarkers
          onVendorLocation={handleVendorLocation}
          isDisabledRoutingButton={isDisabledRoutingButton}
        />
        <CreditMarker />
        <LocateUser
          onUserLocation={handleUserLocation}
          setIsLoading={setIsLoading}
          disableRouting={disableRouting}
        />
        {route && (
          <>
            <CancelRouteButton variant="contained" onClick={handleCancelRoute}>
              <CloseIcon sx={{ marginRight: "5px" }} /> Откажи ја рутата
            </CancelRouteButton>
            <RoutingEngine start={route?.start} end={route?.end} />
          </>
        )}
        {auth?.accessToken && !isLoading && (
          <DashboardButton variant="contained" onClick={handleDashboardClick}>
            <HomeIcon sx={{ fontSize: 35 }} />
          </DashboardButton>
        )}
      </MapContainer>
    </Box>
  );
};

const CancelRouteButton = styled(Button)(({ theme }) => ({
  position: "absolute",
  top: "10px",
  right: "10px",
  zIndex: 1000,
  backgroundColor: "crimson",
  textTransform: "none",
  color: "white",

  "&:hover": {
    backgroundColor: "rgba(220, 20, 60, 0.8)",
  },
}));

const DashboardButton = styled(Button)(({ theme }) => ({
  position: "absolute",
  bottom: "10px",
  left: "10px",
  zIndex: 1000,
  textTransform: "none",
  backgroundColor: "white",
  color: "black",
  padding: 10,

  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
}));

export default Map;
