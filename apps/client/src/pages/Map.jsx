import React, { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../assets/map.css";
import LocateUser from "../components/LocateUser";
import RoutingEngine from "../components/RoutingEngine";
import { Box, Button, styled, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GlobalLoadingProgress from "../components/GlobalLoadingProgress";
import CreditMarker from "../components/CreditMarker";
import VendorMarkers from "../components/VendorMarkers";
import useAuth from "../hooks/useAuth";
import HomeIcon from "@mui/icons-material/Home";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import { useNavigate } from "react-router-dom";

const Map = () => {
  const position = [42.00430265307896, 21.409471852749466];
  const [userLocation, setUserLocation] = useState(null);
  const [_, setVendorLocation] = useState(null);
  const [isDisabledRoutingButton, changeIsDisabledRoutingButton] =
    useState(false);
  const [route, setRoute] = useState(null);
  const [routingMode, setRoutingMode] = useState("walking");
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
    setRoutingMode("walking");
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
            <ModeSelectorContainer direction="row" spacing={1}>
              <ModeButton
                active={routingMode === "walking" ? 1 : 0}
                onClick={() => setRoutingMode("walking")}
                disabled={routingMode === "walking"}
              >
                <DirectionsWalkIcon />
              </ModeButton>
              <ModeButton
                active={routingMode === "car" ? 1 : 0}
                onClick={() => setRoutingMode("car")}
                disabled={routingMode === "car"}
              >
                <DirectionsCarIcon />
              </ModeButton>
              <ModeButton
                active={routingMode === "cycling" ? 1 : 0}
                onClick={() => setRoutingMode("cycling")}
                disabled={routingMode === "cycling"}
              >
                <DirectionsBikeIcon />
              </ModeButton>
            </ModeSelectorContainer>

            <CancelRouteButton variant="contained" onClick={handleCancelRoute}>
              <CloseIcon sx={{ marginRight: "5px" }} /> Откажи ја рутата
            </CancelRouteButton>
            <RoutingEngine
              start={route?.start}
              end={route?.end}
              mode={routingMode}
            />
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

const ModeSelectorContainer = styled(Stack)(({ theme }) => ({
  position: "absolute",
  top: "10px",
  left: "10px",
  zIndex: 1000,
  backgroundColor: "white",
  padding: "5px",
  borderRadius: "8px",
  boxShadow: "0px 2px 10px rgba(0,0,0,0.3)",
}));

const ModeButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "active",
})(({ theme, active }) => ({
  minWidth: "45px",
  height: "45px",
  borderRadius: "6px",
  color: active ? "#fff" : "#555",
  backgroundColor: active ? "crimson" : "transparent",
  border: active ? "none" : "1px solid #ddd",

  "&:disabled": {
    backgroundColor: "crimson",
    color: "white",
    opacity: 1,
  },

  "&:hover": {
    backgroundColor: active ? "crimson" : "#f5f5f5",
  },
}));

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
