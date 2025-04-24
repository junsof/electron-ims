import React, { useState } from "react";
import {
  BarChartOutlined,
  BoxPlotOutlined,
  CalculatorOutlined,
  FileTextOutlined,
  HistoryOutlined,
  InboxOutlined,
  LineChartOutlined,
  MoneyCollectOutlined,
  PieChartOutlined,
  ShoppingOutlined,
  TeamOutlined,
  UndoOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu } from "antd";
import { ROUTES } from "../../constants";
import { useNavigate } from "react-router-dom";

const { Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem("Dashboard", ROUTES.DASHBOARD, <PieChartOutlined />),

  getItem("Inventory", "1", <InboxOutlined />, [
    getItem("Products", ROUTES.PRODUCTS, <BoxPlotOutlined />),
    getItem("Stocks", ROUTES.STOCKS, <InboxOutlined />),
  ]),
  getItem("Purchases", "2", <InboxOutlined />, [
    getItem("Orders", ROUTES.ORDERS, <InboxOutlined />),
    getItem("Suppliers", ROUTES.SUPPLIERS, <TeamOutlined />),
  ]),
  getItem("Reports", "18", <BarChartOutlined />, [
    getItem("Sales Reports", ROUTES.SALES_REPORTS, <BarChartOutlined />),
    getItem(
      "Inventory Reports",
      ROUTES.INVENTORY_REPORTS,
      <BarChartOutlined />
    ),
  ]),
  getItem("Finance", "3", <MoneyCollectOutlined />, [
    getItem("Expenses", ROUTES.EXPENSES, <CalculatorOutlined />),
    getItem("Revenue Tracking", ROUTES.REVENUE_TRACKING, <LineChartOutlined />),
  ]),
  getItem("Billing", ROUTES.BILLING, <ShoppingOutlined />),
  getItem("Invoices", ROUTES.INVOICES, <FileTextOutlined />),
  getItem("Sales History", ROUTES.SALES_HISTORY, <HistoryOutlined />),
  getItem("Returns", ROUTES.RETURNS, <UndoOutlined />),
  getItem("Customers", ROUTES.CUSTOMERS, <UserOutlined />),
];

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          defaultSelectedKeys={["1"]}
          mode="inline"
          onClick={(e) => {
            navigate(e.key);
          }}
          items={items}
        />
      </Sider>
      <Layout className="content">{children}</Layout>
    </Layout>
  );
};
