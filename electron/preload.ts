import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  // Product
  getProducts: () => ipcRenderer.invoke("get-products"),
  addProduct: (product: any) => ipcRenderer.invoke("add-product", product),
  editProduct: (id: number, product: any) =>
    ipcRenderer.invoke("edit-product", id, product),
  deleteProduct: (id: number) => ipcRenderer.invoke("delete-product", id),
  deleteMultipleProducts: (ids: number[]) =>
    ipcRenderer.invoke("delete-multiple-products", ids),

  // Category
  getCategories: () => ipcRenderer.invoke("get-categories"),
  addCategory: (category: any) => ipcRenderer.invoke("add-category", category),
  editCategory: (id: number, category: any) =>
    ipcRenderer.invoke("edit-category", id, category),
  deleteCategory: (id: number) => ipcRenderer.invoke("delete-category", id),
  deleteMultipleCategories: (ids: number[]) =>
    ipcRenderer.invoke("delete-multiple-categories", ids),

  // Supplier
  getSuppliers: () => ipcRenderer.invoke("get-suppliers"),
  addSupplier: (supplier: any) => ipcRenderer.invoke("add-supplier", supplier),
  editSupplier: (id: number, supplier: any) =>
    ipcRenderer.invoke("edit-supplier", id, supplier),
  deleteSupplier: (id: number) => ipcRenderer.invoke("delete-supplier", id),
  deleteMultipleSuppliers: (ids: number[]) =>
    ipcRenderer.invoke("delete-multiple-suppliers", ids),

  // Purchase Order
  getPurchaseOrders: () => ipcRenderer.invoke("get-purchase-orders"),
  addPurchaseOrder: (purchaseOrder: any) =>
    ipcRenderer.invoke("add-purchase-order", purchaseOrder),
  editPurchaseOrder: (id: number, purchaseOrder: any) =>
    ipcRenderer.invoke("edit-purchase-order", id, purchaseOrder),
  deletePurchaseOrder: (id: number) =>
    ipcRenderer.invoke("delete-purchase-order", id),
  deleteMultiplePurchaseOrders: (ids: number[]) =>
    ipcRenderer.invoke("delete-multiple-purchase-orders", ids),

  // Customer
  getCustomers: () => ipcRenderer.invoke("get-customers"),
  addCustomer: (customer: any) => ipcRenderer.invoke("add-customer", customer),
  editCustomer: (id: number, customer: any) =>
    ipcRenderer.invoke("edit-customer", id, customer),
  deleteCustomer: (id: number) => ipcRenderer.invoke("delete-customer", id),
  deleteMultipleCustomers: (ids: number[]) =>
    ipcRenderer.invoke("delete-multiple-customers", ids),

  // Sales Order
  getSalesOrders: () => ipcRenderer.invoke("get-sales-orders"),
  addSalesOrder: (salesOrder: any) =>
    ipcRenderer.invoke("add-sales-order", salesOrder),
  editSalesOrder: (id: number, salesOrder: any) =>
    ipcRenderer.invoke("edit-sales-order", id, salesOrder),
  deleteSalesOrder: (id: number) =>
    ipcRenderer.invoke("delete-sales-order", id),
  deleteMultipleSalesOrders: (ids: number[]) =>
    ipcRenderer.invoke("delete-multiple-sales-orders", ids),
});
