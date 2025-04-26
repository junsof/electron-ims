import type { IpcMain } from "electron";

import { registerProductController } from "./products";
import { registerCategoryController } from "./categories";
import { registerSupplierController } from "./suppliers";
import { registerPurchaseOrderController } from "./purchaseOrder";
import { registerCustomerController } from "./customer";
import { registerSaleOrderController } from "./saleOrder";

export const registerControllers = (ipcMain: IpcMain) => {
  registerProductController(ipcMain);
  registerCategoryController(ipcMain);
  registerSupplierController(ipcMain);
  registerPurchaseOrderController(ipcMain);
  registerCustomerController(ipcMain);
  registerSaleOrderController(ipcMain);
};
