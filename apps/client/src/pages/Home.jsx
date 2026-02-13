import React, { useState, useRef, useMemo } from "react";
import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Box, Button, styled, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import { useNavigate } from "react-router-dom";
import GlobalLoadingProgress from "../components/GlobalLoadingProgress";
import LocateUser from "../components/LocateUser";
import VendorMarkers from "../components/VendorMarkers";
import CreditMarker from "../components/CreditMarker";
import RoutingEngine from "../components/RoutingEngine";
import useAuth from "../hooks/useAuth";
import "../assets/map.css";

const Home = () => {
  const [viewState, setViewState] = useState({
    longitude: 21.409471852749466,
    latitude: 42.00430265307896,
    zoom: 16,
    pitch: 0,
    bearing: 0,
  });

  const [userLocation, setUserLocation] = useState(null);
  const [vendorLocation, setVendorLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [routingMode, setRoutingMode] = useState("walking");
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabledRoutingButton, setIsDisabledRoutingButton] = useState(false);

  const mapRef = useRef(null);
  const { auth } = useAuth();
  const navigate = useNavigate();

  const stablePitch = useMemo(() => {
    return Math.round(viewState.pitch / 5) * 5;
  }, [viewState.pitch]);

  const handleUserLocation = (location) => {
    setUserLocation(location);
  };

  const handleVendorLocation = (location) => {
    setRoute({ start: userLocation, end: location });
    setVendorLocation(location);
    setIsDisabledRoutingButton(true);
  };

  const handleCancelRoute = () => {
    setRoute(null);
    setVendorLocation(null);
    setRoutingMode("walking");
    setIsDisabledRoutingButton(false);
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  const disableRouting = () => {
    setIsDisabledRoutingButton(true);
  };

  const onMapLoad = () => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    if (!map.getLayer("3d-buildings")) {
      map.addLayer({
        id: "3d-buildings",
        source: "openmaptiles",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 15,
        paint: {
          "fill-extrusion-color": "#aaa",
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            15.05,
            ["get", "height"],
          ],
          "fill-extrusion-base": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            15.05,
            ["get", "min_height"],
          ],
          "fill-extrusion-opacity": 0.6,
        },
      });
    }

    map.setPitch(45);
    setViewState((prev) => ({ ...prev, pitch: 45 }));
  };

  return (
    <Box sx={{ width: "100%", height: "100vh", position: "relative" }}>
      {isLoading && <GlobalLoadingProgress />}
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        onLoad={onMapLoad}
        minZoom={10}
        maxZoom={18}
      >
        <LocateUser
          mapRef={mapRef}
          onUserLocation={handleUserLocation}
          setIsLoading={setIsLoading}
          disableRouting={disableRouting}
        />
        <CreditMarker pitch={stablePitch} />
        <VendorMarkers
          onVendorLocation={handleVendorLocation}
          isDisabledRoutingButton={isDisabledRoutingButton}
          pitch={stablePitch}
        />
        {route && (
          <RoutingEngine
            start={route.start}
            end={route.end}
            mode={routingMode}
          />
        )}
      </Map>
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
        </>
      )}
      {auth?.accessToken && !isLoading && (
        <DashboardButton variant="contained" onClick={handleDashboardClick}>
          <HomeIcon sx={{ fontSize: 35 }} />
        </DashboardButton>
      )}
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

export default Home;
