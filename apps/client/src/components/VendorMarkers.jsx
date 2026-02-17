import React, { useEffect, useState, useMemo, useRef } from "react";
import { Marker, Popup } from "react-map-gl/maplibre";
import axios from "../api/axios";
import { Button, Typography, Box, styled } from "@mui/material";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import MapDealInfoModal from "./MapDealInfoModal";
import vendorlocationMarker from "../assets/icons/vendor_location_marker.svg";
import useSupercluster from "use-supercluster";
import { useMap } from "react-map-gl/maplibre";
import useMapPitch from "../hooks/useMapPitch";

const VendorMarkers = ({ onVendorLocation, isDisabledRoutingButton }) => {
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [_, setError] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [zoom, setZoom] = useState(16);
  const pitch = useMapPitch();
  const { current: map } = useMap();
  const updateTimeoutRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    const updateBoundsAndZoom = () => {
      setBounds(map.getBounds().toArray().flat());
      setZoom(map.getZoom());
    };

    const throttledBoundsUpdate = () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(updateBoundsAndZoom, 150);
    };

    updateBoundsAndZoom();

    map.on("moveend", throttledBoundsUpdate);
    map.on("zoomend", updateBoundsAndZoom);

    return () => {
      map.off("moveend", throttledBoundsUpdate);
      map.off("zoomend", updateBoundsAndZoom);
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [map]);

  const verticalOffset = useMemo(() => pitch * 0.8, [pitch]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    setIsLoading(true);

    const fetchVendors = async () => {
      try {
        const response = await axios.get("/vendors", {
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });
        if (isMounted) {
          setVendors(response.data);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setError(error.response?.data?.message || "Error loading vendors");
          setIsLoading(false);
        }
      }
    };

    fetchVendors();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const points = useMemo(
    () =>
      vendors.map((vendor, index) => ({
        type: "Feature",
        properties: {
          cluster: false,
          vendorId: index,
          vendor: vendor,
        },
        geometry: {
          type: "Point",
          coordinates: [vendor.location[1], vendor.location[0]],
        },
      })),
    [vendors],
  );

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom,
    options: {
      radius: 50,
      maxZoom: 15,
      minZoom: 0,
      extent: 512,
      nodeSize: 64,
    },
  });

  return (
    <>
      {!isLoading &&
        clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount } =
            cluster.properties;

          if (isCluster) {
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                longitude={longitude}
                latitude={latitude}
                anchor="center"
              >
                <ClusterMarker
                  onClick={() => {
                    const expansionZoom = Math.min(
                      supercluster.getClusterExpansionZoom(cluster.id),
                      20,
                    );
                    map?.flyTo({
                      center: [longitude, latitude],
                      zoom: expansionZoom,
                      duration: 300,
                    });
                  }}
                  pointCount={pointCount}
                >
                  {pointCount}
                </ClusterMarker>
              </Marker>
            );
          }

          const vendor = cluster.properties.vendor;
          return (
            <React.Fragment key={`vendor-${cluster.properties.vendorId}`}>
              <Marker
                longitude={longitude}
                latitude={latitude}
                anchor="bottom"
                onClick={() => setSelectedVendor(vendor)}
              >
                <VendorMarkerImage
                  src={vendorlocationMarker}
                  alt="vendor marker"
                  $verticalOffset={verticalOffset}
                />
              </Marker>

              {selectedVendor === vendor && (
                <Popup
                  longitude={longitude}
                  latitude={latitude}
                  anchor="bottom"
                  onClose={() => setSelectedVendor(null)}
                  closeOnClick={false}
                  offset={[0, -95 + verticalOffset * 1.5]}
                  maxWidth="250px"
                >
                  <VendorPopup>
                    <Typography variant="h5" textAlign="center">
                      {vendor.name}
                    </Typography>
                    <img
                      src={vendor?.image?.data}
                      alt={vendor?.image?.title || "coverImage"}
                      className="vendor-cover-image"
                    />
                    <Box>
                      <MapDealInfoModal deals={vendor.deals} />
                      <GetDirectionsButton
                        disabled={isDisabledRoutingButton}
                        fullWidth
                        variant="contained"
                        onClick={() => onVendorLocation([longitude, latitude])}
                      >
                        Добиј насоки
                        <ArrowRightAltIcon sx={{ marginLeft: 0.5 }} />
                      </GetDirectionsButton>
                    </Box>
                  </VendorPopup>
                </Popup>
              )}
            </React.Fragment>
          );
        })}
    </>
  );
};

const ClusterMarker = styled("div")(({ pointCount }) => ({
  height: "2rem",
  width: "2rem",
  borderRadius: "50%",
  backgroundColor: "crimson",
  color: "white",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: 900,
  fontSize: "1rem",
  cursor: "pointer",
  border: "2px solid white",
  boxShadow: "0 0 10px rgba(0,0,0,0.3)",
  transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
  animation: "clusterPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
  "&:hover": {
    transform: "scale(1.15)",
    boxShadow:
      "0 0 20px rgba(220, 20, 60, 0.8), 0 0 30px rgba(220, 20, 60, 0.4)",
  },
  "&:active": {
    transform: "scale(0.95)",
  },
  ...(pointCount > 10 && {
    height: "2.5rem",
    width: "2.5rem",
    fontSize: "1.1rem",
  }),
  ...(pointCount > 50 && {
    height: "3rem",
    width: "3rem",
    fontSize: "1.2rem",
  }),
  "@keyframes clusterPop": {
    "0%": { opacity: 0, transform: "scale(0)" },
    "50%": { transform: "scale(1.1)" },
    "100%": { opacity: 1, transform: "scale(1)" },
  },
}));

const VendorMarkerImage = styled("img")(({ $verticalOffset = 0 }) => ({
  width: 38,
  height: 95,
  display: "block",
  cursor: "pointer",
  transform: `translateY(${$verticalOffset}px)`,
  transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
  animation: "markerDrop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
  "&:hover": {
    transform: `translateY(${$verticalOffset}px) scale(1.1)`,
    filter:
      "drop-shadow(0 0 8px rgba(220, 20, 60, 0.8)) drop-shadow(0 0 12px rgba(220, 20, 60, 0.4))",
  },
  "&:active": {
    transform: `translateY(${$verticalOffset}px) scale(0.95)`,
  },
  "@keyframes markerDrop": {
    "0%": {
      opacity: 0,
      transform: `translateY(${$verticalOffset - 50}px) scale(0.3)`,
    },
    "50%": {
      transform: `translateY(${$verticalOffset + 5}px) scale(1.05)`,
    },
    "100%": {
      opacity: 1,
      transform: `translateY(${$verticalOffset}px) scale(1)`,
    },
  },
}));

const VendorPopup = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexDirection: "column",
  width: 200,
  height: 350,
  margin: "10px 0",
  "& .vendor-cover-image": {
    width: "90%",
    maxWidth: "180px",
    height: "auto",
    maxHeight: "180px",
    objectFit: "cover",
    margin: "0 auto",
    display: "block",
  },
}));

const GetDirectionsButton = styled(Button)(({ theme }) => ({
  backgroundColor: "black",
  textTransform: "none",
  color: "white",
  marginTop: 15,
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
}));

export default VendorMarkers;
