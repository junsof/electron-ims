import type { IpcMain } from "electron";
import { PurchaseOrder } from "../models/purchaseOrder";

export const registerPurchaseOrderController = (ipcMain: IpcMain) => {
  ipcMain.handle("get-purchase-orders", async () => {
    return await PurchaseOrder.findAll();
  });
  ipcMain.handle("add-purchase-order", async (event, purchaseOrder) => {
    return await PurchaseOrder.create({
      supplierId: purchaseOrder.supplierId,
      orderDate: purchaseOrder.orderDate,
      totalAmount: purchaseOrder.totalAmount,
      status: purchaseOrder.status,
      products: purchaseOrder.products,
    });
  });
  ipcMain.handle("edit-purchase-order", async (event, id, purchaseOrder) => {
    return await PurchaseOrder.update(
      {
        supplierId: purchaseOrder.supplierId,
        orderDate: purchaseOrder.orderDate,
        totalAmount: purchaseOrder.totalAmount,
        status: purchaseOrder.status,
        products: purchaseOrder.products,
      },
      { where: { id } }
    );
  });
  ipcMain.handle("delete-purchase-order", async (event, id) => {
    return await PurchaseOrder.destroy({ where: { id } });
  });
  ipcMain.handle("delete-multiple-purchase-orders", async (event, ids) => {
    return await PurchaseOrder.destroy({ where: { id: ids } });
  });
};
