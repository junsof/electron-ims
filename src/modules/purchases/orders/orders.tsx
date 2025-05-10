import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Input,
  Button,
  Layout,
  Modal,
  Form,
  Select,
  DatePicker,
  InputNumber,
  message,
  Tag,
  type FormInstance,
} from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  PlusOutlined,
  FileExcelOutlined,
  EditOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import type { ColumnType } from "antd/es/table";
import moment from "moment";

const { Header, Content } = Layout;
const { Option } = Select;

type ISupplier = Window["types"]["Supplier"];
type IProduct = Window["types"]["Product"];
type IPurchaseOrder = Window["types"]["PurchaseOrder"];
type IPurchaseOrderProduct =
  Window["types"]["PurchaseOrder"]["products"][number];

const PurchaseOrderPage = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<IPurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingPurchaseOrder, setEditingPurchaseOrder] =
    useState<IPurchaseOrder | null>(null);
  const [selectedPurchaseOrderKeys, setSelectedPurchaseOrderKeys] = useState<
    React.Key[]
  >([]);
  const [searchText, setSearchText] = useState("");
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const orders = await window.api.getPurchaseOrders();
      const suppliersData = await window.api.getSuppliers();
      const productsData = await window.api.getProducts();

      // Convert date strings to Date objects.  Crucial for DatePicker and consistency.
      const formattedOrders = orders.map((order: any) => ({
        ...order.dataValues,
        orderDate: new Date(order.dataValues.orderDate),
      }));

      setPurchaseOrders(formattedOrders);
      setSuppliers(suppliersData.map((s: any) => s.dataValues));
      setProducts(productsData.map((p: any) => p.dataValues));
    } catch (error) {
      console.error("Failed to fetch data:", error);
      message.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Helper Functions ---
  const getSupplierName = (supplierId: number) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier ? supplier.name : "Unknown Supplier";
  };

  const getProductName = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : "Unknown Product";
  };

  const calculateTotalPrice = (products: IPurchaseOrderProduct[]): number => {
    return products.reduce(
      (total, product) => total + product.quantity * product.price,
      0
    );
  };

  // --- Search ---
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredPurchaseOrders = purchaseOrders.filter((order) => {
    const supplierName = getSupplierName(order.supplierId).toLowerCase();
    const orderDate = moment(order.orderDate).format("YYYY-MM-DD"); // Format for comparison
    const productNames = order.products
      .map((p) => getProductName(p.product_id).toLowerCase())
      .join(", ");

    return (
      supplierName.includes(searchText.toLowerCase()) ||
      orderDate.includes(searchText) ||
      productNames.includes(searchText.toLowerCase())
    );
  });

  // --- Add ---
  const showAddModal = () => setIsAddModalVisible(true);
  const handleAddCancel = () => {
    setIsAddModalVisible(false);
    form.resetFields();
  };

  const handleAddOk = async () => {
    try {
      const values = await form.validateFields();

      // Convert the date using moment
      const orderDate = moment(values.orderDate).toDate();

      const newOrder: Omit<IPurchaseOrder, "id" | "createdAt" | "updatedAt"> = {
        supplierId: values.supplierId,
        orderDate: orderDate,
        products: values.products.map((p: any) => ({
          product_id: p.product_id,
          quantity: p.quantity,
          price: p.price,
        })),
        totalAmount: calculateTotalPrice(
          values.products.map((p: any) => ({
            product_id: p.product_id,
            quantity: p.quantity,
            price: p.price,
          }))
        ),
        status: values.status,
      };

      const createdOrder = await window.api.addPurchaseOrder(newOrder);

      // Convert date from string to Date object
      const formattedCreatedOrder = {
        ...createdOrder.dataValues,
        orderDate: new Date(createdOrder.dataValues.orderDate),
      };

      setPurchaseOrders([...purchaseOrders, formattedCreatedOrder]);
      setIsAddModalVisible(false);
      form.resetFields();
      message.success("Purchase Order added successfully.");
    } catch (error) {
      console.error("Failed to add purchase order:", error);
      message.error("Failed to add purchase order.");
    }
  };

  // --- Edit ---
  const showEditModal = (record: IPurchaseOrder) => {
    setEditingPurchaseOrder(record);

    // Format the date for the DatePicker
    editForm.setFieldsValue({
      ...record,
      orderDate: moment(record.orderDate),
    });
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    editForm.resetFields();
  };

  const handleEditOk = async () => {
    try {
      if (!editingPurchaseOrder?.id) return;
      const values = await editForm.validateFields();

      const updatedOrder: Omit<
        IPurchaseOrder,
        "id" | "createdAt" | "updatedAt"
      > = {
        supplierId: values.supplierId,
        orderDate: moment(values.orderDate).toDate(),
        products: values.products.map((p: any) => ({
          product_id: p.product_id,
          quantity: p.quantity,
          price: p.price,
        })),
        totalAmount: calculateTotalPrice(
          values.products.map((p: any) => ({
            product_id: p.product_id,
            quantity: p.quantity,
            price: p.price,
          }))
        ),
        status: values.status,
      };

      await window.api.editPurchaseOrder(editingPurchaseOrder.id, updatedOrder);

      const updatedOrderWithId = {
        ...updatedOrder,
        id: editingPurchaseOrder.id,
        createdAt: editingPurchaseOrder.createdAt,
        updatedAt: new Date(),
      };

      setPurchaseOrders((prev) =>
        prev.map((order) =>
          order.id === editingPurchaseOrder.id ? updatedOrderWithId : order
        )
      );
      setIsEditModalVisible(false);
      setEditingPurchaseOrder(null);
      message.success("Purchase Order updated successfully.");
    } catch (error) {
      console.error("Failed to edit purchase order:", error);
      message.error("Failed to edit purchase order.");
    }
  };

  // --- Delete ---
  const handleDeletePurchaseOrder = async (id: number) => {
    Modal.confirm({
      title: "Are you sure you want to delete this purchase order?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await window.api.deletePurchaseOrder(id);
          setPurchaseOrders((prev) => prev.filter((order) => order.id !== id));
          message.success("Purchase Order deleted successfully.");
        } catch (error) {
          console.error("Failed to delete purchase order:", error);
          message.error("Failed to delete purchase order.");
        }
      },
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedPurchaseOrderKeys.length === 0) {
      message.warning("Please select purchase orders to delete.");
      return;
    }

    Modal.confirm({
      title: "Are you sure you want to delete the selected purchase orders?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const idsToDelete = selectedPurchaseOrderKeys.map((key) => {
            const order = purchaseOrders.find((o) => o.id === key);
            return order?.id;
          });

          if (idsToDelete.every((id): id is number => typeof id === "number")) {
            await Promise.all(
              idsToDelete.map((id) => window.api.deletePurchaseOrder(id))
            );
            setPurchaseOrders((prev) =>
              prev.filter(
                (order) => !selectedPurchaseOrderKeys.includes(order.id)
              )
            );
            setSelectedPurchaseOrderKeys([]); // Clear selection
            message.success("Selected purchase orders deleted successfully.");
          }
        } catch (error) {
          console.error("Failed to delete selected purchase orders:", error);
          message.error("Failed to delete selected purchase orders.");
        }
      },
    });
  };

  // --- Export CSV ---
  const handleExportCSV = () => {
    const csvData = [
      [
        "Order ID",
        "Supplier",
        "Order Date",
        "Products",
        "Status",
        "Total Amount",
      ],
      ...filteredPurchaseOrders.map((order) => {
        const supplierName = getSupplierName(order.supplierId);
        const orderDate = moment(order.orderDate).format("YYYY-MM-DD");
        const productList = order.products
          .map(
            (p) =>
              `${getProductName(p.product_id)} (Qty: ${p.quantity}, Price: ${
                p.price
              })`
          )
          .join(", ");
        const totalAmount = order.totalAmount;
        const status = order.status;

        return [
          order.id,
          supplierName,
          orderDate,
          productList,
          status,
          totalAmount,
        ];
      }),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "purchase_orders.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // --- Table Row Selection ---
  const onSelectChange = (selectedRowKeys: React.Key[]) => {
    setSelectedPurchaseOrderKeys(selectedRowKeys);
  };

  const rowSelection = {
    selectedPurchaseOrderKeys,
    onChange: onSelectChange,
  };

  // --- Table Columns ---
  const columns: ColumnType<IPurchaseOrder>[] = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: "Supplier",
      dataIndex: "supplierId",
      key: "supplierId",
      render: (supplierId) => getSupplierName(supplierId),
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date) => moment(date).format("YYYY-MM-DD"),
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: "Products",
      dataIndex: "products",
      key: "products",
      render: (products: IPurchaseOrderProduct[]) => (
        <div>
          {products.map((product) => (
            <div key={product.product_id}>
              {getProductName(product.product_id)} (Qty: {product.quantity},
              Price: {product.price?.toLocaleString("en-PK")})
            </div>
          ))}
        </div>
      ),
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => amount?.toLocaleString("en-PK"),
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      onHeaderCell: () => ({
        style: { position: "sticky", top: 0, zIndex: 1, background: "#fff" },
      }),
      render: (status) => {
        let color = "";
        switch (status) {
          case "pending":
            color = "yellow";
            break;
          case "received":
            color = "green";
            break;
          case "cancelled":
            color = "red";
            break;
          default:
            color = "gray";
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      width: 180,
      render: (_: unknown, record: IPurchaseOrder) => (
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
            onClick={() => handleDeletePurchaseOrder(record.id)}
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

  // --- Add/Edit Form ---
  const purchaseOrderForm = (
    _: FormInstance,
    availableSuppliers: ISupplier[],
    availableProducts: IProduct[]
  ) => [
    {
      name: "supplierId",
      label: "Supplier",
      rules: [{ required: true, message: "Please select a supplier!" }],
      children: (
        <Select>
          {availableSuppliers.map((supplier) => (
            <Option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      name: "orderDate",
      label: "Order Date",
      rules: [{ required: true, message: "Please select order date!" }],
      children: <DatePicker style={{ width: "100%" }} />,
    },
    {
      name: "status",
      label: "Status",
      rules: [{ required: true, message: "Please select status!" }],
      children: (
        <Select>
          <Option value="pending">Pending</Option>
          <Option value="received">Received</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>
      ),
    },
    {
      name: "products",
      label: "Products",
      rules: [{ required: true, message: "Please select products!" }],
      children: (
        <Form.List name="products">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <div
                  key={field.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 8,
                    gap: 8,
                  }}
                >
                  <Form.Item
                    {...field}
                    name={[field.name, "product_id"]}
                    label={index === 0 ? "Product" : ""}
                    rules={[
                      { required: true, message: "Please select product" },
                    ]}
                    style={{ flex: 2 }}
                  >
                    <Select
                      showSearch
                      filterOption={(input, option: any) => {
                        const label =
                          typeof option.children === "string"
                            ? option.children
                            : Array.isArray(option.children)
                            ? option.children.join("")
                            : "";
                        return (
                          label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        );
                      }}
                    >
                      {availableProducts.map((product) => (
                        <Option key={product.id} value={product.id}>
                          {product.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, "quantity"]}
                    label={index === 0 ? "Quantity" : ""}
                    rules={[
                      { required: true, message: "Please enter quantity" },
                    ]}
                    style={{ flex: 1 }}
                  >
                    <InputNumber min={1} />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, "price"]}
                    label={index === 0 ? "Price" : ""}
                    rules={[{ required: true, message: "Please enter price" }]}
                    style={{ flex: 1 }}
                  >
                    <InputNumber min={0} />
                  </Form.Item>
                  {fields.length > 1 ? (
                    <Button
                      type="dashed"
                      onClick={() => remove(field.name)}
                      icon={<DeleteOutlined />}
                      style={index !== 0 ? { marginBottom: 24 } : {}}
                    />
                  ) : null}
                </div>
              ))}
              <Button
                type="dashed"
                onClick={() => add()}
                style={{ width: "100%" }}
                icon={<PlusOutlined />}
              >
                Add Product
              </Button>
            </>
          )}
        </Form.List>
      ),
    },
  ];

  return (
    <div>
      <Header style={{ background: "#fff", padding: "0 24px" }}>
        <h1 style={{ margin: 0 }}>Purchase Orders</h1>
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
            placeholder="Search Purchase Orders"
            prefix={<SearchOutlined />}
            style={{ maxWidth: "300px", flexGrow: 1 }}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <div style={{ display: "flex", gap: "16px" }}>
            <Button
              danger
              onClick={handleDeleteSelected}
              disabled={selectedPurchaseOrderKeys.length === 0}
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
              <ShoppingCartOutlined />
              Add Order
            </Button>
          </div>
        </div>

        <Table
          rowSelection={rowSelection}
          dataSource={loading ? [] : filteredPurchaseOrders}
          pagination={{ pageSize: 9 }}
          loading={loading}
          rowKey="id"
          columns={columns as ColumnType<IPurchaseOrder>[]}
        />
      </Content>

      <Modal
        title="Add Purchase Order"
        okText="Save Order"
        open={isAddModalVisible}
        onOk={handleAddOk}
        onCancel={handleAddCancel}
      >
        <Form form={form} layout="vertical">
          {purchaseOrderForm(form, suppliers, products).map(
            (
              item // Pass the form instance
            ) => (
              <Form.Item key={item.name} {...item}>
                {item.children}
              </Form.Item>
            )
          )}
        </Form>
      </Modal>

      <Modal
        title="Edit Purchase Order"
        okText="Update Order"
        open={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
      >
        <Form form={editForm} layout="vertical">
          {purchaseOrderForm(editForm, suppliers, products).map(
            (
              item // Pass the editForm instance
            ) => (
              <Form.Item key={item.name} {...item}>
                {item.children}
              </Form.Item>
            )
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default PurchaseOrderPage;
