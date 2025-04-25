import React, { useState, useEffect } from "react";
import { Table, Input, Button, Layout, Modal, Form, message } from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  PlusOutlined,
  FileExcelOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { ColumnType } from "antd/es/table";

const { Header, Content } = Layout;

type Category = Window["types"]["Category"];

export const CategoryPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategoryKeys, setSelectedCategoryKeys] = useState<React.Key[]>(
    []
  );
  const [searchText, setSearchText] = useState("");

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await window.api.getCategories();
      setCategories(data.map((c: any) => c.dataValues));
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      message.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredCategories = categories.filter((item) => {
    return (
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const showAddModal = () => setIsAddModalVisible(true);
  const handleAddCancel = () => {
    setIsAddModalVisible(false);
    form.resetFields();
  };
  const handleAddOk = async () => {
    try {
      const values = await form.validateFields();
      const newCategory = await window.api.addCategory(values);
      setCategories([...categories, newCategory.dataValues]);
      setIsAddModalVisible(false);
      form.resetFields();
      message.success("Category added successfully.");
    } catch (error) {
      console.error("Failed to add category:", error);
      message.error("Failed to add category.");
    }
  };

  const showEditModal = (record: Category) => {
    setEditingCategory(record);
    editForm.setFieldsValue(record);
    setIsEditModalVisible(true);
  };
  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    editForm.resetFields();
  };
  const handleEditOk = async () => {
    try {
      if (!editingCategory?.id) return;
      const values = await editForm.validateFields();
      await window.api.editCategory(editingCategory?.id, values);
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory?.id ? { ...cat, ...values } : cat
        )
      );
      setIsEditModalVisible(false);
      setEditingCategory(null);
      message.success("Category updated successfully.");
    } catch (error) {
      console.error("Failed to edit category:", error);
      message.error("Failed to edit category.");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    Modal.confirm({
      title: "Are you sure you want to delete this category?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await window.api.deleteCategory(id);
          setCategories((prev) => prev.filter((cat) => cat.id !== id));
          message.success("Category deleted successfully.");
        } catch (error) {
          console.error("Failed to delete category:", error);
          message.error("Failed to delete category.");
        }
      },
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedCategoryKeys.length === 0) {
      message.warning("Please select categories to delete.");
      return;
    }

    Modal.confirm({
      title: "Are you sure you want to delete the selected categories?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const idsToDelete = selectedCategoryKeys.map((key) => {
            const category = categories.find((c) => c.id === key);
            return category?.id;
          });

          if (idsToDelete.every((id): id is number => typeof id === "number")) {
            await Promise.all(
              idsToDelete.map((id) => window.api.deleteCategory(id))
            );
            setCategories((prev) =>
              prev.filter(
                (category) => !selectedCategoryKeys.includes(category.id)
              )
            );
            setSelectedCategoryKeys([]); // Clear selection after deletion
            message.success("Selected categories deleted successfully.");
          }
        } catch (error) {
          console.error("Failed to delete selected categories:", error);
          message.error("Failed to delete selected categories.");
        }
      },
    });
  };

  const handleExportCSV = () => {
    const csvData = [
      ["Name", "Description"],
      ...filteredCategories.map((item) => [item.name, item.description]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "categories.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const onSelectChange = (selectedRowKeys: React.Key[]) => {
    setSelectedCategoryKeys(selectedRowKeys);
  };

  const rowSelection = {
    selectedCategoryKeys,
    onChange: onSelectChange,
  };

  const columns: ColumnType<Category>[] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: "Action",
      key: "action",
      width: 180,
      render: (_: unknown, record: Category) => (
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
            onClick={() => handleDeleteCategory(record.id)}
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
        <h1 style={{ margin: 0 }}>Categories</h1>
      </Header>

      <Content style={{ padding: "24px" }}>
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Input
            placeholder="Search Categories"
            prefix={<SearchOutlined />}
            style={{ maxWidth: "300px", flexGrow: 1 }}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <div style={{ display: "flex", gap: "16px" }}>
            <Button
              danger
              onClick={handleDeleteSelected}
              disabled={selectedCategoryKeys.length === 0}
              icon={<DeleteOutlined />}
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
              Add Category
            </Button>
          </div>
        </div>

        <Table
          rowSelection={rowSelection}
          dataSource={loading ? [] : filteredCategories}
          pagination={{ pageSize: 9 }}
          loading={loading}
          rowKey="id"
          columns={columns as ColumnType<Category>[]}
        />
      </Content>

      <Modal
        title="Add Category"
        okText="Save Category"
        open={isAddModalVisible}
        onOk={handleAddOk}
        onCancel={handleAddCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: "Please enter category name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Category"
        okText="Update Category"
        open={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: "Please enter category name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
