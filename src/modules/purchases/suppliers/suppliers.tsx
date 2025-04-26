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

type Supplier = Window["types"]["Supplier"];

export const SupplierPage = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplierKeys, setSelectedSupplierKeys] = useState<React.Key[]>(
    []
  );
  const [searchText, setSearchText] = useState("");

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await window.api.getSuppliers();
      setSuppliers(data.map((s: any) => s.dataValues));
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
      message.error("Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredSuppliers = suppliers.filter((item) => {
    return (
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.contactPerson?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.phone?.toLowerCase().includes(searchText.toLowerCase())
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
      const newSupplier = await window.api.addSupplier(values);
      setSuppliers([...suppliers, newSupplier.dataValues]);
      setIsAddModalVisible(false);
      form.resetFields();
      message.success("Supplier added successfully.");
    } catch (error) {
      console.error("Failed to add supplier:", error);
      message.error("Failed to add supplier.");
    }
  };

  const showEditModal = (record: Supplier) => {
    setEditingSupplier(record);
    editForm.setFieldsValue(record);
    setIsEditModalVisible(true);
  };
  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    editForm.resetFields();
  };
  const handleEditOk = async () => {
    try {
      if (!editingSupplier?.id) return;
      const values = await editForm.validateFields();
      await window.api.editSupplier(editingSupplier?.id, values);
      setSuppliers((prev) =>
        prev.map((sup) =>
          sup.id === editingSupplier?.id ? { ...sup, ...values } : sup
        )
      );
      setIsEditModalVisible(false);
      setEditingSupplier(null);
      message.success("Supplier updated successfully.");
    } catch (error) {
      console.error("Failed to edit supplier:", error);
      message.error("Failed to edit supplier.");
    }
  };

  const handleDeleteSupplier = async (id: number) => {
    Modal.confirm({
      title: "Are you sure you want to delete this supplier?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await window.api.deleteSupplier(id);
          setSuppliers((prev) => prev.filter((sup) => sup.id !== id));
          message.success("Supplier deleted successfully.");
        } catch (error) {
          console.error("Failed to delete supplier:", error);
          message.error("Failed to delete supplier.");
        }
      },
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedSupplierKeys.length === 0) {
      message.warning("Please select suppliers to delete.");
      return;
    }

    Modal.confirm({
      title: "Are you sure you want to delete the selected suppliers?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const idsToDelete = selectedSupplierKeys.map((key) => {
            const supplier = suppliers.find((s) => s.id === key);
            return supplier?.id;
          });

          if (idsToDelete.every((id): id is number => typeof id === "number")) {
            await Promise.all(
              idsToDelete.map((id) => window.api.deleteSupplier(id))
            );
            setSuppliers((prev) =>
              prev.filter(
                (supplier) => !selectedSupplierKeys.includes(supplier.id)
              )
            );
            setSelectedSupplierKeys([]); // Clear selection after deletion
            message.success("Selected suppliers deleted successfully.");
          }
        } catch (error) {
          console.error("Failed to delete selected suppliers:", error);
          message.error("Failed to delete selected suppliers.");
        }
      },
    });
  };

  const handleExportCSV = () => {
    const csvData = [
      ["Name", "Contact Person", "Email", "Phone"],
      ...filteredSuppliers.map((item) => [
        item.name,
        item.contactPerson,
        item.email,
        item.phone,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "suppliers.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const onSelectChange = (selectedRowKeys: React.Key[]) => {
    setSelectedSupplierKeys(selectedRowKeys);
  };

  const rowSelection = {
    selectedSupplierKeys,
    onChange: onSelectChange,
  };

  const columns: ColumnType<Supplier>[] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: "Contact Person",
      dataIndex: "contactPerson",
      key: "contactPerson",
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: "Action",
      key: "action",
      width: 180,
      render: (_: unknown, record: Supplier) => (
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
            onClick={() => handleDeleteSupplier(record.id)}
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
        <h1 style={{ margin: 0 }}>Suppliers</h1>
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
            placeholder="Search Suppliers"
            prefix={<SearchOutlined />}
            style={{ maxWidth: "300px", flexGrow: 1 }}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <div style={{ display: "flex", gap: "16px" }}>
            <Button
              danger
              onClick={handleDeleteSelected}
              disabled={selectedSupplierKeys.length === 0}
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
              Add Supplier
            </Button>
          </div>
        </div>

        <Table
          rowSelection={rowSelection}
          dataSource={loading ? [] : filteredSuppliers}
          pagination={{ pageSize: 9 }}
          loading={loading}
          rowKey="id"
          columns={columns as ColumnType<Supplier>[]}
        />
      </Content>

      <Modal
        title="Add Supplier"
        okText="Save Supplier"
        open={isAddModalVisible}
        onOk={handleAddOk}
        onCancel={handleAddCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Supplier Name"
            rules={[{ required: true, message: "Please enter supplier name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="contactPerson" label="Contact Person">
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: "email", message: "Please enter a valid email!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Supplier"
        okText="Update Supplier"
        open={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="Supplier Name"
            rules={[{ required: true, message: "Please enter supplier name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="contactPerson" label="Contact Person">
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: "email", message: "Please enter a valid email!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
