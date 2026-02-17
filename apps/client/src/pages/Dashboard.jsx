import { Grid, styled, useMediaQuery } from "@mui/material";
import React, { useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import { createTheme, ThemeProvider } from "@mui/material";
import ProductsList from "../components/ProductsList";
import VendorsList from "../components/VendorsList";
import DashboardToolbar from "../components/DashboardToolbar";
import ProductSearchBar from "../components/ProductSearchBar";

const Dashboard = () => {
  const theme = createTheme();
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);

  const handleProductSearchChange = (event) => {
    setProductSearchTerm(event.target.value);
  };

  const handleVendorSearchChange = (event) => {
    setVendorSearchTerm(event.target.value);
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid>
        <DashboardHeader theme={theme} />
        <DashboardToolbar
          theme={theme}
          handleSearchChange={handleVendorSearchChange}
        />
        <VendorsList
          theme={theme}
          searchTerm={vendorSearchTerm}
          setProducts={setProducts}
          vendors={vendors}
          setVendors={setVendors}
        />
        <ToolbarGrid>
          <ProductSearchBar
            theme={theme}
            handleSearchChange={handleProductSearchChange}
            placeholder="Search products..."
          />
        </ToolbarGrid>
        <ProductsList
          theme={theme}
          searchTerm={productSearchTerm}
          products={products}
          setProducts={setProducts}
        />
      </Grid>
    </ThemeProvider>
  );
};

const ToolbarGrid = styled(Grid)(({ theme }) => ({
  display: "flex",
  justifyContent: useMediaQuery(theme.breakpoints.down("sm"))
    ? "center"
    : "space-between",
  alignItems: useMediaQuery(theme.breakpoints.down("sm")) && "center",
}));

export default Dashboard;