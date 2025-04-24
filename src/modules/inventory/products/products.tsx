import { useState, useEffect } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Layout,
  Modal,
  Form,
  InputNumber,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnType } from "antd/es/table";

const { Header, Content } = Layout;
const { Option } = Select;

interface Product {
  id: number | string;
  name: string;
  sku: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  category: string;
  supplier_id: number;
  reorder_level: number;
}

const initialDataSource: Product[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  sku: `SKU${(i + 1).toString().padStart(3, "0")}`,
  price: parseFloat((Math.random() * 100).toFixed(2)),
  cost_price: parseFloat((Math.random() * 100).toFixed(2)),
  stock_quantity: Math.floor(Math.random() * 30),
  category: ["shirts", "pants", "accessories"][Math.floor(Math.random() * 3)],
  supplier_id: Math.floor(Math.random() * 10) + 1,
  reorder_level: Math.floor(Math.random() * 10) + 1,
}));

interface StockLocation {
  value: string;
  label: string;
}

const stockLocations: StockLocation[] = [
  { value: "main", label: "Main" },
  { value: "warehouse", label: "Warehouse" },
];

export const Products = () => {
  const [dataSource, setDataSource] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(
    "main"
  );

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    setTimeout(() => {
      setDataSource(initialDataSource);
      setLoading(false);
    }, 500);
  }, []);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleLocationChange = (value: string | undefined) => {
    setSelectedLocation(value);
  };

  const filteredDataSource = dataSource.filter((item) => {
    const searchMatch =
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchText.toLowerCase());
    const categoryMatch =
      selectedCategory === "all" || item.category === selectedCategory;
    return searchMatch && categoryMatch;
  });

  const showAddModal = () => {
    setIsAddModalVisible(true);
  };

  const handleAddCancel = () => {
    setIsAddModalVisible(false);
    form.resetFields();
  };

  const handleAddOk = () => {
    form
      .validateFields()
      .then((values) => {
        const newProduct: Product = {
          id: Date.now().toString(),
          ...values,
        };
        setDataSource([...dataSource, newProduct]);
        setIsAddModalVisible(false);
        form.resetFields();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const showEditModal = (record: Product) => {
    setEditingProduct(record);
    editForm.setFieldsValue(record);
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setEditingProduct(null);
    editForm.resetFields();
  };

  const handleEditOk = () => {
    editForm
      .validateFields()
      .then((values) => {
        const updatedDataSource = dataSource.map((item) =>
          item.id === editingProduct?.id ? { ...item, ...values } : item
        );
        setDataSource(updatedDataSource);
        setIsEditModalVisible(false);
        setEditingProduct(null);
        editForm.resetFields();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleExportCSV = () => {
    const csvData = [
      ["Name", "SKU", "Stock", "Price", "Category"],
      ...filteredDataSource.map((item) => [
        item.name,
        item.sku,
        item.stock_quantity,
        item.price,
        item.category,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const columns: ColumnType<Product>[] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      responsive: ["md"],
      width: 150,
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      responsive: ["sm"],
      width: 120,
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: "Stock",
      dataIndex: "stock_quantity",
      key: "stock",
      width: 80,
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
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 100,
      render: (price: number) => `$${price.toFixed(2)}`,
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      responsive: ["lg"],
      width: 120,
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_: unknown, record: Product) => (
        <Button size="small" onClick={() => showEditModal(record)}>
          Edit
        </Button>
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
        <h1 style={{ margin: 0 }}>Products</h1>
        <div>
          <span>Store: </span>
          <Select
            defaultValue={selectedLocation}
            value={selectedLocation}
            style={{ width: 150 }}
            onChange={handleLocationChange}
          >
            {stockLocations.map((location) => (
              <Option key={location.value} value={location.value}>
                {location.label}
              </Option>
            ))}
          </Select>
        </div>
      </Header>
      <div style={{ padding: "24px" }}>
        <Content style={{ padding: "24px 0" }}>
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginBottom: "16px",
              alignItems: "center",
            }}
          >
            <Input
              placeholder="Search Products"
              prefix={<SearchOutlined />}
              style={{ maxWidth: "300px", flexGrow: 1 }}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <Select
              defaultValue="all"
              style={{ minWidth: "150px" }}
              onChange={handleCategoryChange}
            >
              <Option value="all">Category</Option>
              <Option value="shirts">Shirts</Option>
              <Option value="pants">Pants</Option>
              <Option value="accessories">Accessories</Option>
            </Select>
            <div style={{ marginLeft: "auto", display: "flex", gap: "16px" }}>
              <Button onClick={showAddModal} type="primary">
                Add Product
              </Button>
              <Button onClick={handleExportCSV}>Export CSV</Button>
            </div>
          </div>
          <Table
            dataSource={loading ? [] : filteredDataSource}
            columns={columns}
            pagination={{ pageSize: 9 }}
            scroll={{ x: true }}
            loading={loading}
          />
        </Content>
      </div>

      <Modal
        title="Edit Product"
        open={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: "Please enter product name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="sku"
            label="SKU"
            rules={[{ required: true, message: "Please enter SKU!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="stock_quantity" // Use the correct field name
            label="Stock Quantity"
            rules={[
              { required: true, message: "Please enter stock quantity!" },
            ]}
          >
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: "Please enter price!" }]}
          >
            <InputNumber min={0} step={0.01} />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Please select category!" }]}
          >
            <Select>
              <Option value="shirts">Shirts</Option>
              <Option value="pants">Pants</Option>
              <Option value="accessories">Accessories</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add New Product"
        open={isAddModalVisible}
        onOk={handleAddOk}
        onCancel={handleAddCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: "Please enter product name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="sku"
            label="SKU"
            rules={[{ required: true, message: "Please enter SKU!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="stock_quantity"
            label="Stock Quantity"
            rules={[
              { required: true, message: "Please enter stock quantity!" },
            ]}
          >
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: "Please enter price!" }]}
          >
            <InputNumber min={0} step={0.01} />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Please select category!" }]}
          >
            <Select>
              <Option value="shirts">Shirts</Option>
              <Option value="pants">Pants</Option>
              <Option value="accessories">Accessories</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
