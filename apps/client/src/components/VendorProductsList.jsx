import React, { useState } from "react";
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
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "../api/axios";
import DashboardImageModal from "./DashboardImageModal";
import { BASE_URL } from "../api/consts";

const VendorProductsList = ({ theme, searchTerm, products, setProducts }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();

  const handleRemoveProduct = async (productId) => {
    let confirmed = window.confirm(
      "Are you sure you want to remove this product?",
    );

    if (!confirmed) return;

    setIsLoading(true);

    try {
      await axiosPrivate.delete("/products", {
        data: JSON.stringify({
          id: productId,
        }),
      });

      const vendorResponse = await axios.get(`/vendors/${params.vendorId}`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      setProducts(vendorResponse.data.products || []);
      setIsLoading(false);
    } catch (error) {
      setError(error.response?.data?.message);
      navigate("/login", { state: { from: location }, replace: true });
      setIsLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleEditProduct = (productId) => {
    navigate(`/dashboard/product/${productId}`);
  };

  const searchTermInProduct = (product, term) => {
    return Object.values(product).some((value) =>
      value?.toString().toLowerCase().includes(term.toLowerCase()),
    );
  };

  const filteredProducts = products.filter((product) =>
    searchTermInProduct(product, searchTerm),
  );

  return (
    <>
      {isSmallScreen ? (
        <Grid container spacing={2}>
          {!isLoading
            ? filteredProducts
                .slice(page * 5, page * 5 + 5)
                .map((product, index) => (
                  <Grid item xs={12} key={product._id}>
                    <Card sx={{ marginTop: 2 }}>
                      <CardContent>
                        <Box display="flex" justifyContent="center">
                          <Typography
                            variant="h6"
                            style={{ fontWeight: "bold" }}
                          >
                            {product.title}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="center">
                          <Typography variant="body2">
                            <strong>Price: </strong>
                            {product.price}
                          </Typography>
                        </Box>
                        <Box
                          display="flex"
                          justifyContent="center"
                          marginTop={2}
                        >
                          <DashboardImageModal
                            variant={"contained"}
                            image={
                              product.image
                                ? `${BASE_URL}${product.image.url}`
                                : ""
                            }
                            imageTitle={product.image?.title || "Product Image"}
                          />
                          <EditButton
                            variant="contained"
                            onClick={() => handleEditProduct(product._id)}
                          >
                            <EditIcon />
                          </EditButton>
                          <RemoveButton
                            variant="outlined"
                            color="inherit"
                            onClick={() => handleRemoveProduct(product._id)}
                          >
                            <DeleteIcon />
                          </RemoveButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
            : Array(Math.min(5, filteredProducts.length || 5))
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
          <TableWrapper>
            <Table
              sx={{
                "& thead th": { backgroundColor: "#f2f2f2" },
                "& tbody tr:nth-of-type(even)": { backgroundColor: "#f2f2f2" },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "gray" }}>#</TableCell>
                  <TableCell sx={{ color: "gray" }}>Title</TableCell>
                  <TableCell sx={{ color: "gray" }}>Price</TableCell>
                  <TableCell sx={{ color: "gray" }}>Image</TableCell>
                  <TableCell sx={{ color: "gray", textAlign: "right" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!isLoading ? (
                  <>
                    {filteredProducts
                      .slice(page * 5, page * 5 + 5)
                      .map((product, index) => (
                        <TableRow key={product._id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{product.title}</TableCell>
                          <TableCell>{product.price}</TableCell>
                          <TableCell>
                            <DashboardImageModal
                              imageTitle={
                                product.image?.title || "Product Image"
                              }
                              image={
                                product.image
                                  ? `${BASE_URL}${product.image.url}`
                                  : ""
                              }
                            />
                          </TableCell>
                          <TableCell style={{ textAlign: "right" }}>
                            <IconButton
                              color="inherit"
                              onClick={() => handleEditProduct(product._id)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="inherit"
                              onClick={() => handleRemoveProduct(product._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  </>
                ) : (
                  Array(Math.min(5, filteredProducts.length || 5))
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
              count={products.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={5}
              rowsPerPageOptions={[]}
            />
          </TableWrapper>
        </>
      )}
    </>
  );
};

const TableWrapper = styled(TableContainer)(() => ({
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

const EditButton = styled(Button)(() => ({
  backgroundColor: "black",
  marginLeft: "3vw",
  textTransform: "none",
  color: "white",
}));

const RemoveButton = styled(Button)(() => ({
  marginLeft: "3vw",
  textTransform: "none",
}));

export default VendorProductsList;
