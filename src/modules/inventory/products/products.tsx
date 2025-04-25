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
} from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  PlusOutlined,
  FileExcelOutlined,
  EditOutlined,
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
        cost_price: Number(values.cost_price),
        selling_price: Number(values.selling_price),
        stock_quantity: Number(values.stock_quantity),
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
        item.stock_quantity,
        item.cost_price,
        item.selling_price,
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
      title: "Cost Price",
      dataIndex: "cost_price",
      key: "cost_price",
      width: 100,
      render: (cost_price: number) => `${cost_price?.toLocaleString("en-PK")}`,
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: "Sale Price",
      dataIndex: "selling_price",
      key: "selling_price",
      width: 100,
      render: (selling_price: number) =>
        `${selling_price?.toLocaleString("en-PK")}`,
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: "Category",
      dataIndex: "category_id",
      key: "category_id",
      responsive: ["lg"],
      width: 120,
      render: (category_id: number) =>
        categories.find((c) => c.id === category_id)?.name,
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: "Action",
      key: "action",
      width: 180,
      render: (_: unknown, record: Product) => (
        <div style={{ display: "flex", gap: "8px" }}>
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
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
  ];

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
            name="stock_quantity"
            label="Stock Quantity"
            rules={[
              { required: true, message: "Please enter stock quantity!" },
            ]}
          >
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item
            name="cost_price"
            label="Cost Price"
            rules={[{ required: true, message: "Please enter cost price!" }]}
          >
            <InputNumber min={0} step={1} />
          </Form.Item>
          <Form.Item
            name="selling_price"
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
            name="stock_quantity"
            label="Stock Quantity"
            rules={[
              { required: true, message: "Please enter stock quantity!" },
            ]}
          >
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item
            name="cost_price"
            label="Cost Price"
            rules={[{ required: true, message: "Please enter cost price!" }]}
          >
            <InputNumber min={0} step={0.01} />
          </Form.Item>
          <Form.Item
            name="selling_price"
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
