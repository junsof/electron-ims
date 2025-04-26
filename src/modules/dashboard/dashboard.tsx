import React, { useState, useEffect, useCallback, useRef } from "react";
import { Layout, Card, Row, Col, Spin, Alert } from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DollarCircleOutlined,
  ShoppingCartOutlined,
  BoxPlotOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import moment from "moment";

const { Header, Content } = Layout;

type ISalesOrder = Window["types"]["SalesOrder"];
type IProduct = Window["types"]["Product"];

// --- Helper Components ---
const KeyMetricCard = ({
  title,
  value,
  icon,
  loading,
  valueColor,
  trend,
  trendValue,
}: {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  loading?: boolean;
  valueColor?: string;
  trend?: "up" | "down";
  trendValue?: string;
}) => (
  <Card>
    <div style={{ display: "flex", gap: 16 }}>
      {icon && <span style={{ fontSize: 24, color: valueColor }}>{icon}</span>}
      <div>
        <h3 style={{ margin: 0, color: "rgba(0, 0, 0, 0.45)" }}>{title}</h3>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {loading ? (
            <Spin size="small" />
          ) : (
            <p style={{ margin: 0, fontSize: 20 }}>
              {value?.toLocaleString("en-PK")}
            </p>
          )}
          {trend && trendValue && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: 4,
                fontSize: 12,
                color: trend === "up" ? "green" : "red",
              }}
            >
              {trend === "up" ? (
                <ArrowUpOutlined style={{ marginRight: 4 }} />
              ) : (
                <ArrowDownOutlined style={{ marginRight: 4 }} />
              )}
              {trendValue}
            </div>
          )}
        </div>
      </div>
    </div>
  </Card>
);

const DashboardPage = () => {
  const [salesData, setSalesData] = useState<ISalesOrder[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<ReactApexChart | null>(null);
  const [topSellingProductsChartData, setTopSellingProductsChartData] =
    useState<{
      series: { name: string; data: number[] }[];
      categories: string[];
    }>({
      series: [{ name: "Quantity Sold", data: [] }],
      categories: [],
    });

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const salesOrders = await window.api.getSalesOrders();
      const productsData = await window.api.getProducts();
      setSalesData(salesOrders.map((order: any) => order.dataValues));
      setProducts(productsData.map((p: any) => p.dataValues));
    } catch (err: any) {
      setError(err.message || "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Data Processing for Metrics ---
  const currentMonthSales = salesData
    .filter((order) => moment(order.order_date).isSame(moment(), "month"))
    .reduce((sum, order) => sum + order.total_amount, 0);

  const totalProducts = products.length;
  const totalAvailableStock = products.reduce(
    (sum, product) => sum + product.stock_quantity,
    0
  );
  const totalWorthOfStock = products.reduce(
    (sum, product) => sum + product.stock_quantity * product.cost_price,
    0
  );

  let totalCost = 0;
  salesData.forEach((order) => {
    order.products.forEach((orderedProduct) => {
      const product = products.find((p) => p.id === orderedProduct.product_id);
      if (product) {
        totalCost += product.cost_price * orderedProduct.quantity;
      }
    });
  });

  // --- Monthly Sales Growth Trend Chart Data (Last 12 Months) ---
  const monthlySalesData: { [month: string]: number } = {};
  const last12Months: string[] = [];
  const now = moment();

  for (let i = 11; i >= 0; i--) {
    last12Months.push(now.clone().subtract(i, "months").format("YYYY-MM"));
  }

  // Initialize monthlySalesData with 0 for all last 12 months
  last12Months.forEach((month) => {
    monthlySalesData[month] = 0;
  });

  salesData.forEach((order) => {
    const monthYear = moment(order.order_date).format("YYYY-MM");
    if (monthlySalesData.hasOwnProperty(monthYear)) {
      monthlySalesData[monthYear] += order.total_amount;
    }
  });

  const sortedLast12Months = last12Months.sort(); // Ensure chronological order
  const monthlySalesValues = sortedLast12Months.map(
    (month) => monthlySalesData[month] || 0
  );

  const salesGrowthData = monthlySalesValues.map(
    (currentMonthSale, index, array) => {
      if (index > 0 && array[index - 1] !== 0) {
        return ((currentMonthSale - array[index - 1]) / array[index - 1]) * 100;
      }
      return 0; // No growth for the first month or if the previous month had no sales
    }
  );

  const salesGrowthChartData = {
    series: [
      {
        name: "Sales Growth (%)",
        data: salesGrowthData,
      },
    ],
    categories: sortedLast12Months.map((month) => moment(month).format("MMM")),
  };

  const salesGrowthChartOptions: ApexOptions = {
    chart: {
      type: "line",
      height: 320,
      toolbar: { show: false },
    },
    title: {
      text: "Monthly Sales Growth (Last 12 Months)",
      align: "left",
      style: { fontSize: "16px", fontWeight: "bold" },
    },
    xaxis: {
      categories: salesGrowthChartData.categories,
      title: { text: "Month", style: { fontSize: "12px" } },
      labels: { style: { fontSize: "10px" } },
    },
    yaxis: {
      title: { text: "Growth (%)", style: { fontSize: "12px" } },
      labels: {
        formatter: (val: number) => `${val?.toLocaleString("en-PK")}%`,
        style: { fontSize: "10px" },
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val?.toLocaleString("en-PK")}%`,
      },
    },
    colors: ["#2979ff"],
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 2,
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

  // --- Top Selling Products Chart ---
  const productQuantities: { [productId: number]: number } = {};
  salesData.forEach((order) => {
    order.products.forEach((product) => {
      productQuantities[product.product_id] =
        (productQuantities[product.product_id] || 0) + product.quantity;
    });
  });

  const sortedProductQuantities = Object.entries(productQuantities)
    .sort(([, quantityA], [, quantityB]) => quantityB - quantityA)
    .slice(0, 5); // Get top 5 products

  const getProductDetails = useCallback(
    async (productId: number): Promise<IProduct | null> => {
      try {
        const product = products.find((p: any) => p.id === productId);
        return product ? product : null;
      } catch (error) {
        console.error("Failed to fetch product details:", error);
        return null;
      }
    },
    [products]
  );

  useEffect(() => {
    const fetchProductNames = async () => {
      const names: string[] = [];
      const quantities: number[] = [];

      await Promise.all(
        sortedProductQuantities.map(async ([productId, quantity]) => {
          const product = await getProductDetails(parseInt(productId));
          if (product) {
            names.push(product.name);
            quantities.push(quantity);
          } else {
            names.push(`Product ID ${productId}`); // Fallback
            quantities.push(quantity);
          }
        })
      );

      // Update the chart data only after all product details are fetched
      setTopSellingProductsChartData({
        series: [{ name: "Quantity Sold", data: quantities }],
        categories: names,
      });
    };

    if (sortedProductQuantities?.length > 0) {
      fetchProductNames();
    } else {
      // Reset chart data if there are no top selling products
      setTopSellingProductsChartData({
        series: [{ name: "Quantity Sold", data: [] }],
        categories: [],
      });
    }
  }, [
    sortedProductQuantities?.length,
    getProductDetails,
    setTopSellingProductsChartData,
  ]);

  const topSellingProductsChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 320,
      toolbar: { show: false },
    },
    title: {
      text: "Top 5 Selling Products",
      align: "left",
      style: { fontSize: "16px", fontWeight: "bold" },
    },
    xaxis: {
      categories: topSellingProductsChartData.categories,
      title: { text: "Product", style: { fontSize: "12px" } },
      labels: { style: { fontSize: "10px" } },
    },
    yaxis: {
      title: { text: "Quantity Sold", style: { fontSize: "12px" } },
      labels: { style: { fontSize: "10px" } },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} Units`,
      },
    },
    colors: ["#f44336", "#e65100", "#ff6f00", "#ff8f00", "#ffa000"],
    dataLabels: { enabled: false },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "50%",
      },
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
        <h1 style={{ margin: 0 }}>Dashboard</h1>
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
              title="Current Month Sales"
              value={currentMonthSales?.toLocaleString("en-PK")}
              icon={<DollarCircleOutlined />}
              loading={loading}
              valueColor="#008000"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KeyMetricCard
              title="Total Products"
              value={totalProducts}
              icon={<ShoppingCartOutlined />}
              loading={loading}
              valueColor="#3b82f6"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KeyMetricCard
              title="Total Available Stock"
              value={totalAvailableStock}
              icon={<BoxPlotOutlined />}
              loading={loading}
              valueColor="#faad14"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KeyMetricCard
              title="Stock Worth"
              value={totalWorthOfStock?.toLocaleString("en-PK")}
              icon={<TagsOutlined />}
              loading={loading}
              valueColor="#a0d911"
            />
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} lg={12} style={{ marginBottom: 24 }}>
            <Card>
              <ReactApexChart
                options={salesGrowthChartOptions}
                series={salesGrowthChartData.series}
                type="line"
                height={320}
                ref={chartRef}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card>
              <ReactApexChart
                options={topSellingProductsChartOptions}
                series={topSellingProductsChartData.series}
                type="bar"
                height={320}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default DashboardPage;
