import React, { useState, useEffect, useCallback, useRef } from "react";
import { Layout, Card, Row, Col, Spin, Alert, Table, Divider } from "antd";
import {
  BarChartOutlined,
  PrinterOutlined,
  LineChartOutlined,
  AreaChartOutlined,
} from "@ant-design/icons";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import moment from "moment";
import type { ColumnType } from "antd/es/table";

const { Header, Content } = Layout;

type ISalesOrder = Window["types"]["SalesOrder"];
type IProduct = Window["types"]["Product"]; // Import Product type

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
      {icon && <span style={{ fontSize: 24, color: valueColor }}>{icon}</span>}
      <div>
        <h3 style={{ margin: 0, color: "rgba(0, 0, 0, 0.45)" }}>{title}</h3>
        {loading ? (
          <Spin size="small" />
        ) : (
          <p style={{ margin: 0, fontSize: 20 }}>{value}</p>
        )}
      </div>
    </div>
  </Card>
);

const SalesReportPage = () => {
  const [salesData, setSalesData] = useState<ISalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<ReactApexChart | null>(null);

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const salesOrders = await window.api.getSalesOrders();
      setSalesData(salesOrders.map((order: any) => order.dataValues));
    } catch (err: any) {
      setError(err.message || "Failed to fetch sales data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Data Processing for Metrics ---
  const totalSales = salesData.reduce(
    (sum, order) => sum + order.total_amount,
    0
  );

  // Get orders within the last month
  const lastMonthStart = moment().subtract(1, "months").startOf("month");
  const lastMonthEnd = moment().subtract(1, "months").endOf("month");
  const lastMonthSales = salesData
    .filter((order) =>
      moment(order.order_date).isBetween(
        lastMonthStart,
        lastMonthEnd,
        undefined,
        "[]"
      )
    )
    .reduce((sum, order) => sum + order.total_amount, 0);

  const averageOrderValue =
    salesData.length > 0 ? totalSales / salesData.length : 0;

  // Find the best-selling product.
  const productQuantities: { [productId: number]: number } = {};
  salesData.forEach((order) => {
    order.products.forEach((product) => {
      productQuantities[product.product_id] =
        (productQuantities[product.product_id] || 0) + product.quantity;
    });
  });

  let bestSellingProductId: number | null = null;
  let maxQuantity = 0;
  for (const productId in productQuantities) {
    if (productQuantities[parseInt(productId)] > maxQuantity) {
      maxQuantity = productQuantities[parseInt(productId)];
      bestSellingProductId = parseInt(productId);
    }
  }

  // Get product details.  Added this to get product name.
  const getProductDetails = useCallback(
    async (productId: number): Promise<IProduct | null> => {
      try {
        const products = await window.api.getProducts();
        const product = products.find(
          (p: any) => p.dataValues.id === productId
        );
        return product ? product.dataValues : null;
      } catch (error) {
        console.error("Failed to fetch product details:", error);
        return null;
      }
    },
    []
  );

  const [bestSellingProductName, setBestSellingProductName] =
    useState<string>("N/A");

  useEffect(() => {
    if (bestSellingProductId !== null) {
      getProductDetails(bestSellingProductId).then((product) => {
        if (product) {
          setBestSellingProductName(product.name);
        }
      });
    }
  }, [bestSellingProductId, getProductDetails]);

  // --- Chart Data and Options ---
  const monthlySales: { [month: string]: number } = {};
  salesData.forEach((order) => {
    const month = moment(order.order_date).format("YYYY-MM");
    monthlySales[month] = (monthlySales[month] || 0) + order.total_amount;
  });

  const chartData = {
    series: [
      {
        name: "Sales Amount",
        data: Object.values(monthlySales),
      },
    ],
    categories: Object.keys(monthlySales),
  };

  const chartOptions: ApexOptions = {
    chart: {
      type: "line",
      height: 350,
      toolbar: { show: false },
    },
    title: {
      text: "Monthly Sales",
      align: "left",
      style: { fontSize: "18px", fontWeight: "bold" },
    },
    xaxis: {
      categories: chartData.categories,
      title: { text: "Month", style: { fontSize: "14px" } },
      labels: { style: { fontSize: "12px" } },
    },
    yaxis: {
      title: { text: "Sales Amount", style: { fontSize: "14px" } },
      labels: { style: { fontSize: "12px" } },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val?.toLocaleString("en-PK")}`,
      },
    },
    colors: ["#2E9AFE"],
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    grid: {
      borderColor: "#e0e0e0",
      row: {
        colors: ["#f4f4f4", "#fff"],
        opacity: 0.8,
      },
      column: { opacity: 0 },
    },
  };

  // Define columns for the sales data table
  const salesTableColumns: ColumnType<ISalesOrder>[] = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Customer ID",
      dataIndex: "customer_id",
      key: "customer_id",
    },
    {
      title: "Order Date",
      dataIndex: "order_date",
      key: "order_date",
      render: (text) => moment(text).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (text) => `${text?.toLocaleString("en-PK")}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
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
        <h1 style={{ margin: 0 }}>Sales Report</h1>
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
              title="Total Sales"
              value={totalSales?.toLocaleString("en-PK")}
              icon={<BarChartOutlined />}
              loading={loading}
              valueColor="#008000" // Green
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KeyMetricCard
              title="Last Month Sales"
              value={lastMonthSales?.toLocaleString("en-PK")}
              icon={<LineChartOutlined />}
              loading={loading}
              valueColor="#008000"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KeyMetricCard
              title="Average Order Value"
              value={averageOrderValue?.toLocaleString("en-PK")}
              icon={<AreaChartOutlined />}
              loading={loading}
              valueColor="#0000FF"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KeyMetricCard
              title="Best Selling Product"
              value={bestSellingProductName}
              icon={<PrinterOutlined />}
              loading={loading}
              valueColor="#800080"
            />
          </Col>
        </Row>

        <Card style={{ marginBottom: 24 }}>
          <ReactApexChart
            options={chartOptions}
            series={chartData.series}
            type="line"
            height={350}
            ref={chartRef}
          />
        </Card>

        <Card title="Sales Data">
          <Table
            dataSource={salesData}
            columns={salesTableColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
        <Divider />
      </Content>
    </Layout>
  );
};

export default SalesReportPage;
