import { Layout, Card, Row, Col, List } from "antd";
import type { ApexOptions } from "apexcharts";

import ReactApexChart from "react-apexcharts";

const { Header, Content } = Layout;

export const Dashboard = () => {
  const totalSales = 12580;
  const lowStockCount = 5;
  const pendingOrdersCount = 3;
  const todaysRevenue = 850;
  const recentActivityData = [
    { id: 1, text: "Sale #1001 - $50 (2 mins ago)" },
    { id: 2, text: "Return #205 - $20 (1 hour ago)" },
  ];

  const chartState: { options: ApexOptions; series: ApexAxisChartSeries } = {
    series: [
      {
        name: "Sales",
        data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
      },
    ],
    options: {
      chart: {
        type: "area",
        height: 350,
        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
      xaxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
        ],
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm",
        },
        followCursor: false,
      },
    },
  };

  const cardHeight = 400;

  return (
    <div>
      <Header style={{ background: "#fff", padding: "0 24px" }}>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
      </Header>

      <Content style={{ padding: "24px", minHeight: 280 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Card title="Total Sales">${totalSales.toLocaleString()}</Card>
          </Col>
          <Col span={6}>
            <Card title="Low Stock">{lowStockCount} Items</Card>
          </Col>
          <Col span={6}>
            <Card title="Pending Orders">{pendingOrdersCount}</Card>
          </Col>
          <Col span={6}>
            <Card title="Today's Revenue">
              ${todaysRevenue.toLocaleString()}
            </Card>
          </Col>
        </Row>

        <div style={{ marginTop: "24px" }}>
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Recent Activity" style={{ height: cardHeight }}>
                <div style={{ overflowY: "auto", maxHeight: cardHeight - 60 }}>
                  <List
                    dataSource={recentActivityData}
                    renderItem={(item) => (
                      <List.Item key={item.id}>{item.text}</List.Item>
                    )}
                  />
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card
                title="Sales Overview"
                style={{ width: "100%", height: cardHeight }}
              >
                <ReactApexChart
                  options={chartState.options}
                  series={chartState.series}
                  type="area"
                  height={cardHeight - 100}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </div>
  );
};
