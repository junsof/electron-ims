import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Layout,
  Modal,
  Form,
  InputNumber,
  message,
  Tooltip,
  Space,
} from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  PlusOutlined,
  FileExcelOutlined,
  EditOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import type { ColumnType } from "antd/es/table";

const { Header, Content } = Layout;
const { Option } = Select;

type Product = Window["types"]["Product"];
type Category = Window["types"]["Category"];

export const Products = () => {
  const [dataSource, setDataSource] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProductKeys, setSelectedProductKeys] = useState<React.Key[]>(
    []
  ); // For checkbox selection

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const products = await window.api.getProducts();
        setDataSource(products.map((product) => product.dataValues));
        const categoriesData = await window.api.getCategories();
        setCategories(categoriesData.map((category) => category.dataValues));
      } catch (error) {
        console.error("Failed to fetch data:", error);
        message.error("Failed to load products and categories.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const filteredDataSource = dataSource.filter((item) => {
    const searchMatch =
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchText.toLowerCase());
    const categoryMatch =
      selectedCategory === "all" ||
      item.category_id === Number(selectedCategory);
    return searchMatch && categoryMatch;
  });

  const showAddModal = () => {
    setIsAddModalVisible(true);
  };

  const handleAddCancel = () => {
    setIsAddModalVisible(false);
    form.resetFields();
  };

  const handleAddOk = async () => {
    try {
      const values = await form.validateFields();
      const addedProduct = await window.api.addProduct({
        name: values.name,
        sku: values.sku,
        upc: values.upc,
        costPrice: Number(values.costPrice),
        sellingPrice: Number(values.sellingPrice),
        stockQuantity: Number(values.stockQuantity),
        category_id: Number(values.category_id),
      });
      setDataSource([...dataSource, addedProduct.dataValues]);
      setIsAddModalVisible(false);
      form.resetFields();
      message.success("Product added successfully.");
    } catch (error) {
      console.error("Failed to add product:", error);
      message.error("Failed to add product.");
    }
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

  const handleEditOk = async () => {
    try {
      if (!editingProduct?.id) return;
      const values = await editForm.validateFields();
      await window.api.editProduct(editingProduct?.id, values);
      setDataSource((prev) =>
        prev.map((item) =>
          item.sku === editingProduct?.sku ? { ...item, ...values } : item
        )
      );
      setIsEditModalVisible(false);
      setEditingProduct(null);
      editForm.resetFields();
      message.success("Product updated successfully.");
    } catch (error) {
      console.error("Failed to edit product:", error);
      message.error("Failed to update product.");
    }
  };

  const handleExportCSV = () => {
    const csvData = [
      ["Name", "SKU", "Stock", "Cost Price", "Sale Price", "Category"],
      ...filteredDataSource.map((item) => [
        item.name,
        item.sku,
        item.stockQuantity,
        item.costPrice,
        item.sellingPrice,
        categories.find((c) => c.id === item.category_id)?.name,
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

  const handleDeleteProduct = async (id: number) => {
    Modal.confirm({
      title: "Are you sure you want to delete this product?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await window.api.deleteProduct(id);
          setDataSource((prev) => prev.filter((product) => product.id !== id));
          message.success("Product deleted successfully.");
        } catch (error) {
          console.error("Failed to delete product:", error);
          message.error("Failed to delete product.");
        }
      },
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedProductKeys.length === 0) {
      message.warning("Please select products to delete.");
      return;
    }

    Modal.confirm({
      title: "Are you sure you want to delete the selected products?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const idsToDelete = selectedProductKeys.map((key) => {
            const product = dataSource.find((p) => p.id === key);
            return product?.id;
          });

          if (idsToDelete.every((id): id is number => typeof id === "number")) {
            await Promise.all(
              idsToDelete.map((id) => window.api.deleteProduct(id))
            );
            setDataSource((prev) =>
              prev.filter(
                (product) => !selectedProductKeys.includes(product.id)
              )
            );
            setSelectedProductKeys([]); // Clear selection after deletion
            message.success("Selected products deleted successfully.");
          }
        } catch (error) {
          console.error("Failed to delete selected products:", error);
          message.error("Failed to delete selected products.");
        }
      },
    });
  };

  const onSelectChange = (selectedRowKeys: React.Key[]) => {
    setSelectedProductKeys(selectedRowKeys);
  };

  const rowSelection = {
    selectedProductKeys,
    onChange: onSelectChange,
  };

  const columns: ColumnType<Product>[] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      responsive: ["md"],
      width: 160,
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: (
        <Space>
          SKU
          <Tooltip title="Stock Keeping Unit">
            <InfoCircleOutlined style={{ fontSize: 12, color: "#999" }} />
          </Tooltip>
        </Space>
      ),
      dataIndex: "sku",
      key: "sku",
      responsive: ["sm"],
      width: 100,
      render: (text) => <span>{text}</span>,
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: (
        <Space>
          Barcode
          <Tooltip title="Universal Product Code (UPC)">
            <InfoCircleOutlined style={{ fontSize: 12, color: "#999" }} />
          </Tooltip>
        </Space>
      ),
      dataIndex: "upc",
      key: "upc",
      responsive: ["sm"],
      width: 100,
      render: (text) => <span>{text}</span>,
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: "Stock",
      dataIndex: "stockQuantity",
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
      title: "Cost Price",
      dataIndex: "costPrice",
      key: "costPrice",
      width: 100,
      render: (costPrice: number) => `${costPrice?.toLocaleString("en-PK")}`,
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: "Sale Price",
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      width: 100,
      render: (sellingPrice: number) =>
        `${sellingPrice?.toLocaleString("en-PK")}`,
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: "Category",
      dataIndex: "category_id",
      key: "category_id",
      responsive: ["lg"],
      width: 140,
      render: (category_id: number) =>
        categories.find((c) => c.id === category_id)?.name,
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      align: "right", // Align buttons to the right
      render: (_: unknown, record: Product) => (
        <div
          style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}
        >
          {/* Added justifyContent */}
          <Button
            size="small"
            onClick={() => showEditModal(record)}
            icon={<EditOutlined />}
          >
            Edit
          </Button>
          <Button
            size="small"
            onClick={() => handleDeleteProduct(record.id)}
            danger
            icon={<DeleteOutlined />}
          >
            Delete
          </Button>
        </div>
      ),
      onHeaderCell: () => ({
        style: {
          position: "sticky",
          top: 0,
          zIndex: 1,
          background: "#fff",
          textAlign: "left", // Also align header to the right
        },
      }),
    },
  ];

  // Move 'Action' to the end of the columns array
  const actionColumn = columns.pop();
  if (actionColumn) {
    columns.push(actionColumn);
  }

  return (
    <div>
      <Header style={{ background: "#fff", padding: "0 24px" }}>
        <h1 style={{ margin: 0 }}>Products</h1>
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
              {categories?.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
            <div style={{ marginLeft: "auto", display: "flex", gap: "16px" }}>
              <Button
                danger
                onClick={handleDeleteSelected}
                icon={<DeleteOutlined />}
                disabled={selectedProductKeys.length === 0}
              >
                Delete Selected
              </Button>
              <Button onClick={handleExportCSV} icon={<FileExcelOutlined />}>
                Export CSV
              </Button>
              <Button
                onClick={showAddModal}
                type="primary"
                icon={<PlusOutlined />}
              >
                Add Product
              </Button>
            </div>
          </div>
          <Table
            rowSelection={rowSelection}
            dataSource={loading ? [] : filteredDataSource}
            columns={columns}
            pagination={{ pageSize: 9 }}
            scroll={{ x: true }}
            loading={loading}
            rowKey="id"
          />
        </Content>
      </div>

      <Modal
        title="Edit Product"
        okText="Update Product"
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
            name="upc"
            label="Barcode"
            rules={[{ required: true, message: "Please enter Barcode!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="stockQuantity"
            label="Stock Quantity"
            rules={[
              { required: true, message: "Please enter stock quantity!" },
            ]}
          >
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item
            name="costPrice"
            label="Cost Price"
            rules={[{ required: true, message: "Please enter cost price!" }]}
          >
            <InputNumber min={0} step={1} />
          </Form.Item>
          <Form.Item
            name="sellingPrice"
            label="Sale Price"
            rules={[{ required: true, message: "Please enter sale price!" }]}
          >
            <InputNumber min={0} step={1} />
          </Form.Item>
          <Form.Item
            name="category_id"
            label="Category"
            rules={[{ required: true, message: "Please select category!" }]}
          >
            <Select>
              {categories?.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add New Product"
        open={isAddModalVisible}
        onOk={handleAddOk}
        okText="Save Product"
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
            name="upc"
            label="Barcode"
            rules={[{ required: true, message: "Please enter Barcode!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="stockQuantity"
            label="Stock Quantity"
            rules={[
              { required: true, message: "Please enter stock quantity!" },
            ]}
          >
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item
            name="costPrice"
            label="Cost Price"
            rules={[{ required: true, message: "Please enter cost price!" }]}
          >
            <InputNumber min={0} step={0.01} />
          </Form.Item>
          <Form.Item
            name="sellingPrice"
            label="Sale Price"
            rules={[{ required: true, message: "Please enter sale price!" }]}
          >
            <InputNumber min={0} step={0.01} />
          </Form.Item>
          <Form.Item
            name="category_id"
            label="Category"
            rules={[{ required: true, message: "Please select category!" }]}
          >
            <Select>
              {categories?.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
