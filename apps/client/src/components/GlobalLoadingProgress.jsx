import React from "react";
import { Box, LinearProgress, Typography, styled } from "@mui/material";
import { RELEASE_VERSION } from "../api/consts";

const GlobalLoadingProgress = () => {
  return (
    <GlobalLoadingOverlay>
      <Typography variant="h6">Студентски Оброк</Typography>
      <Box width="15%" margin="10px">
        <LinearProgress color="inherit" />
      </Box>
      <Typography variant="body1">{RELEASE_VERSION}</Typography>
    </GlobalLoadingOverlay>
  );
};

const GlobalLoadingOverlay = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  zIndex: "1000",
  backgroundColor: "white",
}));

export default GlobalLoadingProgress;
