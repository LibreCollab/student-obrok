import React from "react";
import { Routes, Route } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import RequireAuth from "./RequireAuth";
import AddOrEditDealForm from "../pages/AddOrEditDealForm";
import Layout from "./Layout";
import PersistLogin from "./PersistLogin";
import AddOrEditVendorForm from "../pages/AddOrEditVendorForm";
import VendorDeals from "../pages/VendorDeals";
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
              path="/dashboard/deal/:dealId"
              element={<AddOrEditDealForm />}
            />
            <Route
              path="/dashboard/deals/:vendorId"
              element={<VendorDeals />}
            />
            <Route path="/dashboard/deal" element={<AddOrEditDealForm />} />
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
