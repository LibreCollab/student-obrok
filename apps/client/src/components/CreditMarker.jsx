import React, { useState, useMemo } from "react";
import { Marker, Popup } from "react-map-gl/maplibre";
import { Typography, Box, styled } from "@mui/material";
import creditLocationMarker from "../assets/icons/credit_location_marker.svg";
import creditPopupIcon from "../assets/icons/credit_popup.svg";
import useMapPitch from "../hooks/useMapPitch";

const CreditMarker = () => {
  const [showPopup, setShowPopup] = useState(false);
  const pitch = useMapPitch();
  const position = { lng: 21.409471852749466, lat: 42.00430265307896 };

  const verticalOffset = useMemo(() => pitch * 0.9, [pitch]);
  const popupOffset = useMemo(
    () => [0, -95 + verticalOffset * 1.5],
    [verticalOffset],
  );

  return (
    <>
      <Marker
        longitude={position.lng}
        latitude={position.lat}
        anchor="bottom"
        onClick={() => setShowPopup(!showPopup)}
      >
        <CreditMarkerImage
          src={creditLocationMarker}
          alt="credit marker"
          $verticalOffset={verticalOffset}
        />
      </Marker>

      {showPopup && (
        <Popup
          longitude={position.lng}
          latitude={position.lat}
          anchor="bottom"
          onClose={() => setShowPopup(false)}
          closeOnClick={false}
          offset={popupOffset}
        >
          <CreditPopup>
            <Typography variant="h5" textAlign="center">
              Студентски Оброк
            </Typography>
            <img
              src={creditPopupIcon}
              className="credit-popup-icon"
              alt="creditIcon"
            />
            <Typography variant="p" textAlign="left">
              <strong>Студентски Оброк</strong>, развиен од{" "}
              <strong>Мартин Трифунов</strong>, е веб апликација дизајнирана да
              помогне на студентите во наоѓањето на економични оброци за ручек
              на удобен начин. Со нудење на корисен интерфејс, ја упрости
              процедурата за наоѓање на блиски ресторани со попусти, во
              соодветство со потребите на студентите со ограничен буџет.
            </Typography>
          </CreditPopup>
        </Popup>
      )}
    </>
  );
};

const CreditMarkerImage = styled("img")(({ $verticalOffset = 0 }) => ({
  width: 38,
  height: 95,
  display: "block",
  cursor: "pointer",
  transform: `translateY(${$verticalOffset}px)`,
  filter:
    "brightness(0) saturate(100%) invert(35%) sepia(95%) saturate(5478%) hue-rotate(265deg) brightness(95%) contrast(105%)",
  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
  animation: "markerDrop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
  "&:hover": {
    transform: `translateY(${$verticalOffset}px) scale(1.1)`,
    filter: `
      brightness(0) saturate(100%) invert(35%) sepia(95%) saturate(5478%) hue-rotate(265deg) brightness(95%) contrast(105%)
      drop-shadow(0 0 8px rgba(139, 92, 246, 0.8))
      drop-shadow(0 0 12px rgba(139, 92, 246, 0.4))
    `,
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

const CreditPopup = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-around",
  flexDirection: "column",
  width: 200,
  height: 450,
  "& .credit-popup-icon": {
    width: 100,
    height: 100,
  },
}));

export default CreditMarker;
