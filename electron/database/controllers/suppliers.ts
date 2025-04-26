import type { IpcMain } from "electron";
import { Supplier } from "../models/supplier";

export const registerSupplierController = (ipcMain: IpcMain) => {
  ipcMain.handle("get-suppliers", async () => {
    return await Supplier.findAll();
  });
  ipcMain.handle("add-supplier", async (event, supplier) => {
    return await Supplier.create({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
    });
  });
  ipcMain.handle("edit-supplier", async (event, id, supplier) => {
    return await Supplier.update(
      {
        name: supplier.name,
        contactPerson: supplier.contactPerson,
        email: supplier.email,
        phone: supplier.phone,
      },
      { where: { id } }
    );
  });
  ipcMain.handle("delete-supplier", async (event, id) => {
    return await Supplier.destroy({ where: { id } });
  });
  ipcMain.handle("delete-multiple-suppliers", async (event, ids) => {
    return await Supplier.destroy({ where: { id: ids } });
  });
};
