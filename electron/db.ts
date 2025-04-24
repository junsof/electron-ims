import { app } from "electron";
import path from "path";
import { Sequelize } from "sequelize";
import sqlite3 from "sqlite3";

const sqlitePath = path.join(app.getPath("userData"), "ims", "database.sqlite");

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: sqlitePath,
  dialectModule: sqlite3,
});
