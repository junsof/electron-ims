import type { IpcMain } from "electron";
import { Product } from "../models/product";

export const registerProductController = (ipcMain: IpcMain) => {
  ipcMain.handle("get-products", async () => {
    return await Product.findAll();
  });
  ipcMain.handle("add-product", async (event, product) => {
    return await Product.create({
      name: product.name,
      sku: product.sku,
      upc: product.upc,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      stockQuantity: product.stockQuantity,
      category_id: product.category_id,
    });
  });
  ipcMain.handle("edit-product", async (event, id, product) => {
    return await Product.update(
      {
        name: product.name,
        sku: product.sku,
        upc: product.upc,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        stockQuantity: product.stockQuantity,
        category_id: product.category_id,
      },
      { where: { id } }
    );
  });
  ipcMain.handle("delete-product", async (event, id) => {
    return await Product.destroy({ where: { id } });
  });
  ipcMain.handle("delete-multiple-products", async (event, ids) => {
    return await Product.destroy({ where: { id: ids } });
  });
};
