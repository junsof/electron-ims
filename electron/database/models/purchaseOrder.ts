import { DataTypes } from "sequelize";
import { sequelize } from "../index";

export const PurchaseOrder = sequelize.define("PurchaseOrder", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  supplierId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  orderDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "received", "cancelled"),
    allowNull: false,
  },
  products: {
    type: DataTypes.JSON,
    allowNull: false,
  },
});
