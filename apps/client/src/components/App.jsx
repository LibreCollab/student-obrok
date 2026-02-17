import React from "react";
import { Routes, Route } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import RequireAuth from "./RequireAuth";
import AddOrEditProductForm from "../pages/AddOrEditProductForm";
import Layout from "./Layout";
import PersistLogin from "./PersistLogin";
import AddOrEditVendorForm from "../pages/AddOrEditVendorForm";
import VendorProducts from "../pages/VendorProducts";
import Home from "../pages/Home";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route element={<PersistLogin />}>
          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/dashboard/product/:productId"
              element={<AddOrEditProductForm />}
            />
            <Route
              path="/dashboard/products/:vendorId"
              element={<VendorProducts />}
            />
            <Route
              path="/dashboard/product"
              element={<AddOrEditProductForm />}
            />
            <Route
              path="/dashboard/vendor/:vendorId"
              element={<AddOrEditVendorForm />}
            />
            <Route path="/dashboard/vendor" element={<AddOrEditVendorForm />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
