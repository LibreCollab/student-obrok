import { ThemeProvider } from "@emotion/react";
import { Grid, createTheme, styled, useMediaQuery } from "@mui/material";
import React, { useEffect, useState } from "react";
import VendorProductsList from "../components/VendorProductsList";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axios";
import GlobalLoadingProgress from "../components/GlobalLoadingProgress";
import DashboardHeader from "../components/DashboardHeader";
import ProductSearchBar from "../components/ProductSearchBar";

const VendorProducts = () => {
  const theme = createTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [vendor, setVendor] = useState([]);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const params = useParams();
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    setIsLoading(true);

    const fetchVendor = async () => {
      try {
        const vendorResponse = await axios.get(
          `/vendors/${params.vendorId}`,
          {
            signal: controller.signal,
          },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          },
        );
        if (isMounted) {
          setVendor(vendorResponse.data);
          setProducts(vendorResponse.data.products || []);
          setIsLoading(false);
        }
      } catch (error) {
        setError(error.response?.data?.message);
        navigate("/login", { state: { from: location }, replace: true });
      }
    };

    fetchVendor();

    return () => {
      isMounted = false;
      setIsLoading(false);
      controller.abort();
    };
  }, []);

  const handleProductSearchChange = (event) => {
    setProductSearchTerm(event.target.value);
  };

  return (
    <>
      {isLoading ? (
        <GlobalLoadingProgress />
      ) : (
        <ThemeProvider theme={theme}>
          <DashboardHeader theme={theme} />
          <ToolbarGrid>
            <ProductSearchBar
              theme={theme}
              handleSearchChange={handleProductSearchChange}
              placeholder="Search products..."
            />
          </ToolbarGrid>

          <VendorProductsList
            theme={theme}
            vendor={vendor}
            setVendor={setVendor}
            products={products}
            searchTerm={productSearchTerm}
            setProducts={setProducts}
          />
        </ThemeProvider>
      )}
    </>
  );
};

const ToolbarGrid = styled(Grid)(({ theme }) => ({
  display: "flex",
  marginRight: "1vw",
  justifyContent: useMediaQuery(theme.breakpoints.down("sm"))
    ? "center"
    : "space-between",
  marginTop: !useMediaQuery(theme.breakpoints.down("sm")) && "10vh",
}));

export default VendorProducts;
