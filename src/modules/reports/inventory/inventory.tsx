import React, { useState, useEffect, useCallback, useRef } from "react";
import { Layout, Card, Row, Col, Spin, Alert, Table } from "antd";
import {
  BarChartOutlined,
  PrinterOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import ReactApexChart from "react-apexcharts";
import { type ApexOptions } from "apexcharts";
import type { ColumnType } from "antd/es/table";

const { Header, Content } = Layout;

type IProduct = Window["types"]["Product"];

// --- Helper Components ---

// Displays a single key metric with a title and value, supports an icon
const KeyMetricCard = ({
  title,
  value,
  icon,
  loading,
  valueColor,
}: {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  loading?: boolean;
  valueColor?: string; // Added prop for value color
}) => (
  <Card>
    <div style={{ display: "flex", gap: 16 }}>
      {icon && (
        <span
          style={{ fontSize: 24, color: valueColor || "rgba(0, 0, 0, 0.85)" }}
        >
          {icon}
        </span>
      )}
      <div>
        <h3 style={{ margin: 0, color: "rgba(0, 0, 0, 0.45)" }}>{title}</h3>
        {loading ? (
          <Spin size="small" />
        ) : (
          <p
            style={{
              margin: 0,
              fontSize: 20,
            }}
          >
            {value}
          </p> // Apply color
        )}
      </div>
    </div>
  </Card>
);

// --- Main Component ---
const InventoryReportPage = () => {
  const [inventoryData, setInventoryData] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<ReactApexChart | null>(null);

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const products = await window.api.getProducts();
      setInventoryData(products.map((p: any) => p.dataValues));
      const categories = await window.api.getCategories();
      setCategories(categories.map((c: any) => c.dataValues));
    } catch (err: any) {
      setError(err.message || "Failed to fetch inventory data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Data Processing for Metrics ---
  const totalProducts = inventoryData.length;
  const totalStock = inventoryData.reduce(
    (sum, product) => sum + product.stockQuantity,
    0
  );
  const lowStockThreshold = 10; // Define low stock threshold
  const lowStockProducts = inventoryData.filter(
    (product) => product.stockQuantity <= lowStockThreshold
  );
  const outOfStockProducts = inventoryData.filter(
    (product) => product.stockQuantity === 0
  );

  // --- Chart Data and Options ---
  const stockChartData = {
    series: [
      {
        name: "Stock Quantity",
        data: inventoryData.map((product) => product.stockQuantity),
      },
    ],
    categories: inventoryData.map((product) => product.name),
  };

  const stockChartOptions: ApexOptions = {
    chart: {
      type: "bar", // Or 'line', 'area', etc.
      height: 350,
      toolbar: { show: false }, // Remove toolbar to simplify
    },
    title: {
      text: "Product Stock Levels",
      align: "left",
      style: {
        fontSize: "18px",
        fontWeight: "bold",
        color: "#333",
      },
    },
    xaxis: {
      categories: stockChartData.categories,
      title: {
        text: "Product",
        style: {
          fontSize: "14px",
          color: "#666",
        },
      },
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      title: {
        text: "Stock Quantity",
        style: {
          fontSize: "14px",
          color: "#666",
        },
      },
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} units`,
      },
    },
    colors: ["#008FFB", "#2E9AFE", "#00E396", "#FEB019", "#FF4560"], // Example color palette
    dataLabels: {
      enabled: false, // Hide data labels for cleaner look,
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "60%",
      },
    },
    grid: {
      borderColor: "#e0e0e0",
      row: {
        colors: ["#f4f4f4", "#fff"], // Alternate row colors
        opacity: 0.8,
      },
      column: {
        opacity: 0,
      },
    },
  };

  // Define columns for Low Stock and Out of Stock tables
  const productTableColumns: ColumnType<IProduct>[] = [
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
    },
    {
      title: "Stock Quantity",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
    },
    {
      title: "Category",
      dataIndex: "category_id",
      key: "category_id",
      render: (category_id) =>
        categories.find((c) => c.id === category_id)?.name,
    },
  ];

  return (
    <Layout>
      <Header
        style={{
          background: "#fff",
          padding: "0 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0 }}>Inventory Report</h1>
      </Header>
      <Content style={{ padding: "24px" }}>
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <KeyMetricCard
              title="Total Products"
              value={totalProducts}
              icon={<BarChartOutlined />}
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KeyMetricCard
              title="Total Stock"
              value={totalStock}
              icon={<PrinterOutlined />}
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KeyMetricCard
              title="Low Stock Products"
              value={lowStockProducts.length}
              icon={<ExclamationCircleOutlined />}
              loading={loading}
              valueColor={lowStockProducts.length > 0 ? "#FFC107" : undefined}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KeyMetricCard
              title="Out of Stock Products"
              value={outOfStockProducts.length}
              icon={<WarningOutlined />}
              loading={loading}
              valueColor={outOfStockProducts.length > 0 ? "#FF4D4F" : undefined}
            />
          </Col>
        </Row>

        <Card style={{ marginBottom: 24 }}>
          <ReactApexChart
            options={stockChartOptions}
            series={stockChartData.series}
            type="bar"
            height={350}
            ref={chartRef}
          />
        </Card>

        <Row gutter={24} style={{ paddingBottom: 24 }}>
          <Col xs={24} md={12}>
            <Card style={{ height: "100%" }} title="Low Stock Products">
              {lowStockProducts.length > 0 ? (
                <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                  <Table
                    dataSource={lowStockProducts.slice(0, 5)} // Show only the first 5
                    columns={productTableColumns}
                    pagination={{
                      pageSize: 5,
                      total: lowStockProducts.length,
                      hideOnSinglePage: lowStockProducts.length <= 5,
                    }}
                    rowKey="id"
                  />
                </div>
              ) : (
                <p>No products are low in stock.</p>
              )}
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card style={{ height: "100%" }} title="Out of Stock Products">
              {outOfStockProducts.length > 0 ? (
                <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                  <Table
                    dataSource={outOfStockProducts.slice(0, 5)} // Show only the first 5
                    columns={productTableColumns}
                    pagination={{
                      pageSize: 5,
                      total: outOfStockProducts.length,
                      hideOnSinglePage: outOfStockProducts.length <= 5,
                    }}
                    rowKey="id"
                  />
                </div>
              ) : (
                <p>No products are out of stock.</p>
              )}
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default InventoryReportPage;
