import type { IpcMain } from "electron";
import { SaleOrder } from "../models/saleOrder";

export const registerSaleOrderController = (ipcMain: IpcMain) => {
  ipcMain.handle("get-sales-orders", async () => {
    return await SaleOrder.findAll();
  });
  ipcMain.handle("add-sales-order", async (event, saleOrder) => {
    return await SaleOrder.create({
      customer_id: saleOrder.customer_id,
      order_date: saleOrder.order_date,
      total_amount: saleOrder.total_amount,
      status: saleOrder.status,
      products: saleOrder.products,
    });
  });
  ipcMain.handle("edit-sales-order", async (event, id, saleOrder) => {
    return await SaleOrder.update(
      {
        customer_id: saleOrder.customer_id,
        order_date: saleOrder.order_date,
        total_amount: saleOrder.total_amount,
        status: saleOrder.status,
        products: saleOrder.products,
      },
      { where: { id } }
    );
  });
  ipcMain.handle("delete-sales-order", async (event, id) => {
    return await SaleOrder.destroy({ where: { id } });
  });
  ipcMain.handle("delete-multiple-sales-orders", async (event, ids) => {
    return await SaleOrder.destroy({ where: { id: ids } });
  });
};
