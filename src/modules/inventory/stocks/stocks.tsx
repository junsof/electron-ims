import { useState, useEffect } from "react";
import { Table, Layout } from "antd";
import type { ColumnType } from "antd/es/table";

const { Header, Content } = Layout;

interface StockItem {
  name: string;
  main_stock: number;
  warehouse_stock: number;
}

const initialStockData: StockItem[] = [
  { name: "T-Shirt", main_stock: 15, warehouse_stock: 30 },
  { name: "Jeans", main_stock: 3, warehouse_stock: 10 },
];

export const Stocks = () => {
  const [dataSource, setDataSource] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setDataSource(initialStockData);
      setLoading(false);
    }, 500);
  }, []);

  const columns: ColumnType<StockItem>[] = [
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: "Main",
      dataIndex: "main_stock",
      key: "main_stock",
      render: (stock: number) => (
        <span style={{ color: stock < 5 ? "orange" : "inherit" }}>
          {stock} {stock < 5 && "⚠️"}
        </span>
      ),
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: "Warehouse",
      dataIndex: "warehouse_stock",
      key: "warehouse_stock",
      render: (stock: number) => (
        <span style={{ color: stock < 5 ? "orange" : "inherit" }}>
          {stock} {stock < 5 && "⚠️"}
        </span>
      ),
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
  ];

  return (
    <div>
      <Header
        style={{
          background: "#fff",
          padding: "0 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Stock</h1>
      </Header>
      <Content style={{ padding: "24px" }}>
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          loading={loading}
        />
      </Content>
    </div>
  );
};
