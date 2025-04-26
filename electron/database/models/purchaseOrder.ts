import { DataTypes } from "sequelize";
import { sequelize } from "../index";

export const PurchaseOrder = sequelize.define("PurchaseOrder", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  order_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  total_amount: {
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
