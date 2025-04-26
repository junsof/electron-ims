import { DataTypes } from "sequelize";
import { sequelize } from "../index";
import { Category } from "./category";

export const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: DataTypes.STRING,
  sku: DataTypes.STRING,
  upc: DataTypes.STRING,
  costPrice: DataTypes.DECIMAL,
  sellingPrice: DataTypes.DECIMAL,
  stockQuantity: DataTypes.INTEGER,
  category_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Category,
      key: "id",
    },
  },
});
