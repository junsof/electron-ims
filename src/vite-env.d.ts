/// <reference types="vite/client" />

interface IProduct {
  id: number;
  name: string;
  sku: string;
  upc: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  category_id: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ICategory {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ISupplier {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IPurchaseOrder {
  id: number;
  supplierId: number;
  orderDate: Date;
  products: {
    product_id: number;
    quantity: number;
    price: number; // Price at which the product was purchased.  Important for history.
  }[];
  totalAmount: number;
  status: "pending" | "received" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

interface ISalesOrder {
  id: number;
  customerId: number;
  orderDate: Date;
  products: {
    product_id: number;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ICustomer {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Window {
  api: {
    // Product
    getProducts: () => Promise<{ dataValues: IProduct }[]>;
    addProduct: (
      product: Omit<IProduct, "id" | "createdAt" | "updatedAt">
    ) => Promise<{ dataValues: IProduct }>;
    editProduct: (
      id: number,
      product: Omit<IProduct, "id" | "createdAt" | "updatedAt">
    ) => Promise<number[]>;
    deleteProduct: (id: number) => Promise<number[]>;
    deleteMultipleProducts: (ids: number[]) => Promise<number[]>;
    addProductStock: (id: number, quantity: number) => Promise<number[]>;
    // Category
    getCategories: () => Promise<{ dataValues: ICategory }[]>;
    addCategory: (
      category: Omit<ICategory, "id" | "createdAt" | "updatedAt">
    ) => Promise<{ dataValues: ICategory }>;
    editCategory: (
      id: number,
      category: Omit<ICategory, "id" | "createdAt" | "updatedAt">
    ) => Promise<number[]>;
    deleteCategory: (id: number) => Promise<number[]>;
    deleteMultipleCategories: (ids: number[]) => Promise<number[]>;
    // Supplier
    getSuppliers: () => Promise<{ dataValues: ISupplier }[]>;
    addSupplier: (
      supplier: Omit<ISupplier, "id" | "createdAt" | "updatedAt">
    ) => Promise<{ dataValues: ISupplier }>;
    editSupplier: (
      id: number,
      supplier: Omit<ISupplier, "id" | "createdAt" | "updatedAt">
    ) => Promise<number[]>;
    deleteSupplier: (id: number) => Promise<number[]>;
    deleteMultipleSuppliers: (ids: number[]) => Promise<number[]>;
    // Purchase Order
    getPurchaseOrders: () => Promise<{ dataValues: IPurchaseOrder }[]>;
    addPurchaseOrder: (
      purchaseOrder: Omit<IPurchaseOrder, "id" | "createdAt" | "updatedAt">
    ) => Promise<{ dataValues: IPurchaseOrder }>;
    editPurchaseOrder: (
      id: number,
      purchaseOrder: Omit<IPurchaseOrder, "id" | "createdAt" | "updatedAt">
    ) => Promise<number[]>;
    deletePurchaseOrder: (id: number) => Promise<number[]>;
    deleteMultiplePurchaseOrders: (ids: number[]) => Promise<number[]>;
    // Customer
    getCustomers: () => Promise<{ dataValues: ICustomer }[]>;
    addCustomer: (
      customer: Omit<ICustomer, "id" | "createdAt" | "updatedAt">
    ) => Promise<{ dataValues: ICustomer }>;
    editCustomer: (
      id: number,
      customer: Omit<ICustomer, "id" | "createdAt" | "updatedAt">
    ) => Promise<number[]>;
    deleteCustomer: (id: number) => Promise<number[]>;
    deleteMultipleCustomers: (ids: number[]) => Promise<number[]>;
    // Sales Order
    getSalesOrders: () => Promise<{ dataValues: ISalesOrder }[]>;
    addSalesOrder: (
      salesOrder: Omit<ISalesOrder, "id" | "createdAt" | "updatedAt">
    ) => Promise<{ dataValues: ISalesOrder }>;
    editSalesOrder: (
      id: number,
      salesOrder: Omit<ISalesOrder, "id" | "createdAt" | "updatedAt">
    ) => Promise<number[]>;
    deleteSalesOrder: (id: number) => Promise<number[]>;
    deleteMultipleSalesOrders: (ids: number[]) => Promise<number[]>;
  };
  types: {
    Product: IProduct;
    Category: ICategory;
    Supplier: ISupplier;
    PurchaseOrder: IPurchaseOrder;
    Customer: ICustomer;
    SalesOrder: ISalesOrder;
  };
}
