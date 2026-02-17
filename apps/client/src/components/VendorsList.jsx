import React, { useEffect, useState } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TablePagination,
  Skeleton,
  Grid,
  Card,
  CardContent,
  useMediaQuery,
  Box,
  Button,
  styled,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axios";
import DashboardImageModal from "./DashboardImageModal";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { BASE_URL } from "../api/consts";

const VendorsList = ({
  theme,
  searchTerm,
  setProducts,
  vendors,
  setVendors,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleRemoveVendor = async (vendorId) => {
    let confirmed = window.confirm(
      "Are you sure you want to remove this vendor?\nThis WILL REMOVE all of the products that are by this vendor.",
    );

    if (!confirmed) return;

    setIsLoading(true);

    try {
      await axiosPrivate.delete("/vendors", {
        data: JSON.stringify({
          id: vendorId,
        }),
      });

      const vendorsResponse = await axios.get("/vendors", {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      const productsResponse = await axios.get("/products", {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      setProducts(productsResponse.data);
      setVendors(vendorsResponse.data);
      setIsLoading(false);
    } catch (error) {
      setError(error.response?.data?.message);
      navigate("/login", { state: { from: location }, replace: true });
    }
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    setIsLoading(true);

    const fetchVendors = async () => {
      try {
        const response = await axios.get(
          "/vendors",
          {
            signal: controller.signal,
          },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          },
        );
        if (isMounted) {
          setVendors(response.data);
          // Small delay for smooth UI transition
          setTimeout(() => {
            setIsLoading(false);
          }, 100);
        }
      } catch (error) {
        setError(error.response?.data?.message);
        navigate("/login", { state: { from: location }, replace: true });
      }
    };

    fetchVendors();

    return () => {
      isMounted = false;
      setIsLoading(false);
      controller.abort();
    };
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleEditVendor = (vendorId) => {
    navigate(`/dashboard/vendor/${vendorId}`);
  };

  const handleNavigateToProducts = (vendorId) => {
    navigate(`/dashboard/products/${vendorId}`);
  };

  const searchTermInVendor = (vendor, term) => {
    return Object.values(vendor).some((value) =>
      value?.toString().toLowerCase().includes(term.toLowerCase()),
    );
  };

  const filteredVendors = vendors.filter((vendor) =>
    searchTermInVendor(vendor, searchTerm),
  );

  return (
    <>
      {isSmallScreen ? (
        <Grid container spacing={2}>
          {!isLoading
            ? filteredVendors
                .slice(page * 5, page * 5 + 5)
                .map((vendor, index) => (
                  <Grid item xs={12} key={vendor._id}>
                    <Card sx={{ marginTop: 2 }}>
                      <CardContent>
                        <Box display="flex" justifyContent="center">
                          <Typography
                            variant="h6"
                            style={{ fontWeight: "bold" }}
                          >
                            {vendor.name}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="center">
                          <Typography variant="body2">
                            <strong>Location:</strong>{" "}
                            {vendor.location.join(", ")}
                          </Typography>
                        </Box>
                        <VendorButtonsGrid>
                          <DashboardImageModal
                            variant={"contained"}
                            image={`${BASE_URL}${vendor?.image?.url}`}
                            imageTitle={vendor?.image?.title}
                            className="vendor-button"
                          />
                          <ViewVendorButton
                            variant="contained"
                            onClick={() => handleNavigateToProducts(vendor._id)}
                            disabled={
                              !vendor.products || vendor.products.length === 0
                            }
                            className="vendor-button"
                          >
                            <LocalOfferIcon sx={{ marginRight: 1 }} /> View
                          </ViewVendorButton>
                          <EditVendorButton
                            variant="contained"
                            onClick={() => handleEditVendor(vendor._id)}
                            className="vendor-button"
                          >
                            <EditIcon />
                          </EditVendorButton>
                          <RemoveVendorButton
                            variant="outlined"
                            color="inherit"
                            onClick={() => handleRemoveVendor(vendor._id)}
                            className="vendor-button"
                          >
                            <DeleteIcon />
                          </RemoveVendorButton>
                        </VendorButtonsGrid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
            : Array(Math.min(5, filteredVendors.length || 5))
                .fill()
                .map((_, index) => (
                  <Grid item xs={12} key={index}>
                    <Skeleton
                      animation="wave"
                      height={250}
                      width="100%"
                      sx={{ marginTop: -5, marginBottom: -2, padding: 0 }}
                    />
                  </Grid>
                ))}
        </Grid>
      ) : (
        <>
          {error && <Error variant="p">{error}</Error>}
          <VendorsTableContainer>
            <Table
              sx={{
                "& thead th": { backgroundColor: "#f2f2f2" },
                "& tbody tr:nth-of-type(even)": { backgroundColor: "#f2f2f2" },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "gray" }}>#</TableCell>
                  <TableCell sx={{ color: "gray" }}>Name</TableCell>
                  <TableCell sx={{ color: "gray" }}>Location</TableCell>
                  <TableCell sx={{ color: "gray" }}>Image</TableCell>
                  <TableCell sx={{ color: "gray" }}>Products</TableCell>
                  <TableCell sx={{ color: "gray", textAlign: "right" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!isLoading ? (
                  <>
                    {filteredVendors
                      .slice(page * 5, page * 5 + 5)
                      .map((vendor, index) => (
                        <TableRow key={vendor._id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{vendor.name}</TableCell>
                          <TableCell>{vendor.location.join(", ")}</TableCell>
                          <TableCell>
                            <DashboardImageModal
                              imageTitle={vendor?.image?.title}
                              image={`${BASE_URL}${vendor?.image?.url}`}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              disabled={
                                !vendor.products || vendor.products.length === 0
                              }
                              color="inherit"
                              sx={{ textTransform: "none" }}
                              onClick={() =>
                                handleNavigateToProducts(vendor._id)
                              }
                            >
                              <LocalOfferIcon sx={{ marginRight: 1 }} />
                              View
                            </Button>
                          </TableCell>
                          <TableCell style={{ textAlign: "right" }}>
                            <IconButton
                              color="inherit"
                              onClick={() => handleEditVendor(vendor._id)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="inherit"
                              onClick={() => handleRemoveVendor(vendor._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  </>
                ) : (
                  Array(Math.min(5, filteredVendors.length || 5))
                    .fill()
                    .map((_, index) => (
                      <TableRow key={index}>
                        {Array(6)
                          .fill()
                          .map((_, idx) => (
                            <TableCell key={idx}>
                              <Skeleton
                                animation="wave"
                                height={40}
                                width="100%"
                              />
                            </TableCell>
                          ))}
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={vendors.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={5}
              rowsPerPageOptions={[]}
            />
          </VendorsTableContainer>
        </>
      )}
    </>
  );
};

const VendorsTableContainer = styled(TableContainer)(() => ({
  width: "98vw",
  marginLeft: "auto",
  marginRight: "auto",
  marginTop: 20,
  borderRadius: 10,
}));

const Error = styled(Typography)(() => ({
  color: "crimson",
  width: "100%",
  display: "flex",
  justifyContent: "center",
}));

const VendorButtonsGrid = styled(Box)(() => ({
  display: "flex",
  justifyContent: "center",
  marginTop: 5,
  [`@media (min-width: 280px) and (max-width: 280px) and (min-height: 653px) and (max-height: 653px)`]:
    {
      flexWrap: "wrap",
      ".vendor-button:nth-of-type(2), .vendor-button:nth-of-type(3)": {
        marginTop: 10,
      },
    },
}));

const EditVendorButton = styled(Button)(() => ({
  backgroundColor: "black",
  marginLeft: "3vw",
  textTransform: "none",
  color: "white",
}));

const ViewVendorButton = styled(Button)(() => ({
  backgroundColor: "black",
  marginLeft: "3vw",
  textTransform: "none",
  color: "white",
}));

const RemoveVendorButton = styled(Button)(() => ({
  marginLeft: "3vw",
  textTransform: "none",
}));

export default VendorsList;
