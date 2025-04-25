import type { IpcMain } from "electron";

import { registerProductController } from "./product";
import { registerCategoryController } from "./categories";

export const registerControllers = (ipcMain: IpcMain) => {
  registerProductController(ipcMain);
  registerCategoryController(ipcMain);
};
