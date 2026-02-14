import React, { useState, useRef, useCallback } from "react";
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

const INITIAL_VIEW_STATE = {
  longitude: 21.409471852749466,
  latitude: 42.00430265307896,
  zoom: 16,
  pitch: 0,
  bearing: 0,
};

const Home = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [routeStart, setRouteStart] = useState(null);
  const [routeEnd, setRouteEnd] = useState(null);
  const [routingMode, setRoutingMode] = useState("walking");
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabledRoutingButton, setIsDisabledRoutingButton] = useState(false);

  const mapRef = useRef(null);
  const { auth } = useAuth();
  const navigate = useNavigate();

  const handleUserLocation = useCallback((location) => {
    setUserLocation(location);
  }, []);

  const handleVendorLocation = useCallback(
    (location) => {
      if (!userLocation) return;
      setRouteStart([userLocation[0], userLocation[1]]);
      setRouteEnd([location[0], location[1]]);
      setIsDisabledRoutingButton(true);
    },
    [userLocation],
  );

  const handleCancelRoute = useCallback(() => {
    setRouteStart(null);
    setRouteEnd(null);
    setRoutingMode("walking");
    setIsDisabledRoutingButton(false);
  }, []);

  const handleDashboardClick = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  const disableRouting = useCallback(() => {
    setIsDisabledRoutingButton(true);
  }, []);

  const enableRouting = useCallback(() => {
    setIsDisabledRoutingButton(false);
  }, []);

  const handleSetIsLoading = useCallback((val) => {
    setIsLoading(val);
  }, []);

  const onMapLoad = useCallback(() => {
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
  }, []);

  const hasRoute = routeStart !== null && routeEnd !== null;

  return (
    <Box sx={{ width: "100%", height: "100vh", position: "relative" }}>
      {isLoading && <GlobalLoadingProgress />}
      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW_STATE}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        onLoad={onMapLoad}
        minZoom={10}
        maxZoom={18}
      >
        <LocateUser
          onUserLocation={handleUserLocation}
          setIsLoading={handleSetIsLoading}
          disableRouting={disableRouting}
          enableRouting={enableRouting}
          followUser={!hasRoute}
        />
        <CreditMarker />
        <VendorMarkers
          onVendorLocation={handleVendorLocation}
          isDisabledRoutingButton={isDisabledRoutingButton}
        />
        {hasRoute && (
          <RoutingEngine
            startLng={routeStart[0]}
            startLat={routeStart[1]}
            endLng={routeEnd[0]}
            endLat={routeEnd[1]}
            mode={routingMode}
          />
        )}
      </Map>
      {hasRoute && (
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
