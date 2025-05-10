import "./Main.css";
import { HashRouter, Route, Routes } from "react-router-dom";
import Dashboard from "../../modules/dashboard/dashboard";
import { Products } from "../../modules/inventory/products/products";
import { AppLayout } from "../../components/Layout/Layout";
import { ROUTES } from "../../constants";
import { CategoryPage } from "../../modules/inventory/categories/categories";
import { SupplierPage } from "../../modules/purchases/suppliers/suppliers";
import PurchaseOrderPage from "../../modules/purchases/orders/orders";
import { CustomerPage } from "../../modules/sales/customers/customers";
import SalesOrderPage from "../../modules/sales/orders/orders";
import InventoryReportPage from "../../modules/reports/inventory/inventory";
import SalesReportPage from "../../modules/reports/sales/sales";

export const Main = () => {
  return (
    <HashRouter>
      <AppLayout>
        <Routes>
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.PRODUCTS} element={<Products />} />
          <Route path={ROUTES.CATEGORIES} element={<CategoryPage />} />

          <Route
            path={ROUTES.PURCHASE_ORDERS}
            element={<PurchaseOrderPage />}
          />
          <Route path={ROUTES.SUPPLIERS} element={<SupplierPage />} />
          <Route path={ROUTES.SALES_ORDERS} element={<SalesOrderPage />} />
          <Route path={ROUTES.CUSTOMERS} element={<CustomerPage />} />
          <Route
            path={ROUTES.INVENTORY_REPORTS}
            element={<InventoryReportPage />}
          />
          <Route path={ROUTES.SALES_REPORTS} element={<SalesReportPage />} />
        </Routes>
      </AppLayout>
    </HashRouter>
  );
};
