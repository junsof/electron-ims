import React, { useState } from "react";
import {
  BarChartOutlined,
  BoxPlotOutlined,
  InboxOutlined,
  PieChartOutlined,
  ShoppingOutlined,
  TagOutlined,
  TeamOutlined,
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
    getItem("Categories", ROUTES.CATEGORIES, <InboxOutlined />),
  ]),
  getItem("Purchases", "2", <TagOutlined />, [
    getItem("Purchase Orders", ROUTES.PURCHASE_ORDERS, <InboxOutlined />),
    getItem("Suppliers", ROUTES.SUPPLIERS, <TeamOutlined />),
  ]),
  getItem("Sales", "4", <ShoppingOutlined />, [
    getItem("Sales Orders", ROUTES.SALES_ORDERS, <InboxOutlined />),
    getItem("Customers", ROUTES.CUSTOMERS, <TeamOutlined />),
  ]),
  getItem("Reports", "18", <BarChartOutlined />, [
    getItem("Sales Reports", ROUTES.SALES_REPORTS, <BarChartOutlined />),
    getItem(
      "Inventory Reports",
      ROUTES.INVENTORY_REPORTS,
      <BarChartOutlined />
    ),
  ]),
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
        width={230}
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
