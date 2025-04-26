import type { IpcMain } from "electron";
import { Customer } from "../models/customer";

export const registerCustomerController = (ipcMain: IpcMain) => {
  ipcMain.handle("get-customers", async () => {
    return await Customer.findAll();
  });
  ipcMain.handle("add-customer", async (event, customer) => {
    return await Customer.create({
      name: customer.name,
      contactPerson: customer.contactPerson,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    });
  });
  ipcMain.handle("edit-customer", async (event, id, customer) => {
    return await Customer.update(
      {
        name: customer.name,
        contactPerson: customer.contactPerson,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      },
      { where: { id } }
    );
  });
  ipcMain.handle("delete-customer", async (event, id) => {
    return await Customer.destroy({ where: { id } });
  });
  ipcMain.handle("delete-multiple-customers", async (event, ids) => {
    return await Customer.destroy({ where: { id: ids } });
  });
};
