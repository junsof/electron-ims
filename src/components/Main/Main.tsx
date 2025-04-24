import "./Main.css";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Dashboard } from "../../modules/dashboard/dashboard";
import { Products } from "../../modules/inventory/products/products";
import { AppLayout } from "../../components/Layout/Layout";
import { ROUTES } from "../../constants";
import { Stocks } from "../../modules/inventory/stocks/stocks";

export const Main = () => {
  return (
    <HashRouter>
      <AppLayout>
        <Routes>
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.PRODUCTS} element={<Products />} />
          <Route path={ROUTES.STOCKS} element={<Stocks />} />
        </Routes>
      </AppLayout>
    </HashRouter>
  );
};
