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
  addProductStock: (id: number, quantity: number) =>
    ipcRenderer.invoke("add-product-stock", id, quantity),

  // Category
  getCategories: () => ipcRenderer.invoke("get-categories"),
  addCategory: (category: any) => ipcRenderer.invoke("add-category", category),
  editCategory: (id: number, category: any) =>
    ipcRenderer.invoke("edit-category", id, category),
  deleteCategory: (id: number) => ipcRenderer.invoke("delete-category", id),
  deleteMultipleCategories: (ids: number[]) =>
    ipcRenderer.invoke("delete-multiple-categories", ids),
});
