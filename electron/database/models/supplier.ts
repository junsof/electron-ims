import { DataTypes } from "sequelize";
import { sequelize } from "../index";

export const Supplier = sequelize.define("Supplier", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: DataTypes.STRING,
  contactPerson: DataTypes.STRING,
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
});
