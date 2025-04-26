import React, { useState, useEffect } from "react";
import { Table, Input, Button, Layout, Modal, Form, message } from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  PlusOutlined,
  FileExcelOutlined,
  EditOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ColumnType } from "antd/es/table";

const { Header, Content } = Layout;

export const CustomerPage = () => {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<ICustomer | null>(
    null
  );
  const [selectedCustomerKeys, setSelectedCustomerKeys] = useState<React.Key[]>(
    []
  );
  const [searchText, setSearchText] = useState("");

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await window.api.getCustomers();
      setCustomers(
        data.map(
          (c: any): ICustomer => ({
            ...c.dataValues,
            createdAt: new Date(c.dataValues.createdAt),
            updatedAt: new Date(c.dataValues.updatedAt),
          })
        )
      );
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      message.error("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredCustomers = customers.filter((item) => {
    return (
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.contactPerson?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.phone?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.address?.toLowerCase().includes(searchText.toLowerCase())
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
      const newCustomer = await window.api.addCustomer(values);

      const formattedCustomer: ICustomer = {
        ...newCustomer.dataValues,
        createdAt: new Date(newCustomer.dataValues.createdAt),
        updatedAt: new Date(newCustomer.dataValues.updatedAt),
      };

      setCustomers([...customers, formattedCustomer]);
      setIsAddModalVisible(false);
      form.resetFields();
      message.success("Customer added successfully.");
    } catch (error) {
      console.error("Failed to add customer:", error);
      message.error("Failed to add customer.");
    }
  };

  const showEditModal = (record: ICustomer) => {
    setEditingCustomer(record);
    editForm.setFieldsValue(record);
    setIsEditModalVisible(true);
  };
  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    editForm.resetFields();
  };
  const handleEditOk = async () => {
    try {
      if (!editingCustomer?.id) return;
      const values = await editForm.validateFields();
      await window.api.editCustomer(editingCustomer?.id, values);

      const updatedCustomer = {
        ...editingCustomer,
        ...values,
        updatedAt: new Date(),
      };

      setCustomers((prev) =>
        prev.map((cust) =>
          cust.id === editingCustomer?.id ? updatedCustomer : cust
        )
      );
      setIsEditModalVisible(false);
      setEditingCustomer(null);
      message.success("Customer updated successfully.");
    } catch (error) {
      console.error("Failed to edit customer:", error);
      message.error("Failed to edit customer.");
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    Modal.confirm({
      title: "Are you sure you want to delete this customer?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await window.api.deleteCustomer(id);
          setCustomers((prev) => prev.filter((cust) => cust.id !== id));
          message.success("Customer deleted successfully.");
        } catch (error) {
          console.error("Failed to delete customer:", error);
          message.error("Failed to delete customer.");
        }
      },
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedCustomerKeys.length === 0) {
      message.warning("Please select customers to delete.");
      return;
    }

    Modal.confirm({
      title: "Are you sure you want to delete the selected customers?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const idsToDelete = selectedCustomerKeys.map((key) => {
            const customer = customers.find((c) => c.id === key);
            return customer?.id;
          });

          if (idsToDelete.every((id): id is number => typeof id === "number")) {
            await Promise.all(
              idsToDelete.map((id) => window.api.deleteCustomer(id))
            );
            setCustomers((prev) =>
              prev.filter(
                (customer) => !selectedCustomerKeys.includes(customer.id)
              )
            );
            setSelectedCustomerKeys([]); // Clear selection after deletion
            message.success("Selected customers deleted successfully.");
          }
        } catch (error) {
          console.error("Failed to delete selected customers:", error);
          message.error("Failed to delete selected customers.");
        }
      },
    });
  };

  const handleExportCSV = () => {
    const csvData = [
      ["Name", "Contact Person", "Email", "Phone", "Address"],
      ...filteredCustomers.map((item) => [
        item.name,
        item.contactPerson,
        item.email,
        item.phone,
        item.address,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const onSelectChange = (selectedRowKeys: React.Key[]) => {
    setSelectedCustomerKeys(selectedRowKeys);
  };

  const rowSelection = {
    selectedCustomerKeys,
    onChange: onSelectChange,
  };

  const columns: ColumnType<ICustomer>[] = [
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
      title: "Address",
      dataIndex: "address",
      key: "address",
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: "Action",
      key: "action",
      width: 180,
      render: (_: unknown, record: ICustomer) => (
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
            onClick={() => handleDeleteCustomer(record.id)}
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
        <h1 style={{ margin: 0 }}>Customers</h1>
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
            placeholder="Search Customers"
            prefix={<SearchOutlined />}
            style={{ maxWidth: "300px", flexGrow: 1 }}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <div style={{ display: "flex", gap: "16px" }}>
            <Button
              danger
              onClick={handleDeleteSelected}
              disabled={selectedCustomerKeys.length === 0}
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
              <UserOutlined />
              Add Customer
            </Button>
          </div>
        </div>

        <Table
          rowSelection={rowSelection}
          dataSource={loading ? [] : filteredCustomers}
          pagination={{ pageSize: 9 }}
          loading={loading}
          rowKey="id"
          columns={columns as ColumnType<ICustomer>[]}
        />
      </Content>

      <Modal
        title="Add Customer"
        okText="Save Customer"
        open={isAddModalVisible}
        onOk={handleAddOk}
        onCancel={handleAddCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Customer Name"
            rules={[{ required: true, message: "Please enter customer name!" }]}
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
          <Form.Item name="address" label="Address">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Customer"
        okText="Update Customer"
        open={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="Customer Name"
            rules={[{ required: true, message: "Please enter customer name!" }]}
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
          <Form.Item name="address" label="Address">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
