import React, { useState } from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import InfoIcon from "@mui/icons-material/Info";
import { ThemeProvider } from "@emotion/react";
import { createTheme, styled, useMediaQuery } from "@mui/material";
import Pagination from "@mui/material/Pagination";
import parse from "html-react-parser";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { BASE_URL } from "../api/consts";

const MapProductInfoModal = ({ products }) => {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setPage(1);
  };
  const theme = createTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const productsPerPage = 1;
  const totalPages =
    products && products.length > 0
      ? Math.ceil(products.length / productsPerPage)
      : 0;

  const handleChange = (event, value) => {
    setPage(value);
  };

  const currentProduct = products
    ? products.slice((page - 1) * productsPerPage, page * productsPerPage)[0]
    : null;

  return (
    <ThemeProvider theme={theme}>
      <Box>
        <Button
          color="inherit"
          fullWidth
          variant="outlined"
          sx={{ textTransform: "none", width: 200 }}
          onClick={handleOpen}
          disabled={!products || products.length === 0}
        >
          <InfoIcon sx={{ marginRight: 0.5 }} /> Понуди
        </Button>
        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          open={open}
          onClose={handleClose}
          closeAfterTransition
          slots={{ backdrop: Backdrop }}
          slotProps={{
            backdrop: {
              timeout: 500,
            },
          }}
        >
          <Fade in={open}>
            <ModalContent>
              {currentProduct && (
                <Box className="modal">
                  <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                  <Box className="top-section">
                    <Typography
                      className="title"
                      variant={isSmallScreen ? "h5" : "h4"}
                      component="h2"
                      textAlign="center"
                      sx={{ marginBottom: 3 }}
                    >
                      {currentProduct.title}
                    </Typography>
                    <Box className="image-container">
                      {currentProduct.image && currentProduct.image.url ? (
                        <img
                          src={`${BASE_URL}${currentProduct.image.url}`}
                          alt={currentProduct.title}
                          className="image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <ImageIcon
                          className="image-icon"
                          sx={{ fontSize: 60, color: "gray" }}
                        />
                      )}
                    </Box>
                  </Box>
                  <Box className="middle-section">
                    <Typography
                      component="div"
                      variant="body2"
                      textAlign="left"
                      sx={{ fontSize: "14px" }}
                    >
                      {parse(currentProduct.description || "")}
                    </Typography>
                  </Box>
                  <Box className="bottom-section">
                    <Typography
                      variant="h6"
                      textAlign="center"
                      sx={{
                        marginTop: 2,
                        marginBottom: 2,
                        fontWeight: "bold",
                      }}
                    >
                      {currentProduct.price} ден.
                    </Typography>
                    {totalPages > 1 && (
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handleChange}
                        className="pagination"
                      />
                    )}
                  </Box>
                </Box>
              )}
            </ModalContent>
          </Fade>
        </Modal>
      </Box>
    </ThemeProvider>
  );
};

const ModalContent = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "40%",
  height: "80%",
  backgroundColor: "white",
  boxShadow: 24,
  padding: 40,
  borderRadius: 20,
  outline: "none",
  [theme.breakpoints.down("md")]: {
    width: "90%",
    height: "85%",
  },

  "& .modal": {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
  },
  "& .top-section": {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flexShrink: 0,
  },
  "& .image-container": {
    marginBottom: theme.spacing(2),
    display: "flex",
    justifyContent: "center",
    width: "100%",
  },
  "& .image": {
    maxWidth: "100%",
    maxHeight: "250px",
    objectFit: "contain",
    [theme.breakpoints.down("sm")]: {
      maxHeight: "150px",
    },
  },
  "& .image-icon": {
    width: "100%",
    height: "150px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  "& .middle-section": {
    flexGrow: 1,
    overflowY: "auto",
    padding: theme.spacing(1),
    borderTop: "1px solid #eee",
    borderBottom: "1px solid #eee",
  },
  "& .bottom-section": {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flexShrink: 0,
    paddingTop: theme.spacing(2),
  },
  "& .pagination": {
    display: "flex",
    justifyContent: "center",
    width: "100%",
  },
}));

export default MapProductInfoModal;
