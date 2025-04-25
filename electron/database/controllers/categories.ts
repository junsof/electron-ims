import type { IpcMain } from "electron";
import { Category } from "../models/category";

export const registerCategoryController = (ipcMain: IpcMain) => {
  ipcMain.handle("get-categories", async () => {
    return await Category.findAll();
  });
  ipcMain.handle("add-category", async (event, category) => {
    return await Category.create({
      name: category.name,
      description: category.description,
    });
  });
  ipcMain.handle("edit-category", async (event, id, category) => {
    return await Category.update(
      { name: category.name, description: category.description },
      { where: { id } }
    );
  });
  ipcMain.handle("delete-category", async (event, id) => {
    return await Category.destroy({ where: { id } });
  });
  ipcMain.handle("delete-multiple-categories", async (event, ids) => {
    return await Category.destroy({ where: { id: ids } });
  });
};
